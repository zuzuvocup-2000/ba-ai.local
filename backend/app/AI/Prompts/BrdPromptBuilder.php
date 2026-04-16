<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class BrdPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là Business Analyst cấp cao với hơn 10 năm kinh nghiệm trong lĩnh vực phân tích và thiết kế hệ thống phần mềm. Nhiệm vụ của bạn là viết tài liệu BRD (Business Requirements Document) đầy đủ, chuyên nghiệp, rõ ràng và có tính thực tiễn cao cho các dự án phần mềm. Tài liệu phải bao gồm đầy đủ các phần: tổng quan dự án, mục tiêu kinh doanh, phạm vi hệ thống, các bên liên quan, yêu cầu chức năng chi tiết, yêu cầu phi chức năng, ràng buộc và giả định. Hãy tạo ra tài liệu BRD chi tiết, chuyên nghiệp bằng tiếng Việt theo cấu trúc Markdown chuẩn, đảm bảo mỗi phần đều có đủ nội dung để developer và tester có thể hiểu và triển khai được ngay.
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
        $lines[] = 'Hãy tạo tài liệu **BRD (Business Requirements Document)** hoàn chỉnh theo format Markdown với đầy đủ các phần sau:';
        $lines[] = '';
        $lines[] = '1. **Tổng quan tài liệu** (mục đích, phạm vi, đối tượng sử dụng)';
        $lines[] = '2. **Mục tiêu kinh doanh** (business goals, KPIs)';
        $lines[] = '3. **Các bên liên quan** (stakeholders, actors và vai trò)';
        $lines[] = '4. **Phạm vi hệ thống** (in-scope, out-of-scope)';
        $lines[] = '5. **Yêu cầu chức năng chi tiết** (từng tính năng với mô tả đầy đủ)';
        $lines[] = '6. **Luồng xử lý chính** (main flow, alternative flows, exception flows)';
        $lines[] = '7. **Quy tắc nghiệp vụ** (business rules áp dụng)';
        $lines[] = '8. **Yêu cầu dữ liệu** (data fields, constraints)';
        $lines[] = '9. **Yêu cầu phi chức năng** (performance, security, scalability)';
        $lines[] = '10. **Ràng buộc và giả định**';
        $lines[] = '11. **Rủi ro và biện pháp giảm thiểu**';
        $lines[] = '12. **Tiêu chí nghiệm thu** (acceptance criteria)';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - BRD: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors (Người dùng/Hệ thống liên quan)';
            foreach ($analysis->actors as $actor) {
                $lines[] = "- {$actor}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->preconditions)) {
            $lines[] = '### Điều kiện tiên quyết (Preconditions)';
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
            $lines[] = '### Quy tắc nghiệp vụ (Business Rules)';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->data_fields)) {
            $lines[] = '### Trường dữ liệu (Data Fields)';
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
            $lines[] = '### Yêu cầu phi chức năng (Non-functional Requirements)';
            $lines[] = $analysis->non_functional;
            $lines[] = '';
        }

        if (!empty($analysis->notes)) {
            $lines[] = '### Ghi chú';
            $lines[] = $analysis->notes;
            $lines[] = '';
        }

        if (!empty($analysis->extended_data)) {
            $lines[] = '### Dữ liệu mở rộng';
            $lines[] = '```json';
            $lines[] = json_encode($analysis->extended_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $lines[] = '```';
            $lines[] = '';
        }

        return implode("\n", $lines);
    }
}
