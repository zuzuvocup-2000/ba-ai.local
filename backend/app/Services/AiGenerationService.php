<?php

namespace App\Services;

use App\AI\ClaudeClient;
use App\AI\PromptBuilderInterface;
use App\AI\Prompts\BrdPromptBuilder;
use App\AI\Prompts\FlowDiagramPromptBuilder;
use App\AI\Prompts\SqlLogicPromptBuilder;
use App\AI\Prompts\BusinessRulesPromptBuilder;
use App\AI\Prompts\ValidationRulesPromptBuilder;
use App\AI\Prompts\TestCasesPromptBuilder;
use App\AI\Prompts\ChecklistPromptBuilder;
use App\Models\AiGenerationLog;
use App\Models\Document;
use App\Models\RequirementAnalysis;
use App\Models\Requirement;
use Throwable;

class AiGenerationService
{
    public function __construct(
        private readonly ClaudeClient $claudeClient,
        private readonly MongoLogService $mongoLogService,
    ) {}

    /** Generate a document from a RequirementAnalysis */
    public function generate(RequirementAnalysis $analysis, int $userId): Document
    {
        $requirement = $analysis->requirement;
        $docType     = $analysis->document_type;
        $builder     = $this->resolveBuilder($docType);

        // 1. Create log entry
        $log = AiGenerationLog::create([
            'requirement_id' => $requirement->id,
            'analysis_id'    => $analysis->id,
            'log_type'       => 'generation',
            'status'         => 'processing',
            'created_by'     => $userId,
        ]);

        try {
            $systemPrompt = $builder->systemPrompt();
            $userPrompt   = $builder->userPrompt($analysis, $requirement);

            // 2. Call Claude
            $result = $this->claudeClient->generate($systemPrompt, $userPrompt);

            // 3. Log to MongoDB
            $mongoId = uniqid('ai_', true);
            $this->mongoLogService->write('ai_generation', [
                'requirement_id' => $requirement->id,
                'document_type'  => $docType,
                'model'          => $result['model'],
                'system_prompt'  => $systemPrompt,
                'user_prompt'    => $userPrompt,
                'response_text'  => $result['content'],
                'tokens_input'   => $result['input_tokens'],
                'tokens_output'  => $result['output_tokens'],
                'duration_ms'    => $result['duration_ms'],
                'status'         => 'success',
            ]);

            // 4. Create or update document
            $document = Document::updateOrCreate(
                ['requirement_id' => $requirement->id, 'type' => $docType],
                [
                    'title'       => $builder->documentTitle($requirement),
                    'content'     => $result['content'],
                    'status'      => 'generated',
                    'template_id' => null,
                    'created_by'  => $userId,
                    'updated_by'  => $userId,
                ]
            );

            // 5. Update log
            $log->update([
                'document_id'     => $document->id,
                'model_used'      => $result['model'],
                'tokens_input'    => $result['input_tokens'],
                'tokens_output'   => $result['output_tokens'],
                'duration_ms'     => $result['duration_ms'],
                'status'          => 'success',
                'mongo_detail_id' => $mongoId,
            ]);

            // 6. Link generation_log to document
            $document->update(['generation_log_id' => $log->id]);

            return $document;
        } catch (Throwable $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 490),
            ]);
            throw $e;
        }
    }

    /** Pre-fill analysis form from raw content — returns array, does NOT save */
    public function prefillAnalysis(Requirement $requirement, string $docType, int $userId): array
    {
        $systemPrompt = <<<SYSTEM
Bạn là Business Analyst cấp cao. Nhiệm vụ của bạn là đọc nội dung yêu cầu thô và trích xuất các thông tin có cấu trúc để điền vào form phân tích yêu cầu. Hãy trả lời bằng JSON hợp lệ, không có markdown, không có giải thích thêm.
SYSTEM;

        $docTypeLabel = [
            'brd'              => 'BRD (Business Requirements Document)',
            'flow_diagram'     => 'Flow Diagram',
            'sql_logic'        => 'SQL Logic',
            'business_rules'   => 'Business Rules',
            'validation_rules' => 'Validation Rules',
            'test_cases'       => 'Test Cases',
            'checklist'        => 'Checklist',
        ][$docType] ?? $docType;

        $userPrompt = <<<PROMPT
Hãy phân tích nội dung yêu cầu sau và trích xuất thông tin để chuẩn bị tạo tài liệu loại: {$docTypeLabel}

**Mã yêu cầu:** {$requirement->code}
**Tiêu đề:** {$requirement->title}
**Nội dung:** {$requirement->raw_content}

Trả về JSON với các trường sau (tất cả là tiếng Việt):
{
  "actors": ["danh sách actor/người dùng"],
  "preconditions": "điều kiện tiên quyết (text)",
  "main_flow": ["bước 1", "bước 2", "..."],
  "alternative_flows": ["luồng thay thế 1", "..."],
  "exception_flows": ["luồng ngoại lệ 1", "..."],
  "business_rules": ["quy tắc nghiệp vụ 1", "..."],
  "data_fields": [{"name": "tên trường", "type": "kiểu dữ liệu", "required": true, "description": "mô tả"}],
  "non_functional": "yêu cầu phi chức năng (text)",
  "notes": "ghi chú thêm (text)"
}

CHỈ trả về JSON, không có text khác.
PROMPT;

        $log = AiGenerationLog::create([
            'requirement_id' => $requirement->id,
            'log_type'       => 'prefill',
            'status'         => 'processing',
            'created_by'     => $userId,
        ]);

        try {
            $result = $this->claudeClient->generate($systemPrompt, $userPrompt);

            $this->mongoLogService->write('ai_prefill', [
                'requirement_id' => $requirement->id,
                'document_type'  => $docType,
                'model'          => $result['model'],
                'user_prompt'    => $userPrompt,
                'response_text'  => $result['content'],
                'tokens_input'   => $result['input_tokens'],
                'tokens_output'  => $result['output_tokens'],
            ]);

            $log->update([
                'model_used'    => $result['model'],
                'tokens_input'  => $result['input_tokens'],
                'tokens_output' => $result['output_tokens'],
                'duration_ms'   => $result['duration_ms'],
                'status'        => 'success',
            ]);

            // Parse JSON response
            $content = trim($result['content']);
            // Strip markdown code blocks if present
            $content = preg_replace('/^```(?:json)?\s*/m', '', $content);
            $content = preg_replace('/\s*```$/m', '', $content);

            return json_decode($content, true) ?? [];
        } catch (Throwable $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 490),
            ]);
            throw $e;
        }
    }

    private function resolveBuilder(string $docType): PromptBuilderInterface
    {
        return match ($docType) {
            'brd'              => new BrdPromptBuilder(),
            'flow_diagram'     => new FlowDiagramPromptBuilder(),
            'sql_logic'        => new SqlLogicPromptBuilder(),
            'business_rules'   => new BusinessRulesPromptBuilder(),
            'validation_rules' => new ValidationRulesPromptBuilder(),
            'test_cases'       => new TestCasesPromptBuilder(),
            'checklist'        => new ChecklistPromptBuilder(),
            default            => throw new \InvalidArgumentException("Unknown document type: {$docType}"),
        };
    }
}
