<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class FlowDiagramPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia thiết kế quy trình nghiệp vụ và luồng hệ thống với kinh nghiệm sâu rộng trong việc tạo ra các sơ đồ luồng (Flow Diagram) và sơ đồ tuần tự (Sequence Diagram) bằng cú pháp Mermaid. Bạn có khả năng chuyển hóa các yêu cầu nghiệp vụ phức tạp thành các sơ đồ trực quan, dễ hiểu, và chính xác. Mỗi sơ đồ bạn tạo ra phải thể hiện đầy đủ main flow, alternative flows và exception flows với các điều kiện rẽ nhánh rõ ràng. Hãy tạo ra tài liệu Flow Diagram hoàn chỉnh bằng tiếng Việt, bao gồm cả flowchart tổng quan, sequence diagram tương tác giữa các actor, và state diagram nếu có trạng thái dữ liệu cần theo dõi, sử dụng cú pháp Mermaid hợp lệ.
SYSTEM;
    }

    public function userPrompt(RequirementAnalysis $analysis, Requirement $requirement): string
    {
        $lines = [];
        $lines[] = '# Thông tin yêu cầu';
        $lines[] = '';
        $lines[] = "- **Mã yêu cầu:** {$requirement->code}";
        $lines[] = "- **Tiêu đề:** {$requirement->title}";
        $lines[] = '';
        $lines[] = '## Nội dung thô';
        $lines[] = $requirement->raw_content ?? '(Không có)';
        $lines[] = '';
        $lines[] = $this->formatAnalysis($analysis);
        $lines[] = '';
        $lines[] = '---';
        $lines[] = '';
        $lines[] = 'Hãy tạo tài liệu **Flow Diagram** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **Flowchart tổng quan** (Mermaid `flowchart TD`) — thể hiện luồng xử lý chính với các điều kiện rẽ nhánh, alternative flows và exception flows';
        $lines[] = '2. **Sequence Diagram** (Mermaid `sequenceDiagram`) — mô tả tương tác giữa các actor và hệ thống theo từng bước';
        $lines[] = '3. **State Diagram** (Mermaid `stateDiagram-v2`) — nếu có đối tượng dữ liệu có trạng thái (status transitions)';
        $lines[] = '4. **Mô tả chi tiết từng bước** bằng tiếng Việt kèm theo mỗi sơ đồ';
        $lines[] = '5. **Giải thích các điều kiện rẽ nhánh** và xử lý ngoại lệ';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - Flow Diagram: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors';
            foreach ($analysis->actors as $actor) {
                $lines[] = "- {$actor}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->preconditions)) {
            $lines[] = '### Điều kiện tiên quyết';
            $lines[] = $analysis->preconditions;
            $lines[] = '';
        }

        if (!empty($analysis->main_flow)) {
            $lines[] = '### Luồng xử lý chính (Main Flow)';
            foreach ($analysis->main_flow as $i => $step) {
                $lines[] = ($i + 1) . ". {$step}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->alternative_flows)) {
            $lines[] = '### Luồng thay thế (Alternative Flows)';
            foreach ($analysis->alternative_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Luồng ngoại lệ (Exception Flows)';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ liên quan';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu liên quan';
            foreach ($analysis->data_fields as $field) {
                if (is_array($field)) {
                    $name    = $field['name'] ?? '';
                    $type    = $field['type'] ?? '';
                    $desc    = $field['description'] ?? '';
                    $lines[] = "- **{$name}** ({$type}): {$desc}";
                } else {
                    $lines[] = "- {$field}";
                }
            }
            $lines[] = '';
        }

        if (!empty($analysis->notes)) {
            $lines[] = '### Ghi chú';
            $lines[] = $analysis->notes;
            $lines[] = '';
        }

        return implode("\n", $lines);
    }
}
