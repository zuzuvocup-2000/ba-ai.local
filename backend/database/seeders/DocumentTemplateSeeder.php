<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use Illuminate\Database\Seeder;

class DocumentTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = $this->getTemplates();

        foreach ($templates as $tpl) {
            // Extract unique placeholder names from {{...}} patterns
            preg_match_all('/\{\{(\w+)\}\}/', $tpl['content'], $matches);
            $placeholders = array_values(array_unique($matches[1]));

            DocumentTemplate::query()->updateOrCreate(
                [
                    'type'      => $tpl['type'],
                    'name'      => $tpl['name'],
                    'is_global' => true,
                ],
                [
                    'content'      => $tpl['content'],
                    'is_default'   => true,
                    'placeholders' => $placeholders,
                    'version'      => 1,
                    'created_by'   => null,
                ]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Template definitions
    // ─────────────────────────────────────────────────────────────────────────

    private function getTemplates(): array
    {
        return [
            [
                'type'    => 'brd',
                'name'    => 'BRD - Mặc định',
                'content' => $this->brdContent(),
            ],
            [
                'type'    => 'flow_diagram',
                'name'    => 'Flow Diagram - Mặc định',
                'content' => $this->flowDiagramContent(),
            ],
            [
                'type'    => 'sql_logic',
                'name'    => 'SQL Logic - Mặc định',
                'content' => $this->sqlLogicContent(),
            ],
            [
                'type'    => 'business_rules',
                'name'    => 'Business Rules - Mặc định',
                'content' => $this->businessRulesContent(),
            ],
            [
                'type'    => 'validation_rules',
                'name'    => 'Validation Rules - Mặc định',
                'content' => $this->validationRulesContent(),
            ],
            [
                'type'    => 'test_cases',
                'name'    => 'Test Cases - Mặc định',
                'content' => $this->testCasesContent(),
            ],
            [
                'type'    => 'checklist',
                'name'    => 'Document Checklist - Mặc định',
                'content' => $this->checklistContent(),
            ],
        ];
    }

    // ── BRD ──────────────────────────────────────────────────────────────────

    private function brdContent(): string
    {
        return <<<'EOT'
# BRD: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-BRD | **Dự án:** {{project_name}} | **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}} | **Ngày tạo:** {{created_date}} | **Phiên bản:** {{version}}

## 1. Tổng Quan
### 1.1 Mục đích
{{purpose}}

### 1.2 Phạm vi
**Trong phạm vi:** {{in_scope}}
**Ngoài phạm vi:** {{out_of_scope}}

## 2. Tác Nhân (Actors)
| Tác nhân | Vai trò | Quyền hạn |
|----------|---------|-----------|
| {{actor_1}} | {{actor_1_role}} | {{actor_1_permission}} |

## 3. Điều Kiện
### 3.1 Điều kiện tiên quyết
{{preconditions}}

### 3.2 Hậu điều kiện
{{postconditions}}

## 4. Yêu Cầu Chức Năng
### 4.1 Luồng chính
| Bước | Tác nhân | Hành động | Phản hồi hệ thống |
|------|----------|-----------|-------------------|
| 1 | {{actor}} | {{action_1}} | {{system_response_1}} |

### 4.2 Luồng thay thế
{{alternative_flows}}

### 4.3 Luồng ngoại lệ
| Mã | Tình huống | Xử lý | Thông báo |
|----|-----------|-------|-----------|
| EX-01 | {{exception_1}} | {{handle_1}} | {{message_1}} |

## 5. Yêu Cầu Dữ Liệu
### 5.1 Dữ liệu đầu vào
| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| {{field_1}} | {{type_1}} | {{required_1}} | {{desc_1}} |

## 6. Tiêu Chí Chấp Nhận
- [ ] {{acceptance_criteria_1}}
- [ ] {{acceptance_criteria_2}}
EOT;
    }

    // ── Flow Diagram ──────────────────────────────────────────────────────────

    private function flowDiagramContent(): string
    {
        return <<<'EOT'
# Flow Diagram: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-FLOW | **Dự án:** {{project_name}} | **Nhóm:** {{group_name}}
> **Tác giả:** {{author}} | **Ngày tạo:** {{created_date}}

## 1. Tổng Quan
**Mô tả:** {{flow_description}}
**Điểm bắt đầu:** {{start_trigger}}
**Tác nhân:** {{main_actors}}

## 2. Luồng Chính

```mermaid
flowchart TD
    Start([Bắt đầu: {{start_trigger}}])
    --> Step1[{{step_1_label}}]
    --> Decision1{{{decision_1_label}}}
    Decision1 -->|Có| Step2[{{step_2_label}}]
    Decision1 -->|Không| AltEnd([Kết thúc thay thế])
    Step2 --> SuccessEnd([Kết thúc: {{end_success}}])
    style Start fill:#22c55e,color:#fff
    style SuccessEnd fill:#3b82f6,color:#fff
```

## 3. Luồng Thay Thế
{{alternative_flows}}

## 4. Mô Tả Các Bước
| Bước | Tác nhân | Mô tả | Rẽ nhánh |
|------|----------|-------|---------|
| 1 | {{actor_step_1}} | {{desc_step_1}} | |
EOT;
    }

    // ── SQL Logic ─────────────────────────────────────────────────────────────

    private function sqlLogicContent(): string
    {
        return <<<'EOT'
# SQL Logic: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-SQL | **Dự án:** {{project_name}} | **Nhóm:** {{group_name}}

## 1. Bảng Liên Quan
| Bảng | Mô tả | Quan hệ |
|------|-------|---------|
| `{{table_1}}` | {{table_1_desc}} | {{table_1_relation}} |

## 2. Cấu Trúc Bảng Chính
```sql
CREATE TABLE {{main_table}} (
    id BIGSERIAL PRIMARY KEY,
    {{field_1}} {{type_1}} {{constraint_1}},
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Queries Chính
### 3.1 Lấy danh sách
```sql
SELECT t.*, u.name AS created_by_name
FROM {{main_table}} t
LEFT JOIN users u ON u.id = t.created_by
WHERE t.{{filter_field}} = :{{filter_param}}
ORDER BY t.{{sort_field}} {{sort_direction}}
LIMIT :limit OFFSET :offset;
```

### 3.2 Tạo mới
```sql
INSERT INTO {{main_table}} ({{field_1}}, {{field_2}}, created_by, created_at, updated_at)
VALUES (:{{field_1}}, :{{field_2}}, :user_id, NOW(), NOW()) RETURNING id;
```

### 3.3 Cập nhật
```sql
UPDATE {{main_table}} SET {{field_1}} = :{{field_1}}, updated_by = :user_id, updated_at = NOW()
WHERE id = :id;
```

### 3.4 Xóa (Soft Delete)
```sql
UPDATE {{main_table}} SET deleted_at = NOW(), updated_by = :user_id WHERE id = :id;
```
EOT;
    }

    // ── Business Rules ────────────────────────────────────────────────────────

    private function businessRulesContent(): string
    {
        return <<<'EOT'
# Business Rules: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-BR | **Dự án:** {{project_name}} | **Nhóm:** {{group_name}}

## 1. Quy Tắc Kiểm Soát Quyền
| Mã | Tên | Điều kiện | Hành động | Mức độ |
|----|-----|-----------|-----------|--------|
| BR-ACC-01 | {{acc_rule_1_name}} | {{acc_rule_1_condition}} | {{acc_rule_1_action}} | High |

## 2. Quy Tắc Toàn Vẹn Dữ Liệu
| Mã | Tên | Ràng buộc | Áp dụng cho |
|----|-----|-----------|-------------|
| BR-DATA-01 | {{data_rule_1_name}} | {{data_rule_1_constraint}} | {{table_1}} |

## 3. Quy Tắc Quy Trình
| Mã | Tên | Khi nào | Điều kiện | Kết quả |
|----|-----|---------|-----------|---------|
| BR-PROC-01 | {{proc_rule_1_name}} | {{proc_rule_1_when}} | {{proc_rule_1_condition}} | {{proc_rule_1_result}} |

## 4. Quy Tắc Chuyển Trạng Thái
| Từ | Sự kiện | Đến | Điều kiện | Ai thực hiện |
|----|---------|-----|-----------|-------------|
| {{state_1}} | {{event_1}} | {{state_2}} | {{condition_1}} | {{actor_1}} |
EOT;
    }

    // ── Validation Rules ──────────────────────────────────────────────────────

    private function validationRulesContent(): string
    {
        return <<<'EOT'
# Validation Rules: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-VAL | **Dự án:** {{project_name}} | **Nhóm:** {{group_name}}
> **API Endpoint:** `{{http_method}} {{api_endpoint}}`

## 1. Validation Theo Trường
| Trường | Kiểu | Bắt buộc | Quy tắc | Thông báo lỗi | Tầng |
|--------|------|----------|---------|---------------|------|
| `{{field_1}}` | {{type_1}} | {{required_1}} | {{rule_1}} | `{{message_1}}` | Request |

## 2. Chi Tiết Từng Trường
### `{{field_1}}`
| Thuộc tính | Giá trị |
|-----------|---------|
| Kiểu | {{field_1_type}} |
| Bắt buộc | {{field_1_required}} |
| Độ dài tối đa | {{field_1_max}} |
| Regex | `{{field_1_regex}}` |

**Laravel Rule:** `'{{field_1}}' => ['required', 'string', 'max:{{field_1_max}}'],`

## 3. Format Lỗi
### Lỗi validation (422):
```json
{"success": false, "message": "Dữ liệu không hợp lệ", "errors": {"{{field_1}}": ["{{message_1}}"]}}
```
EOT;
    }

    // ── Test Cases ────────────────────────────────────────────────────────────

    private function testCasesContent(): string
    {
        return <<<'EOT'
# Test Cases: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-TC | **Dự án:** {{project_name}} | **Nhóm:** {{group_name}}

## 1. Happy Path
### TC-HP-01: {{happy_test_1_name}}
**Role:** {{happy_test_1_role}} | **Priority:** P0

**Điều kiện tiên quyết:** {{hp1_preconditions}}

| # | Hành động | Dữ liệu |
|---|-----------|---------|
| 1 | {{hp1_step_1}} | {{hp1_input_1}} |

**Kết quả mong đợi:** HTTP {{hp1_expected_status}}
```json
{"success": true, "message": "{{hp1_expected_message}}", "data": {}}
```

## 2. Edge Cases
### TC-EC-01: {{edge_test_1_name}}
| Trường | Giá trị biên | Kết quả mong đợi |
|--------|-------------|-----------------|
| `{{field_1}}` | Rỗng | Lỗi: bắt buộc |
| `{{field_1}}` | Max {{field_1_max}} ký tự | Thành công |
| `{{field_1}}` | Vượt max | Lỗi: quá dài |

## 3. Negative Cases
### TC-NEG-01: Thiếu trường bắt buộc
**Expected:** HTTP 422 — `{"errors": {"{{required_field}}": ["không được để trống"]}}`

## 4. Authorization
### TC-AUTH-01: Không token → 401
### TC-AUTH-02: Không quyền → 403

## 5. Kết Quả Thực Thi
| Mã | Tên | Ngày | Kết quả | Ghi chú |
|----|-----|------|---------|---------|
| TC-HP-01 | {{happy_test_1_name}} | | ⬜ | |
| TC-NEG-01 | Thiếu trường bắt buộc | | ⬜ | |
| TC-AUTH-01 | Không token | | ⬜ | |
EOT;
    }

    // ── Document Checklist ────────────────────────────────────────────────────

    private function checklistContent(): string
    {
        return <<<'EOT'
# Document Checklist: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-CL | **Dự án:** {{project_name}}
> **BA:** {{ba_author}} | **DEV:** {{dev_assignee}} | **Ref version:** {{doc_version}}

## Hướng dẫn
- **DEV**: Đánh dấu ✅ + điền proof (commit/PR/file) sau khi implement
- **BA/PM**: Review, comment nếu sai, đánh dấu ✔ Verified

## 1. API / Backend
### CL-API-01: {{api_checklist_1_title}}
> **Tài liệu gốc:** BRD §4 | **Mô tả:** {{api_checklist_1_desc}}
**Status:** ⬜ | **DEV proof:** *(commit/PR/file — DEV điền)* | **BA review:** *(BA điền)*

## 2. Validation
### CL-VAL-01: {{val_checklist_1_title}}
> **Tài liệu gốc:** VAL §2 | **Trường:** `{{val_field}}`
**Status:** ⬜ | **DEV proof:** *(FormRequest — DEV điền)* | **BA review:** *(BA điền)*

## 3. Business Rules
### CL-BR-01: {{br_checklist_1_title}}
> **Tài liệu gốc:** BR — Rule {{br_rule_code}}
**Status:** ⬜ | **DEV proof:** *(Service method — DEV điền)* | **BA review:** *(BA điền)*

## 4. Database
### CL-DB-01: {{db_checklist_1_title}}
> **Tài liệu gốc:** SQL §2
**Status:** ⬜ | **DEV proof:** *(Migration file — DEV điền)* | **BA review:** *(BA điền)*

## 5. Test
### CL-TC-01: Unit/Feature tests
> **Tài liệu gốc:** TC
**Status:** ⬜ | **DEV proof:** *(Test file — DEV điền)* | **BA review:** *(BA điền)*

## Tổng hợp
| Mã | Hạng mục | DEV | BA | Comment |
|----|----------|-----|-----|---------|
| CL-API-01 | {{api_checklist_1_title}} | ⬜ | — | |
| CL-VAL-01 | {{val_checklist_1_title}} | ⬜ | — | |
| CL-BR-01 | {{br_checklist_1_title}} | ⬜ | — | |
| CL-DB-01 | {{db_checklist_1_title}} | ⬜ | — | |
| CL-TC-01 | Unit/Feature tests | ⬜ | — | |
EOT;
    }
}
