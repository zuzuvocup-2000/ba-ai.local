# SQL Logic: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-SQL
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản:** {{version}}
> **Trạng thái:** {{status}}

---

## 1. Bảng Dữ Liệu Liên Quan

| Bảng | Mô tả | Quan hệ |
|------|-------|---------|
| `{{table_1}}` | {{table_1_desc}} | {{table_1_relation}} |
| `{{table_2}}` | {{table_2_desc}} | {{table_2_relation}} |
| `{{table_3}}` | {{table_3_desc}} | {{table_3_relation}} |

---

## 2. Cấu Trúc Bảng Chính

```sql
-- Bảng: {{main_table}}
-- Mô tả: {{main_table_desc}}
CREATE TABLE {{main_table}} (
    id          BIGSERIAL PRIMARY KEY,
    {{field_1}} {{type_1}} {{constraint_1}}, -- {{field_1_desc}}
    {{field_2}} {{type_2}} {{constraint_2}}, -- {{field_2_desc}}
    {{field_3}} {{type_3}} {{constraint_3}}, -- {{field_3_desc}}
    created_by  BIGINT REFERENCES users(id),
    updated_by  BIGINT REFERENCES users(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Index khuyến nghị
CREATE INDEX idx_{{main_table}}_{{index_field}} ON {{main_table}}({{index_field}});
```

---

## 3. Queries Chính

### 3.1 Lấy danh sách (List / Paginate)

```sql
-- Mục đích: {{list_query_purpose}}
-- Gọi từ: {{list_query_caller}}
SELECT
    t.id,
    t.{{field_1}},
    t.{{field_2}},
    u.name AS created_by_name,
    t.created_at
FROM {{main_table}} t
LEFT JOIN users u ON u.id = t.created_by
WHERE
    t.{{filter_field_1}} = :{{filter_param_1}}     -- Filter: {{filter_desc_1}}
    AND t.{{filter_field_2}} = :{{filter_param_2}} -- Filter: {{filter_desc_2}}
    AND t.deleted_at IS NULL
ORDER BY t.{{sort_field}} {{sort_direction}}
LIMIT :limit OFFSET :offset;
```

### 3.2 Lấy chi tiết (Detail / Show)

```sql
-- Mục đích: {{detail_query_purpose}}
SELECT
    t.*,
    u.name AS created_by_name,
    u2.name AS updated_by_name
FROM {{main_table}} t
LEFT JOIN users u  ON u.id  = t.created_by
LEFT JOIN users u2 ON u2.id = t.updated_by
WHERE t.id = :id
LIMIT 1;
```

### 3.3 Tạo mới (Insert)

```sql
-- Mục đích: {{insert_purpose}}
-- Validation trước khi insert: xem Validation Rules document
INSERT INTO {{main_table}} (
    {{field_1}},
    {{field_2}},
    {{field_3}},
    created_by,
    created_at,
    updated_at
)
VALUES (
    :{{field_1}},
    :{{field_2}},
    :{{field_3}},
    :user_id,
    NOW(),
    NOW()
)
RETURNING id;
```

### 3.4 Cập nhật (Update)

```sql
-- Mục đích: {{update_purpose}}
-- Điều kiện: chỉ người tạo hoặc Admin mới được sửa
UPDATE {{main_table}}
SET
    {{field_1}}  = :{{field_1}},
    {{field_2}}  = :{{field_2}},
    updated_by   = :user_id,
    updated_at   = NOW()
WHERE
    id         = :id
    AND (created_by = :user_id OR :is_admin = TRUE); -- Kiểm tra quyền
```

### 3.5 Xóa (Delete / Soft Delete)

```sql
-- Mục đích: {{delete_purpose}}
-- Chiến lược: {{delete_strategy}} (soft delete / hard delete)

-- Soft delete (khuyến nghị):
UPDATE {{main_table}}
SET
    deleted_at = NOW(),
    updated_by = :user_id
WHERE id = :id
  AND created_by = :user_id; -- Chỉ chủ sở hữu mới được xóa

-- Hard delete (chỉ dùng nếu thực sự cần):
-- DELETE FROM {{main_table}} WHERE id = :id;
```

---

## 4. Queries Phụ

### 4.1 {{sub_query_1_name}}

```sql
-- Mục đích: {{sub_query_1_purpose}}
{{sub_query_1_sql}}
```

### 4.2 {{sub_query_2_name}}

```sql
-- Mục đích: {{sub_query_2_purpose}}
{{sub_query_2_sql}}
```

---

## 5. Transaction Logic

```sql
-- Mục đích: {{transaction_purpose}}
-- Cần transaction khi: {{transaction_condition}}

BEGIN;

    -- Bước 1: {{transaction_step_1}}
    {{transaction_sql_1}};

    -- Bước 2: {{transaction_step_2}}
    {{transaction_sql_2}};

    -- Bước 3: Kiểm tra ràng buộc
    -- Nếu lỗi → ROLLBACK tự động

COMMIT;
```

---

## 6. Index & Performance

| Index | Trường | Loại | Mục đích |
|-------|--------|------|---------|
| `idx_{{table}}_{{field_1}}` | `{{field_1}}` | BTREE | {{index_purpose_1}} |
| `idx_{{table}}_{{field_2}}` | `{{field_2}}` | BTREE | {{index_purpose_2}} |
| `idx_{{table}}_composite` | `({{field_1}}, {{field_2}})` | BTREE | {{composite_purpose}} |

**Lưu ý hiệu năng:**
- {{performance_note_1}}
- {{performance_note_2}}

---

## 7. Migration

```sql
-- Migration: {{migration_name}}
-- Mô tả: {{migration_desc}}

-- UP
ALTER TABLE {{main_table}} ADD COLUMN {{new_field}} {{new_type}} {{new_constraint}};

-- DOWN (rollback)
ALTER TABLE {{main_table}} DROP COLUMN {{new_field}};
```

---

## 8. Seed / Default Data

```sql
-- Dữ liệu mặc định (nếu cần)
INSERT INTO {{main_table}} ({{field_1}}, {{field_2}}, created_at)
VALUES
    ({{seed_value_1_1}}, {{seed_value_1_2}}, NOW()),
    ({{seed_value_2_1}}, {{seed_value_2_2}}, NOW());
```
