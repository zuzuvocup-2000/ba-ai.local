# Business Rules: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-BR
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **Tác giả:** {{author}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản:** {{version}}
> **Trạng thái:** {{status}}

---

## 1. Tổng Quan

**Mô tả:** {{business_rules_overview}}

**Phân loại rule trong tài liệu này:**

| Ký hiệu | Phân loại | Mô tả |
|---------|-----------|-------|
| BR-ACC | Access Control | Quy tắc kiểm soát quyền truy cập |
| BR-DATA | Data Integrity | Quy tắc toàn vẹn dữ liệu |
| BR-PROC | Process | Quy tắc quy trình nghiệp vụ |
| BR-CALC | Calculation | Quy tắc tính toán |
| BR-STATE | State Machine | Quy tắc chuyển trạng thái |
| BR-LIMIT | Limitation | Giới hạn hệ thống |

---

## 2. Quy Tắc Kiểm Soát Quyền (Access Control)

| Mã Rule | Tên Rule | Điều kiện | Hành động | Mức độ |
|---------|----------|-----------|-----------|--------|
| BR-ACC-01 | {{acc_rule_1_name}} | {{acc_rule_1_condition}} | {{acc_rule_1_action}} | {{acc_rule_1_priority}} |
| BR-ACC-02 | {{acc_rule_2_name}} | {{acc_rule_2_condition}} | {{acc_rule_2_action}} | {{acc_rule_2_priority}} |

**Chi tiết:**

### BR-ACC-01: {{acc_rule_1_name}}
- **Điều kiện:** {{acc_rule_1_condition}}
- **Hành động khi vi phạm:** {{acc_rule_1_violation}}
- **Thông báo:** `{{acc_rule_1_message}}`
- **Nơi kiểm tra:** {{acc_rule_1_check_location}} (Middleware / Policy / Service)

---

## 3. Quy Tắc Toàn Vẹn Dữ Liệu (Data Integrity)

| Mã Rule | Tên Rule | Ràng buộc | Áp dụng cho | Mức độ |
|---------|----------|-----------|-------------|--------|
| BR-DATA-01 | {{data_rule_1_name}} | {{data_rule_1_constraint}} | {{data_rule_1_applies_to}} | {{data_rule_1_priority}} |
| BR-DATA-02 | {{data_rule_2_name}} | {{data_rule_2_constraint}} | {{data_rule_2_applies_to}} | {{data_rule_2_priority}} |

**Chi tiết:**

### BR-DATA-01: {{data_rule_1_name}}
- **Ràng buộc:** {{data_rule_1_constraint}}
- **Ví dụ vi phạm:** {{data_rule_1_example_violation}}
- **Xử lý:** {{data_rule_1_handle}}
- **Tầng xử lý:** {{data_rule_1_layer}} (DB constraint / Service / Request validation)

---

## 4. Quy Tắc Quy Trình Nghiệp Vụ (Process Rules)

| Mã Rule | Tên Rule | Khi nào áp dụng | Điều kiện | Kết quả |
|---------|----------|----------------|-----------|---------|
| BR-PROC-01 | {{proc_rule_1_name}} | {{proc_rule_1_when}} | {{proc_rule_1_condition}} | {{proc_rule_1_result}} |
| BR-PROC-02 | {{proc_rule_2_name}} | {{proc_rule_2_when}} | {{proc_rule_2_condition}} | {{proc_rule_2_result}} |

**Chi tiết:**

### BR-PROC-01: {{proc_rule_1_name}}
- **Khi nào:** {{proc_rule_1_when}}
- **Điều kiện:** {{proc_rule_1_condition}}
- **Kết quả mong đợi:** {{proc_rule_1_result}}
- **Ngoại lệ:** {{proc_rule_1_exception}}

---

## 5. Quy Tắc Tính Toán (Calculation Rules)

| Mã Rule | Tên Rule | Công thức | Điều kiện áp dụng |
|---------|----------|-----------|-------------------|
| BR-CALC-01 | {{calc_rule_1_name}} | `{{calc_rule_1_formula}}` | {{calc_rule_1_condition}} |

**Chi tiết:**

### BR-CALC-01: {{calc_rule_1_name}}
- **Công thức:** `{{calc_rule_1_formula}}`
- **Các biến:**
  - `{{var_1}}`: {{var_1_desc}}
  - `{{var_2}}`: {{var_2_desc}}
- **Ví dụ:** {{calc_rule_1_example}}
- **Làm tròn:** {{rounding_rule}}
- **Đơn vị:** {{unit}}

---

## 6. Quy Tắc Chuyển Trạng Thái (State Machine)

```
Trạng thái của: {{entity_name}}

{{state_1}} ──[{{transition_1}}]──→ {{state_2}}
{{state_2}} ──[{{transition_2}}]──→ {{state_3}}
{{state_2}} ──[{{transition_3}}]──→ {{state_1}} (rollback)
{{state_3}} ──[{{transition_4}}]──→ {{state_4}} (final)
```

| Từ trạng thái | Sự kiện | Đến trạng thái | Điều kiện | Ai thực hiện |
|---------------|---------|----------------|-----------|-------------|
| {{state_1}} | {{event_1}} | {{state_2}} | {{condition_1}} | {{actor_1}} |
| {{state_2}} | {{event_2}} | {{state_3}} | {{condition_2}} | {{actor_2}} |
| {{state_2}} | {{event_3}} | {{state_1}} | {{condition_3}} | {{actor_3}} |

---

## 7. Giới Hạn Hệ Thống (Limitations)

| Mã Rule | Giới hạn | Giá trị | Lý do |
|---------|----------|---------|-------|
| BR-LIMIT-01 | {{limit_1_name}} | {{limit_1_value}} | {{limit_1_reason}} |
| BR-LIMIT-02 | {{limit_2_name}} | {{limit_2_value}} | {{limit_2_reason}} |

---

## 8. Ma Trận Xung Đột Rule

> Khi nhiều rule cùng áp dụng, rule có **độ ưu tiên cao hơn** sẽ được thực thi trước.

| Rule A | Rule B | Xung đột | Giải quyết |
|--------|--------|----------|-----------|
| BR-ACC-01 | BR-PROC-01 | {{conflict_desc}} | {{conflict_resolution}} |

---

## 9. Nguồn Gốc & Lý Do

| Mã Rule | Nguồn gốc | Ngày áp dụng | Người quyết định |
|---------|-----------|-------------|-----------------|
| BR-ACC-01 | {{source_1}} | {{date_1}} | {{decider_1}} |
| BR-DATA-01 | {{source_2}} | {{date_2}} | {{decider_2}} |
