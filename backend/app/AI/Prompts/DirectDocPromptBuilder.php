<?php

namespace App\AI\Prompts;

use App\Models\Requirement;

/**
 * Sinh tài liệu trực tiếp từ raw_content + screens của Requirement,
 * không cần điền form phân tích trước.
 *
 * Sử dụng template file từ docs/templates/ để đảm bảo output đúng cấu trúc.
 */
class DirectDocPromptBuilder
{
    /** Mapping docType → template filename trong docs/templates/ */
    private static array $templateMap = [
        'brd'              => 'brd.md',
        'flow_diagram'     => 'flow-diagram.md',
        'sql_logic'        => 'sql-logic.md',
        'business_rules'   => 'business-rules.md',
        'validation_rules' => 'validation-rules.md',
        'test_cases'       => 'test-cases.md',
    ];

    public function __construct(private readonly string $docType) {}

    public function systemPrompt(): string
    {
        $base = match ($this->docType) {
            'brd' => 'Bạn là Business Analyst cấp cao với hơn 10 năm kinh nghiệm. Nhiệm vụ của bạn là đọc mô tả yêu cầu nghiệp vụ thô và viết tài liệu BRD (Business Requirements Document) đầy đủ, chuyên nghiệp bằng tiếng Việt.',

            'flow_diagram' => 'Bạn là Business Analyst cấp cao. Nhiệm vụ là phân tích yêu cầu và viết Flow Diagram Document chi tiết bằng tiếng Việt, bao gồm Mermaid diagrams cho flowchart và sequence diagram.',

            'sql_logic' => 'Bạn là Database Architect kiêm Business Analyst. Nhiệm vụ là phân tích yêu cầu và thiết kế SQL Logic Document bằng tiếng Việt, bao gồm cấu trúc bảng, queries đầy đủ, transaction logic, index.',

            'business_rules' => 'Bạn là Business Analyst chuyên nghiệp. Nhiệm vụ là trích xuất và tài liệu hóa toàn bộ Business Rules từ yêu cầu, bằng tiếng Việt. Mỗi rule phải có mã định danh (BR-ACC-XX, BR-DATA-XX, v.v.) và mô tả chi tiết.',

            'validation_rules' => 'Bạn là Business Analyst chuyên nghiệp. Nhiệm vụ là xác định và tài liệu hóa toàn bộ Validation Rules từ yêu cầu, bằng tiếng Việt. Bao gồm validation từng trường, error messages, cross-field validation, Laravel FormRequest rules.',

            'test_cases' => 'Bạn là QA Engineer cấp cao. Nhiệm vụ là thiết kế Test Cases đầy đủ từ yêu cầu nghiệp vụ, bằng tiếng Việt. Bao gồm happy path, edge cases, negative cases, authorization tests, security tests.',

            default => 'Bạn là Business Analyst cấp cao. Phân tích và tài liệu hóa yêu cầu nghiệp vụ bằng tiếng Việt.',
        };

        return $base . "\n\n"
            . "**QUAN TRỌNG — TUÂN THEO TEMPLATE:**\n"
            . "Bạn sẽ được cung cấp một template Markdown với các placeholder dạng `{{tên_placeholder}}`.\n"
            . "Bạn PHẢI sinh ra tài liệu theo ĐÚNG cấu trúc template đó:\n"
            . "- Thay thế TẤT CẢ các `{{placeholder}}` bằng nội dung phù hợp dựa trên yêu cầu được cung cấp.\n"
            . "- Giữ nguyên toàn bộ cấu trúc: tiêu đề, sections, bảng, code blocks, Mermaid diagrams.\n"
            . "- KHÔNG bỏ qua bất kỳ section nào trong template.\n"
            . "- KHÔNG thêm sections ngoài template.\n"
            . "- Output chỉ là nội dung Markdown hoàn chỉnh đã điền đầy đủ, không có giải thích thêm.";
    }

    public function userPrompt(Requirement $requirement): string
    {
        $lines = [];
        $lines[] = '# Yêu cầu nghiệp vụ cần phân tích';
        $lines[] = '';
        $lines[] = "**Mã yêu cầu:** {$requirement->code}";
        $lines[] = "**Tiêu đề:** {$requirement->title}";
        $lines[] = '';
        $lines[] = '## Mô tả yêu cầu';
        $lines[] = $requirement->raw_content ?? '(Không có mô tả)';
        $lines[] = '';

        // Screens
        $screens = $requirement->screens ?? [];
        if (!empty($screens)) {
            $lines[] = '## Màn hình giao diện liên quan';
            $lines[] = '';
            foreach ($screens as $i => $screen) {
                $num  = $i + 1;
                $name = $screen['name'] ?? '';
                $desc = $screen['description'] ?? '';
                $data = $screen['sample_data'] ?? '';

                $lines[] = "### Màn hình {$num}: {$name}";
                if ($desc) {
                    $lines[] = "**Chức năng:** {$desc}";
                }
                if ($data) {
                    $lines[] = '**Dữ liệu mẫu:**';
                    $lines[] = '```';
                    $lines[] = $data;
                    $lines[] = '```';
                }
                $lines[] = '';
            }
        }

        $lines[] = '---';
        $lines[] = '';

        // Append template with instruction, or fall back to free-form instruction
        $template = $this->loadTemplate();

        if ($template !== null) {
            $lines[] = '## Template tài liệu (BẮT BUỘC tuân theo cấu trúc này)';
            $lines[] = '';
            $lines[] = 'Hãy sinh tài liệu theo ĐÚNG cấu trúc template dưới đây.';
            $lines[] = 'Thay thế tất cả `{{placeholder}}` bằng nội dung thực tế phù hợp với yêu cầu trên.';
            $lines[] = 'Giữ nguyên toàn bộ headings, bảng, code blocks, Mermaid diagrams.';
            $lines[] = '';
            $lines[] = $template;
        } else {
            $lines[] = $this->instruction();
        }

        return implode("\n", $lines);
    }

    /**
     * Load template file từ docs/templates/.
     * Trả về null nếu file không tồn tại.
     */
    private function loadTemplate(): ?string
    {
        $filename = self::$templateMap[$this->docType] ?? null;
        if ($filename === null) {
            return null;
        }

        // docs/templates/ nằm ở thư mục cha của Laravel root (backend/)
        $path = base_path("../docs/templates/{$filename}");

        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        return $content !== false ? $content : null;
    }

    /**
     * Fallback instruction khi không tìm thấy template file.
     */
    private function instruction(): string
    {
        return match ($this->docType) {
            'brd' => <<<INST
Hãy viết tài liệu **BRD (Business Requirements Document)** hoàn chỉnh theo Markdown với các phần:

1. **Tổng quan tài liệu** (mục đích, phạm vi, đối tượng sử dụng)
2. **Mục tiêu kinh doanh** (business goals, KPIs)
3. **Các bên liên quan** (stakeholders, actors và vai trò)
4. **Phạm vi hệ thống** (in-scope, out-of-scope)
5. **Yêu cầu chức năng chi tiết** (từng tính năng với mô tả đầy đủ)
6. **Luồng xử lý chính** (main flow, alternative flows, exception flows)
7. **Quy tắc nghiệp vụ** (business rules áp dụng)
8. **Yêu cầu dữ liệu** (data fields, constraints, validation)
9. **Yêu cầu phi chức năng** (performance, security, scalability)
10. **Ràng buộc và giả định**
11. **Rủi ro và biện pháp giảm thiểu**
12. **Tiêu chí nghiệm thu** (acceptance criteria)
INST,

            'flow_diagram' => <<<INST
Hãy viết tài liệu **Flow Diagram** hoàn chỉnh theo Markdown với các phần:

1. **Tổng quan luồng** (mô tả ngắn về quy trình)
2. **Actors và hệ thống tham gia**
3. **Điều kiện tiên quyết** (preconditions)
4. **Luồng chính (Main Flow)** (từng bước chi tiết đánh số)
5. **Luồng thay thế (Alternative Flows)** (các trường hợp thay thế)
6. **Luồng ngoại lệ (Exception Flows)** (xử lý lỗi, edge cases)
7. **Mermaid Diagram** (vẽ flowchart bằng cú pháp Mermaid)
8. **Trạng thái hệ thống** (state transitions nếu có)
9. **Điều kiện kết thúc** (postconditions)
INST,

            'sql_logic' => <<<INST
Hãy viết tài liệu **SQL Logic** hoàn chỉnh theo Markdown với các phần:

1. **Tổng quan dữ liệu** (mô tả các entity chính)
2. **Thiết kế bảng** (tên bảng, các cột, kiểu dữ liệu, khóa chính/ngoại)
3. **Quan hệ giữa các bảng** (ERD mô tả text hoặc Mermaid erDiagram)
4. **Các query chính** (SELECT, INSERT, UPDATE, DELETE với context sử dụng)
5. **Index cần thiết** (và lý do)
6. **Stored Procedures / Triggers** (nếu cần)
7. **Ràng buộc dữ liệu** (constraints, foreign keys, check constraints)
8. **Migration script mẫu** (tạo bảng)
INST,

            'business_rules' => <<<INST
Hãy viết tài liệu **Business Rules** hoàn chỉnh theo Markdown với các phần:

1. **Danh sách quy tắc** (mỗi rule: mã BR-XXX, tên, mô tả chi tiết, ví dụ)
2. **Quy tắc xác thực dữ liệu** (validation rules cho từng trường)
3. **Quy tắc luồng nghiệp vụ** (khi nào được phép làm gì)
4. **Quy tắc tính toán** (formulas, calculations nếu có)
5. **Quy tắc phân quyền** (ai được làm gì)
6. **Quy tắc ngoại lệ** (exception handling)
7. **Bảng tóm tắt các quy tắc** (rule ID, mô tả ngắn, áp dụng cho)
INST,

            'validation_rules' => <<<INST
Hãy viết tài liệu **Validation Rules** hoàn chỉnh theo Markdown với các phần:

1. **Danh sách trường dữ liệu cần validate** (tên, kiểu, bắt buộc/không)
2. **Chi tiết validation từng trường** (format, min/max, pattern, logic)
3. **Error messages** (thông báo lỗi cụ thể cho từng trường hợp)
4. **Validation phía client** (frontend validation)
5. **Validation phía server** (backend validation, business logic)
6. **Bảng tổng hợp** (Field | Type | Required | Rules | Error Message)
7. **Cross-field validation** (các ràng buộc liên trường)
INST,

            'test_cases' => <<<INST
Hãy viết tài liệu **Test Cases** hoàn chỉnh theo Markdown với các phần:

1. **Phạm vi kiểm thử** (scope, môi trường test)
2. **Test Cases chức năng** (Happy Path — từng TC: ID, tên, steps, expected result)
3. **Test Cases luồng thay thế** (alternative flows)
4. **Negative Test Cases** (invalid input, error handling)
5. **Edge Cases** (boundary values, corner cases)
6. **Test Cases bảo mật** (authorization, access control)
7. **Acceptance Criteria** (điều kiện để pass)
8. **Bảng tổng hợp** (TC ID | Title | Priority | Type | Steps | Expected)
INST,

            default => 'Hãy phân tích và tạo tài liệu đầy đủ bằng tiếng Việt theo chuẩn Markdown.',
        };
    }

    public function documentTitle(Requirement $requirement): string
    {
        $typeLabel = match ($this->docType) {
            'brd'              => 'BRD',
            'flow_diagram'     => 'Flow Diagram',
            'sql_logic'        => 'SQL Logic',
            'business_rules'   => 'Business Rules',
            'validation_rules' => 'Validation Rules',
            'test_cases'       => 'Test Cases',
            default            => strtoupper($this->docType),
        };

        return "{$requirement->code} - {$typeLabel}: {$requirement->title}";
    }
}
