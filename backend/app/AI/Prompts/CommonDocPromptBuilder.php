<?php

namespace App\AI\Prompts;

use App\Models\Project;

class CommonDocPromptBuilder
{
    public function systemPrompt(): string
    {
        return <<<SYSTEM
Bạn là Business Analyst cấp cao với hơn 10 năm kinh nghiệm phân tích và thiết kế hệ thống phần mềm. Nhiệm vụ của bạn là viết tài liệu **Phân tích Common** (Common Analysis Document) cho một dự án phần mềm. Tài liệu này mô tả các thành phần dùng chung xuyên suốt toàn bộ dự án: vai trò người dùng và quyền hạn, kiến trúc kỹ thuật chung, quy tắc nghiệp vụ dùng chung, quy ước đặt tên, và các ràng buộc hệ thống. Hãy viết tài liệu đầy đủ, chuyên nghiệp bằng tiếng Việt theo chuẩn Markdown, đủ chi tiết để team dev và BA có thể tham chiếu trong suốt quá trình phát triển.
SYSTEM;
    }

    public function userPrompt(Project $project): string
    {
        $lines = [];
        $lines[] = '# Thông tin dự án';
        $lines[] = '';
        $lines[] = "- **Mã dự án:** {$project->code}";
        $lines[] = "- **Tên dự án:** {$project->name}";
        if ($project->description) {
            $lines[] = "- **Mô tả:** {$project->description}";
        }
        $lines[] = '';

        // Roles / Quyền dự án
        $roles = $project->roles ?? [];
        if (!empty($roles)) {
            $lines[] = '## Vai trò & Quyền hạn trong dự án';
            $lines[] = '';
            foreach ($roles as $role) {
                $name = $role['name'] ?? '';
                $desc = $role['description'] ?? '';
                $lines[] = "### {$name}";
                $lines[] = $desc ?: '(Chưa có mô tả)';
                $lines[] = '';
            }
        }

        // Common info
        $info = $project->common_info ?? [];
        if (!empty($info)) {
            $lines[] = '## Thông tin kỹ thuật chung';
            $lines[] = '';

            if (!empty($info['tech_stack'])) {
                $lines[] = '### Công nghệ sử dụng (Tech Stack)';
                $lines[] = $info['tech_stack'];
                $lines[] = '';
            }

            if (!empty($info['database'])) {
                $lines[] = '### Cơ sở dữ liệu (Database)';
                $lines[] = $info['database'];
                $lines[] = '';
            }

            if (!empty($info['naming'])) {
                $lines[] = '### Quy ước đặt tên (Naming Conventions)';
                $lines[] = $info['naming'];
                $lines[] = '';
            }

            if (!empty($info['common_rules'])) {
                $lines[] = '### Quy tắc chung (Common Business Rules)';
                $lines[] = $info['common_rules'];
                $lines[] = '';
            }

            if (!empty($info['notes'])) {
                $lines[] = '### Ghi chú thêm';
                $lines[] = $info['notes'];
                $lines[] = '';
            }
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = 'Hãy tạo tài liệu **Phân tích Common** hoàn chỉnh bằng tiếng Việt theo Markdown với các phần sau:';
        $lines[] = '';
        $lines[] = '1. **Tổng quan dự án** (mục tiêu, phạm vi, đối tượng sử dụng)';
        $lines[] = '2. **Kiến trúc hệ thống chung** (tech stack, database, môi trường triển khai)';
        $lines[] = '3. **Vai trò & Phân quyền** (mỗi role: mô tả chi tiết, quyền hạn, phạm vi tác động)';
        $lines[] = '4. **Các thành phần dùng chung** (authentication, authorization, file upload, notification, ...)';
        $lines[] = '5. **Quy tắc nghiệp vụ chung** (áp dụng cho toàn hệ thống)';
        $lines[] = '6. **Quy ước kỹ thuật** (naming, coding style, API conventions, ...)';
        $lines[] = '7. **Ràng buộc & Giả định** (constraints, assumptions)';
        $lines[] = '8. **Bảng thuật ngữ** (glossary)';

        return implode("\n", $lines);
    }

    public function documentTitle(Project $project): string
    {
        return "{$project->code} - Common Analysis Document";
    }
}
