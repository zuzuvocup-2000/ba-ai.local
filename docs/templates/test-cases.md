# Test Cases: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-TC
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản:** {{version}}
> **Trạng thái:** {{status}}

---

## 1. Tổng Quan

**Phạm vi test:** {{test_scope}}
**API / Màn hình:** {{test_target}}
**Môi trường:** {{test_environment}}

**Tài liệu tham chiếu:**
- BRD: [{{requirement_code}}-BRD](./{{requirement_code}}-BRD)
- Validation Rules: [{{requirement_code}}-VAL](./{{requirement_code}}-VAL)
- Flow Diagram: [{{requirement_code}}-FLOW](./{{requirement_code}}-FLOW)

**Thống kê test cases:**

| Loại | Số lượng |
|------|---------|
| Happy Path | {{happy_path_count}} |
| Edge Case | {{edge_case_count}} |
| Negative / Error | {{negative_count}} |
| Security | {{security_count}} |
| **Tổng** | **{{total_count}}** |

---

## 2. Dữ Liệu Test (Test Data)

### 2.1 User test

| Role | Email | Password | Ghi chú |
|------|-------|----------|---------|
| Admin | {{admin_email}} | {{admin_password}} | Full quyền |
| BA | {{ba_email}} | {{ba_password}} | |
| DEV | {{dev_email}} | {{dev_password}} | |
| PM | {{pm_email}} | {{pm_password}} | |

### 2.2 Dữ liệu mẫu hợp lệ

```json
{
    "{{field_1}}": "{{valid_value_1}}",
    "{{field_2}}": "{{valid_value_2}}",
    "{{field_3}}": "{{valid_value_3}}"
}
```

### 2.3 Dữ liệu mẫu không hợp lệ

```json
{
    "{{field_1}}": "",
    "{{field_2}}": "{{invalid_value_2}}",
    "{{field_3}}": null
}
```

---

## 3. Test Cases — Happy Path

### TC-HP-01: {{happy_test_1_name}}

| Thuộc tính | Nội dung |
|-----------|---------|
| **Mã TC** | TC-HP-01 |
| **Tên** | {{happy_test_1_name}} |
| **Mức độ ưu tiên** | P0 — Critical |
| **Role thực hiện** | {{happy_test_1_role}} |

**Điều kiện tiên quyết:**
- {{hp1_precondition_1}}
- {{hp1_precondition_2}}

**Các bước thực hiện:**

| # | Hành động | Dữ liệu đầu vào |
|---|-----------|----------------|
| 1 | {{hp1_step_1}} | {{hp1_input_1}} |
| 2 | {{hp1_step_2}} | {{hp1_input_2}} |
| 3 | {{hp1_step_3}} | |

**Kết quả mong đợi:**
- HTTP Status: `{{hp1_expected_status}}`
- Response:
```json
{
    "success": true,
    "message": "{{hp1_expected_message}}",
    "data": {
        "{{response_field_1}}": "{{response_value_1}}"
    }
}
```
- DB: {{hp1_expected_db_change}}

**Gherkin:**
```gherkin
Scenario: {{happy_test_1_name}}
  Given {{hp1_given}}
  When {{hp1_when}}
  Then {{hp1_then}}
  And {{hp1_and}}
```

---

### TC-HP-02: {{happy_test_2_name}}

| Thuộc tính | Nội dung |
|-----------|---------|
| **Mã TC** | TC-HP-02 |
| **Tên** | {{happy_test_2_name}} |
| **Mức độ ưu tiên** | P1 — High |
| **Role thực hiện** | {{happy_test_2_role}} |

**Điều kiện tiên quyết:** {{hp2_preconditions}}

**Các bước thực hiện:**

| # | Hành động | Dữ liệu đầu vào |
|---|-----------|----------------|
| 1 | {{hp2_step_1}} | {{hp2_input_1}} |
| 2 | {{hp2_step_2}} | |

**Kết quả mong đợi:** {{hp2_expected}}

---

## 4. Test Cases — Edge Cases

### TC-EC-01: {{edge_test_1_name}}

| Thuộc tính | Nội dung |
|-----------|---------|
| **Mã TC** | TC-EC-01 |
| **Tên** | {{edge_test_1_name}} |
| **Mức độ ưu tiên** | P1 — High |
| **Mô tả** | {{edge_test_1_desc}} |

**Dữ liệu biên:**

| Trường | Giá trị biên | Kết quả mong đợi |
|--------|-------------|-----------------|
| `{{field_1}}` | Chuỗi rỗng `""` | Lỗi: `{{field_1}} không được để trống` |
| `{{field_1}}` | Đúng max = {{field_1_max}} ký tự | Thành công |
| `{{field_1}}` | Vượt max = {{field_1_max_plus_1}} ký tự | Lỗi: `{{field_1}} không vượt quá {{field_1_max}} ký tự` |
| `{{field_2}}` | Giá trị nhỏ nhất = {{field_2_min_val}} | Thành công |
| `{{field_2}}` | Giá trị nhỏ hơn min = {{field_2_below_min}} | Lỗi: `{{field_2_min_error}}` |

---

## 5. Test Cases — Negative / Error

### TC-NEG-01: Validation thất bại — Thiếu trường bắt buộc

| Thuộc tính | Nội dung |
|-----------|---------|
| **Mã TC** | TC-NEG-01 |
| **Mức độ ưu tiên** | P0 — Critical |

**Input:** Bỏ trống trường `{{required_field}}`

**Kết quả mong đợi:**
- HTTP Status: `422 Unprocessable Entity`
- Response:
```json
{
    "success": false,
    "message": "Dữ liệu không hợp lệ",
    "errors": {
        "{{required_field}}": ["{{required_field}} không được để trống"]
    }
}
```

---

### TC-NEG-02: {{neg_test_2_name}}

| Thuộc tính | Nội dung |
|-----------|---------|
| **Mã TC** | TC-NEG-02 |
| **Mức độ ưu tiên** | P1 — High |

**Input:** {{neg_test_2_input}}

**Kết quả mong đợi:**
- HTTP Status: `{{neg_test_2_status}}`
- Message: `{{neg_test_2_message}}`

---

### TC-NEG-03: Trùng dữ liệu unique

**Input:** `{{unique_field}}` đã tồn tại trong DB

**Kết quả mong đợi:**
- HTTP Status: `422 Unprocessable Entity`
- Lỗi field: `{{unique_field}}` → `"{{unique_field_error_message}}"`

---

## 6. Test Cases — Phân Quyền (Authorization)

### TC-AUTH-01: Không có token — 401

**Input:** Gọi API không kèm Authorization header

**Kết quả mong đợi:** HTTP `401 Unauthorized`

---

### TC-AUTH-02: Không đủ quyền — 403

| Role | Kết quả mong đợi |
|------|-----------------|
| {{unauthorized_role_1}} | HTTP `403 Forbidden` |
| {{unauthorized_role_2}} | HTTP `403 Forbidden` |
| {{authorized_role}} | HTTP `2xx` |

---

### TC-AUTH-03: Truy cập dữ liệu của người khác

**Điều kiện:** User A cố truy cập/sửa/xóa resource của User B

**Kết quả mong đợi:** HTTP `403 Forbidden` hoặc `404 Not Found`

---

## 7. Test Cases — Security

### TC-SEC-01: SQL Injection
**Input:** `{{field_1}}` = `'; DROP TABLE {{main_table}}; --`
**Kết quả mong đợi:** Validation lỗi hoặc dữ liệu được sanitize, KHÔNG có query injection

### TC-SEC-02: XSS
**Input:** `{{field_1}}` = `<script>alert('xss')</script>`
**Kết quả mong đợi:** Dữ liệu được escape/sanitize trước khi lưu và hiển thị

### TC-SEC-03: Brute force / Rate limit (nếu áp dụng)
**Input:** Gọi API liên tục > {{rate_limit}} lần trong {{rate_limit_window}}
**Kết quả mong đợi:** HTTP `429 Too Many Requests`

---

## 8. Kết Quả Thực Thi

| Mã TC | Tên | Người test | Ngày | Kết quả | Ghi chú |
|-------|-----|-----------|------|---------|---------|
| TC-HP-01 | {{happy_test_1_name}} | | | ⬜ Chưa test | |
| TC-HP-02 | {{happy_test_2_name}} | | | ⬜ Chưa test | |
| TC-EC-01 | {{edge_test_1_name}} | | | ⬜ Chưa test | |
| TC-NEG-01 | Thiếu trường bắt buộc | | | ⬜ Chưa test | |
| TC-NEG-02 | {{neg_test_2_name}} | | | ⬜ Chưa test | |
| TC-NEG-03 | Trùng dữ liệu unique | | | ⬜ Chưa test | |
| TC-AUTH-01 | Không có token | | | ⬜ Chưa test | |
| TC-AUTH-02 | Không đủ quyền | | | ⬜ Chưa test | |
| TC-AUTH-03 | Truy cập data người khác | | | ⬜ Chưa test | |
| TC-SEC-01 | SQL Injection | | | ⬜ Chưa test | |
| TC-SEC-02 | XSS | | | ⬜ Chưa test | |

**Ký hiệu:** ✅ Pass | ❌ Fail | ⚠️ Blocked | ⬜ Chưa test
