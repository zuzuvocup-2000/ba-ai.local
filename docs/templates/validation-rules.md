# Validation Rules: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-VAL
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản:** {{version}}
> **Trạng thái:** {{status}}

---

## 1. Tổng Quan

**API Endpoint:** `{{http_method}} {{api_endpoint}}`
**Mô tả:** Validation cho {{validation_context}}

**Nguyên tắc validation:**
- Validate tại **Request layer** (FormRequest) cho input từ client
- Validate tại **Service layer** cho business rules phức tạp
- Validate tại **DB layer** (constraint) như là lớp bảo vệ cuối cùng
- Mọi lỗi trả về dạng: `{ "errors": { "field_name": ["message"] } }`

---

## 2. Validation Theo Trường

### 2.1 {{group_fields_1}} (ví dụ: Thông tin cơ bản)

| Trường | Kiểu | Bắt buộc | Quy tắc | Thông báo lỗi | Tầng |
|--------|------|----------|---------|---------------|------|
| `{{field_1}}` | {{type_1}} | {{required_1}} | {{rule_1}} | `{{message_1}}` | {{layer_1}} |
| `{{field_2}}` | {{type_2}} | {{required_2}} | {{rule_2}} | `{{message_2}}` | {{layer_2}} |
| `{{field_3}}` | {{type_3}} | {{required_3}} | {{rule_3}} | `{{message_3}}` | {{layer_3}} |

### 2.2 {{group_fields_2}} (ví dụ: Thông tin liên lạc)

| Trường | Kiểu | Bắt buộc | Quy tắc | Thông báo lỗi | Tầng |
|--------|------|----------|---------|---------------|------|
| `{{field_4}}` | {{type_4}} | {{required_4}} | {{rule_4}} | `{{message_4}}` | {{layer_4}} |
| `{{field_5}}` | {{type_5}} | {{required_5}} | {{rule_5}} | `{{message_5}}` | {{layer_5}} |

---

## 3. Chi Tiết Từng Trường

### `{{field_1}}`

| Thuộc tính | Giá trị |
|-----------|---------|
| **Kiểu dữ liệu** | {{field_1_type}} |
| **Bắt buộc** | {{field_1_required}} |
| **Độ dài tối thiểu** | {{field_1_min}} |
| **Độ dài tối đa** | {{field_1_max}} |
| **Định dạng (regex)** | `{{field_1_regex}}` |
| **Unique** | {{field_1_unique}} |
| **Giá trị cho phép** | {{field_1_allowed_values}} |
| **Giá trị mặc định** | {{field_1_default}} |

**Các trường hợp lỗi:**

| # | Tình huống | Thông báo lỗi |
|---|-----------|---------------|
| 1 | Bỏ trống | `{{field_1}} không được để trống` |
| 2 | Sai định dạng | `{{field_1}} không đúng định dạng` |
| 3 | Quá dài | `{{field_1}} không vượt quá {{field_1_max}} ký tự` |
| 4 | Đã tồn tại | `{{field_1}} đã được sử dụng` |

**Laravel FormRequest rule:**
```php
'{{field_1}}' => ['required', 'string', 'max:{{field_1_max}}', '{{field_1_extra_rule}}'],
```

---

### `{{field_2}}`

| Thuộc tính | Giá trị |
|-----------|---------|
| **Kiểu dữ liệu** | {{field_2_type}} |
| **Bắt buộc** | {{field_2_required}} |
| **Quy tắc** | {{field_2_rules}} |
| **Giá trị mặc định** | {{field_2_default}} |

**Các trường hợp lỗi:**

| # | Tình huống | Thông báo lỗi |
|---|-----------|---------------|
| 1 | Bỏ trống | `{{field_2_empty_message}}` |
| 2 | Không hợp lệ | `{{field_2_invalid_message}}` |

**Laravel FormRequest rule:**
```php
'{{field_2}}' => ['required', '{{field_2_rule_1}}', '{{field_2_rule_2}}'],
```

---

## 4. Validation Phức Tạp (Cross-field / Business)

### CV-01: {{cross_validation_1_name}}
> **Mô tả:** {{cross_validation_1_desc}}

**Điều kiện:** Khi `{{field_a}}` = `{{value_a}}` thì `{{field_b}}` phải {{condition_b}}

```php
// Service layer validation
if ($data['{{field_a}}'] === '{{value_a}}') {
    if (empty($data['{{field_b}}'])) {
        throw new ValidationException([
            '{{field_b}}' => ['{{cross_val_1_message}}']
        ]);
    }
}
```

### CV-02: {{cross_validation_2_name}}
> **Mô tả:** {{cross_validation_2_desc}}

**Điều kiện:** {{cross_validation_2_condition}}

```php
// Service layer validation
{{cross_validation_2_code}}
```

---

## 5. Format Chuẩn Response Lỗi

### 5.1 Lỗi validation field (422 Unprocessable Entity)
```json
{
    "success": false,
    "message": "Dữ liệu không hợp lệ",
    "errors": {
        "{{field_1}}": [
            "{{field_1_error_message}}"
        ],
        "{{field_2}}": [
            "{{field_2_error_message}}"
        ]
    }
}
```

### 5.2 Lỗi business rule (422 Unprocessable Entity)
```json
{
    "success": false,
    "message": "{{business_rule_error_message}}",
    "errors": {}
}
```

### 5.3 Lỗi không có quyền (403 Forbidden)
```json
{
    "success": false,
    "message": "Bạn không có quyền thực hiện hành động này",
    "errors": {}
}
```

---

## 6. JSON Schema (dùng cho API documentation / frontend validation)

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "{{requirement_title}} Request",
    "type": "object",
    "required": [{{required_fields_json}}],
    "properties": {
        "{{field_1}}": {
            "type": "{{field_1_json_type}}",
            "maxLength": {{field_1_max}},
            "description": "{{field_1_desc}}"
        },
        "{{field_2}}": {
            "type": "{{field_2_json_type}}",
            "enum": [{{field_2_enum_values}}],
            "description": "{{field_2_desc}}"
        }
    },
    "additionalProperties": false
}
```

---

## 7. Ghi Chú Triển Khai

- **FormRequest class:** `App\Http\Requests\{{request_class_name}}`
- **Service validation:** `App\Services\{{service_name}}`
- **DB constraints:** Xem [SQL Logic document](./{{requirement_code}}-SQL)
- {{implementation_note_1}}
- {{implementation_note_2}}
