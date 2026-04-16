<?php

namespace App\AI\Prompts;

use App\AI\PromptBuilderInterface;
use App\Models\Requirement;
use App\Models\RequirementAnalysis;

class SqlLogicPromptBuilder implements PromptBuilderInterface
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là chuyên gia thiết kế cơ sở dữ liệu và viết SQL với kinh nghiệm sâu về MySQL/PostgreSQL và thiết kế schema cho các ứng dụng enterprise. Bạn có khả năng thiết kế cấu trúc bảng tối ưu, viết các câu truy vấn SQL hiệu năng cao cho đầy đủ các thao tác: List (danh sách có filter, sort, pagination), Detail (lấy chi tiết kèm relations), Insert (thêm mới với validation), Update (cập nhật một phần hoặc toàn bộ), Delete (xóa mềm hoặc xóa cứng) và Transaction (xử lý nghiệp vụ phức tạp nhiều bảng). Hãy tạo ra tài liệu SQL Logic hoàn chỉnh bằng tiếng Việt theo format Markdown, bao gồm ERD mô tả bằng Mermaid, DDL tạo bảng, và đầy đủ các câu SQL với chú thích giải thích logic nghiệp vụ.
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
        $lines[] = 'Hãy tạo tài liệu **SQL Logic** hoàn chỉnh theo format Markdown bao gồm:';
        $lines[] = '';
        $lines[] = '1. **ERD (Entity-Relationship Diagram)** — dùng Mermaid `erDiagram` mô tả quan hệ giữa các bảng';
        $lines[] = '2. **DDL — Tạo bảng** — `CREATE TABLE` với đầy đủ kiểu dữ liệu, constraints, indexes';
        $lines[] = '3. **SQL List** — truy vấn danh sách có filter, search, sort, pagination';
        $lines[] = '4. **SQL Detail** — truy vấn chi tiết một bản ghi kèm JOIN các bảng liên quan';
        $lines[] = '5. **SQL Insert** — câu lệnh thêm mới, xử lý duplicate, returning id';
        $lines[] = '6. **SQL Update** — cập nhật dữ liệu với điều kiện kiểm tra';
        $lines[] = '7. **SQL Delete** — xóa mềm (soft delete) hoặc xóa cứng tuỳ nghiệp vụ';
        $lines[] = '8. **SQL Transaction** — xử lý nghiệp vụ phức tạp nhiều bảng với BEGIN/COMMIT/ROLLBACK';
        $lines[] = '9. **Indexes đề xuất** — các index nên tạo để tối ưu performance';
        $lines[] = '10. **Lưu ý về performance** và các câu truy vấn cần cẩn thận';

        return implode("\n", $lines);
    }

    public function documentTitle(Requirement $requirement): string
    {
        return "{$requirement->code} - SQL Logic: {$requirement->title}";
    }

    private function formatAnalysis(RequirementAnalysis $analysis): string
    {
        $lines = [];
        $lines[] = '## Dữ liệu phân tích yêu cầu';
        $lines[] = '';

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

        if (!empty($analysis->business_rules)) {
            $lines[] = '### Quy tắc nghiệp vụ ảnh hưởng đến dữ liệu';
            foreach ($analysis->business_rules as $rule) {
                $lines[] = "- {$rule}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->actors)) {
            $lines[] = '### Actors (liên quan đến phân quyền dữ liệu)';
            foreach ($analysis->actors as $actor) {
                $lines[] = "- {$actor}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->main_flow)) {
            $lines[] = '### Luồng xử lý chính (ảnh hưởng đến SQL logic)';
            foreach ($analysis->main_flow as $i => $step) {
                $lines[] = ($i + 1) . ". {$step}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->exception_flows)) {
            $lines[] = '### Xử lý ngoại lệ liên quan đến dữ liệu';
            foreach ($analysis->exception_flows as $flow) {
                $lines[] = "- {$flow}";
            }
            $lines[] = '';
        }

        if (!empty($analysis->non_functional)) {
            $lines[] = '### Yêu cầu phi chức năng (performance, data volume)';
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
