<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class ValidationRulesPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia thiết kế validation rules cho các ứng dụng web và API, với kinh nghiệm sâu về Laravel FormRequest validation, JSON Schema, và các kỹ thuật kiểm tra dữ liệu đầu vào toàn diện. Bạn có khả năng định nghĩa rõ ràng các quy tắc kiểm tra cho từng trường dữ liệu ở cả phía frontend (client-side) và backend (server-side), bao gồm: kiểm tra kiểu dữ liệu, độ dài, format, giá trị cho phép, tính duy nhất, phụ thuộc giữa các trường (conditional validation) và custom business validation. Tài liệu bạn tạo ra phải đủ chi tiết để developer frontend và backend đều có thể implement đúng, bao gồm Laravel FormRequest rules, JSON Schema và thông báo lỗi rõ ràng bằng tiếng Việt.
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
        $lines[] = 'Hãy tạo tài liệu **Validation Rules** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **Tổng quan Validation** — danh sách API endpoints cần validate và nguyên tắc chung';
        $lines[] = '2. **Bảng Validation Rules** — bảng chi tiết từng trường: tên, kiểu, bắt buộc, rules, thông báo lỗi';
        $lines[] = '3. **Laravel FormRequest** — code PHP rules() array sẵn sàng dùng cho từng API endpoint';
        $lines[] = '4. **JSON Schema** — schema JSON cho request body (dùng cho API docs / Postman)';
        $lines[] = '5. **Conditional Validation** — các rule phụ thuộc điều kiện (required_if, required_unless, etc.)';
        $lines[] = '6. **Custom Validation Rules** — các quy tắc nghiệp vụ cần custom validator';
        $lines[] = '7. **Frontend Validation** — quy tắc kiểm tra phía client (HTML5 attributes, JS validation)';
        $lines[] = '8. **Thông báo lỗi** — messages() array hoàn chỉnh bằng tiếng Việt cho mọi rule';
        $lines[] = '9. **Ví dụ request hợp lệ và không hợp lệ** — minh hoạ với JSON sample';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - Validation Rules: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu cần validate';
            $lines[] = '| Tên trường | Kiểu | Bắt buộc | Mô tả |';
            $lines[] = '|-----------|------|----------|-------|';
            foreach ($analysis->data_fields as $field) {
                if (is_array($field)) {
                    $name     = $field['name'] ?? '';
                    $type     = $field['type'] ?? '';
                    $required = isset($field['required']) ? ($field['required'] ? 'Có' : 'Không') : '';
                    $desc     = $field['description'] ?? '';
                    $lines[]  = "| {$name} | {$type} | {$required} | {$desc} |";
                } else {
                    $lines[] = "| {$field} | | | |";
                }
            }
            $lines[] = '';
        }

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ liên quan đến validation';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors (liên quan đến phân quyền validate)';
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

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Luồng ngoại lệ (liên quan đến validation errors)';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->non_functional)) {
            $lines[] = '### Yêu cầu phi chức năng';
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
