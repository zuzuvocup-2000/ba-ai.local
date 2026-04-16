<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class ChecklistPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia lập kế hoạch triển khai phần mềm với kinh nghiệm tổng hợp tất cả các khía cạnh kỹ thuật thành checklist thực hiện chi tiết, rõ ràng và có thể theo dõi tiến độ. Bạn có khả năng tạo ra các checklist phân loại theo nhóm: CL-API (triển khai API endpoints), CL-VAL (validation và xử lý input), CL-BR (business rules và logic nghiệp vụ), CL-DB (database schema, migration, indexes), CL-TC (test cases và quality assurance), cùng với các nhóm bổ sung như CL-SEC (security), CL-DOC (documentation) và CL-DEP (deployment). Mỗi mục trong checklist có mã định danh, mô tả hành động cụ thể, trạng thái (todo/in-progress/done), độ ưu tiên và ghi chú kỹ thuật nếu cần. Hãy tạo ra tài liệu Checklist hoàn chỉnh bằng tiếng Việt theo format Markdown, giúp team phát triển không bỏ sót bất kỳ công việc quan trọng nào.
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
        $lines[] = 'Hãy tạo tài liệu **Checklist** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **Tóm tắt công việc** — tổng số items, ước tính thời gian';
        $lines[] = '2. **CL-API — API Endpoints** — danh sách từng endpoint cần implement với method, path, mô tả';
        $lines[] = '3. **CL-VAL — Validation** — các validation rule cần implement cho từng endpoint';
        $lines[] = '4. **CL-BR — Business Rules** — các business rule cần implement trong service layer';
        $lines[] = '5. **CL-DB — Database** — migration, model, repository, indexes cần tạo';
        $lines[] = '6. **CL-TC — Test Cases** — các test case cần viết và chạy (Unit/Feature/Integration)';
        $lines[] = '7. **CL-SEC — Security** — các kiểm tra bảo mật: auth, authorization, input sanitize';
        $lines[] = '8. **CL-DOC — Documentation** — tài liệu cần cập nhật (API docs, README, changelog)';
        $lines[] = '9. **CL-DEP — Deployment** — các bước deploy: env vars, migrations, cache clear';
        $lines[] = '10. **Definition of Done** — tiêu chí hoàn thành feature';
        $lines[] = '';
        $lines[] = 'Mỗi checklist item dùng format: `- [ ] **CL-XXX-001** Mô tả công việc` (checkbox Markdown).';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - Checklist: {$requirement->title}";
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

        if (!empty($analysis->main_flow)) {
            $lines[] = '### Luồng xử lý chính';
            foreach ($analysis->main_flow as $i => $step) {
                $lines[] = ($i + 1) . ". {$step}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->alternative_flows)) {
            $lines[] = '### Luồng thay thế';
            foreach ($analysis->alternative_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Luồng ngoại lệ';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ cần implement';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu cần implement';
            foreach ($analysis->data_fields as $field) {
                if (is_array($field)) {
                    $name     = $field['name'] ?? '';
                    $type     = $field['type'] ?? '';
                    $required = isset($field['required']) ? ($field['required'] ? ', bắt buộc' : '') : '';
                    $desc     = $field['description'] ?? '';
                    $lines[]  = "- **{$name}** ({$type}{$required}): {$desc}";
                } else {
                    $lines[] = "- {$field}";
                }
            }
            $lines[] = '';
        }

        if (!empty($analysis->non_functional)) {
            $lines[] = '### Yêu cầu phi chức năng';
            $lines[] = $analysis->non_functional;
            $lines[] = '';
        }

        if (!empty($analysis->preconditions)) {
            $lines[] = '### Điều kiện tiên quyết';
            $lines[] = $analysis->preconditions;
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
