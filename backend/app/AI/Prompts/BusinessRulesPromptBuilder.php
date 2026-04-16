<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class BusinessRulesPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia phân tích và định nghĩa quy tắc nghiệp vụ (Business Rules) cho các hệ thống phần mềm phức tạp. Bạn có khả năng phân loại và viết rõ ràng các quy tắc theo từng nhóm: quy tắc phân quyền truy cập (Access Rules), quy tắc về dữ liệu (Data Rules), quy tắc xử lý quy trình (Process Rules), quy tắc tính toán và công thức (Calculation Rules), quy tắc chuyển đổi trạng thái (State/Status Rules) và quy tắc giới hạn hệ thống (Limit/Constraint Rules). Mỗi quy tắc bạn viết đều có mã định danh duy nhất (ví dụ BR-ACC-001), mô tả rõ ràng điều kiện kích hoạt, hành động thực hiện và ngoại lệ nếu có. Hãy tạo ra tài liệu Business Rules hoàn chỉnh bằng tiếng Việt theo format Markdown, đảm bảo đủ chi tiết để developer có thể implement đúng logic nghiệp vụ.
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
        $lines[] = 'Hãy tạo tài liệu **Business Rules** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **Tổng quan Business Rules** — tóm tắt các nhóm quy tắc áp dụng';
        $lines[] = '2. **Access Rules (BR-ACC-xxx)** — quy tắc phân quyền: ai được làm gì, điều kiện truy cập';
        $lines[] = '3. **Data Rules (BR-DAT-xxx)** — quy tắc về dữ liệu: tính hợp lệ, duy nhất, bắt buộc, format';
        $lines[] = '4. **Process Rules (BR-PRO-xxx)** — quy tắc quy trình: thứ tự thực hiện, điều kiện kích hoạt bước tiếp theo';
        $lines[] = '5. **Calculation Rules (BR-CAL-xxx)** — công thức tính toán, quy tắc tổng hợp dữ liệu';
        $lines[] = '6. **State Rules (BR-STA-xxx)** — quy tắc chuyển đổi trạng thái, điều kiện thay đổi status';
        $lines[] = '7. **Limit Rules (BR-LIM-xxx)** — giới hạn hệ thống: số lượng tối đa, thời gian, quota';
        $lines[] = '8. **Ma trận phụ thuộc** — bảng thể hiện quy tắc nào phụ thuộc quy tắc nào';
        $lines[] = '';
        $lines[] = 'Mỗi quy tắc phải có: Mã, Tiêu đề, Mô tả, Điều kiện áp dụng, Hành động, Ngoại lệ.';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - Business Rules: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors (liên quan đến Access Rules)';
            foreach ($analysis->actors as $actor) {
                $lines[] = "- {$actor}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ đã xác định';
            foreach ($analysis->business_rules as $i => $rule) {
                $lines[] = ($i + 1) . ". {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->preconditions)) {
            $lines[] = '### Điều kiện tiên quyết';
            $lines[] = $analysis->preconditions;
            $lines[] = '';
        }

        if (!empty($analysis->main_flow)) {
            $lines[] = '### Luồng xử lý chính (liên quan đến Process Rules)';
            foreach ($analysis->main_flow as $i => $step) {
                $lines[] = ($i + 1) . ". {$step}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->alternative_flows)) {
            $lines[] = '### Luồng thay thế (liên quan đến State/Process Rules)';
            foreach ($analysis->alternative_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Luồng ngoại lệ (liên quan đến Exception Rules)';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu (liên quan đến Data Rules)';
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
            $lines[] = '### Yêu cầu phi chức năng (liên quan đến Limit Rules)';
            $lines[] = $analysis->non_functional;
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
