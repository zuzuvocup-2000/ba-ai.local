<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class TestCasesPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia QA/Test Engineer với kinh nghiệm sâu rộng trong việc thiết kế test case toàn diện cho các ứng dụng web và API. Bạn có khả năng viết test cases theo nhiều phong cách: Happy Path (kịch bản thành công) với cú pháp Gherkin (Given/When/Then), Edge Cases (biên giới), Negative Test Cases (kiểm tra lỗi và từ chối), Authentication & Authorization Tests (phân quyền) và Security Tests (bảo mật cơ bản như SQL injection, XSS). Mỗi test case bạn viết đều có mã định danh (TC-xxx), tiêu đề rõ ràng, preconditions, steps chi tiết, expected results và độ ưu tiên (Priority: P0/P1/P2). Hãy tạo ra tài liệu Test Cases hoàn chỉnh bằng tiếng Việt theo format Markdown, đảm bảo coverage đủ để phát hiện tối đa các bug tiềm ẩn trước khi release.
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
        $lines[] = 'Hãy tạo tài liệu **Test Cases** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **Tổng quan kiểm thử** — phạm vi test, môi trường, dữ liệu test cần chuẩn bị';
        $lines[] = '2. **Happy Path Test Cases** — kịch bản thành công theo cú pháp Gherkin (Given/When/Then), mã TC-HP-xxx';
        $lines[] = '3. **Alternative Flow Test Cases** — kịch bản luồng thay thế, mã TC-ALT-xxx';
        $lines[] = '4. **Edge Cases** — trường hợp biên giới (giá trị min/max, empty, null), mã TC-EDGE-xxx';
        $lines[] = '5. **Negative Test Cases** — kiểm tra từ chối input không hợp lệ, lỗi validation, mã TC-NEG-xxx';
        $lines[] = '6. **Authentication & Authorization Tests** — kiểm tra phân quyền, mã TC-AUTH-xxx';
        $lines[] = '7. **Security Tests** — SQL injection, XSS, unauthorized access, mã TC-SEC-xxx';
        $lines[] = '8. **Performance Tests** — tải lớn, timeout, concurrent requests (nếu có NFR), mã TC-PERF-xxx';
        $lines[] = '9. **Test Data Matrix** — bảng tổng hợp dữ liệu test cho từng trường';
        $lines[] = '10. **Test Summary** — thống kê tổng số TC, ưu tiên theo Priority';
        $lines[] = '';
        $lines[] = 'Mỗi test case phải có: Mã TC, Tiêu đề, Priority (P0/P1/P2), Preconditions, Steps, Expected Result, Actual Result (để trống).';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - Test Cases: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors (liên quan đến Auth Tests)';
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
            $lines[] = '### Luồng xử lý chính (Happy Path)';
            foreach ($analysis->main_flow as $i => $step) {
                $lines[] = ($i + 1) . ". {$step}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->alternative_flows)) {
            $lines[] = '### Luồng thay thế (Alternative Flow Tests)';
            foreach ($analysis->alternative_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Luồng ngoại lệ (Negative / Exception Tests)';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ cần test';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu (liên quan đến Validation Tests)';
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

        if (!empty($analysis->non_functional)) {
            $lines[] = '### Yêu cầu phi chức năng (liên quan đến Performance Tests)';
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
