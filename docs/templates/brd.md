# BRD: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-BRD
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản:** {{version}}
> **Trạng thái:** {{status}}

---

## 1. Thông Tin Tổng Quan

### 1.1 Mục đích
> Mô tả ngắn gọn mục đích của chức năng này và giá trị mang lại cho người dùng.

{{purpose}}

### 1.2 Phạm vi
> Xác định rõ những gì THUỘC và KHÔNG THUỘC phạm vi của chức năng này.

**Trong phạm vi:**
- {{in_scope_1}}

**Ngoài phạm vi:**
- {{out_of_scope_1}}

### 1.3 Tài liệu liên quan

| Tài liệu | Mã | Ghi chú |
|----------|----|---------|
| {{related_doc_name}} | {{related_doc_code}} | {{related_doc_note}} |

---

## 2. Tác Nhân (Actors)

| Tác nhân | Vai trò | Quyền hạn |
|----------|---------|-----------|
| {{actor_1}} | {{actor_1_role}} | {{actor_1_permission}} |
| {{actor_2}} | {{actor_2_role}} | {{actor_2_permission}} |

---

## 3. Điều Kiện (Conditions)

### 3.1 Điều kiện tiên quyết (Preconditions)
> Những điều kiện phải thỏa mãn TRƯỚC KHI chức năng được thực hiện.

- {{precondition_1}}
- {{precondition_2}}

### 3.2 Hậu điều kiện (Postconditions)
> Trạng thái hệ thống SAU KHI chức năng thực hiện thành công.

- {{postcondition_1}}
- {{postcondition_2}}

---

## 4. Yêu Cầu Chức Năng

### 4.1 Luồng chính (Main Flow)

| Bước | Tác nhân | Hành động | Phản hồi hệ thống |
|------|----------|-----------|-------------------|
| 1 | {{actor}} | {{action_1}} | {{system_response_1}} |
| 2 | Hệ thống | {{action_2}} | {{system_response_2}} |
| 3 | {{actor}} | {{action_3}} | {{system_response_3}} |

### 4.2 Luồng thay thế (Alternative Flows)

#### AF-01: {{alternative_flow_1_name}}
> **Điều kiện kích hoạt:** {{af1_trigger}}

| Bước | Tác nhân | Hành động |
|------|----------|-----------|
| AF-01.1 | {{actor}} | {{af1_step_1}} |
| AF-01.2 | Hệ thống | {{af1_step_2}} |

#### AF-02: {{alternative_flow_2_name}}
> **Điều kiện kích hoạt:** {{af2_trigger}}

| Bước | Tác nhân | Hành động |
|------|----------|-----------|
| AF-02.1 | {{actor}} | {{af2_step_1}} |

### 4.3 Luồng ngoại lệ (Exception Flows)

| Mã | Tình huống | Xử lý | Thông báo người dùng |
|----|-----------|-------|----------------------|
| EX-01 | {{exception_1}} | {{exception_1_handle}} | {{exception_1_message}} |
| EX-02 | {{exception_2}} | {{exception_2_handle}} | {{exception_2_message}} |

---

## 5. Yêu Cầu Dữ Liệu

### 5.1 Dữ liệu đầu vào (Input Data)

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|--------|------|----------|-------|-------|
| {{field_1}} | {{type_1}} | {{required_1}} | {{desc_1}} | {{example_1}} |
| {{field_2}} | {{type_2}} | {{required_2}} | {{desc_2}} | {{example_2}} |

### 5.2 Dữ liệu đầu ra (Output Data)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| {{output_field_1}} | {{output_type_1}} | {{output_desc_1}} |

### 5.3 Bảng dữ liệu liên quan

| Bảng | Thao tác | Điều kiện |
|------|----------|-----------|
| {{table_1}} | {{operation_1}} | {{condition_1}} |

---

## 6. Yêu Cầu Phi Chức Năng

| Tiêu chí | Yêu cầu | Ghi chú |
|----------|---------|---------|
| Hiệu năng | {{performance_req}} | |
| Bảo mật | {{security_req}} | |
| Khả năng dùng | {{usability_req}} | |
| Khả năng mở rộng | {{scalability_req}} | |

---

## 7. Giao Diện Người Dùng (UI Requirements)

### 7.1 Màn hình: {{screen_name}}
> **Mô tả:** {{screen_description}}

**Các thành phần UI:**
- {{ui_component_1}}
- {{ui_component_2}}

**Hành vi:**
- {{ui_behavior_1}}

---

## 8. Tiêu Chí Chấp Nhận (Acceptance Criteria)

> Các điều kiện để xác nhận chức năng đã được implement đúng theo yêu cầu.

- [ ] {{acceptance_criteria_1}}
- [ ] {{acceptance_criteria_2}}
- [ ] {{acceptance_criteria_3}}

---

## 9. Giả Định & Ràng Buộc

### 9.1 Giả định (Assumptions)
- {{assumption_1}}
- {{assumption_2}}

### 9.2 Ràng buộc (Constraints)
- {{constraint_1}}
- {{constraint_2}}

---

## 10. Lịch Sử Thay Đổi

| Phiên bản | Ngày | Người thay đổi | Mô tả |
|-----------|------|----------------|-------|
| 1.0 | {{created_date}} | {{author}} | Tạo mới |
| {{version}} | {{change_date}} | {{change_author}} | {{change_desc}} |
