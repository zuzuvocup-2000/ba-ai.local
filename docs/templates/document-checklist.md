# Document Checklist: {{requirement_title}}

> **Mã tài liệu:** {{requirement_code}}-CL
> **Dự án:** {{project_name}}
> **Cụm chức năng:** {{group_name}}
> **BA phụ trách:** {{ba_author}}
> **DEV phụ trách:** {{dev_assignee}}
> **Ngày tạo:** {{created_date}}
> **Phiên bản tài liệu tham chiếu:** {{doc_version}}

---

## Hướng Dẫn Sử Dụng

| Đối tượng | Hành động |
|-----------|-----------|
| **DEV** | Đánh dấu ✅ từng item sau khi implement, điền link commit/PR/file làm bằng chứng |
| **BA / PM** | Review từng item DEV đánh dấu done, comment nếu sai hoặc thiếu, đánh dấu ✔ Verified |

**Trạng thái item:**
- `⬜ Chưa làm` → `🔄 Đang làm` → `✅ DEV done` → `✔ BA verified` | `❌ BA rejected`

---

## 1. Checklist — API / Backend

### CL-API-01: {{api_checklist_1_title}}
> **Tài liệu gốc:** [{{doc_ref_1}}](./{{doc_ref_1_link}}) — Mục {{doc_ref_1_section}}
> **Mô tả:** {{api_checklist_1_desc}}

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Commit: *(để trống — DEV điền)*
- PR: *(để trống — DEV điền)*
- File: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

### CL-API-02: {{api_checklist_2_title}}
> **Tài liệu gốc:** [{{doc_ref_2}}](./{{doc_ref_2_link}}) — Mục {{doc_ref_2_section}}
> **Mô tả:** {{api_checklist_2_desc}}

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Commit: *(để trống — DEV điền)*
- PR: *(để trống — DEV điền)*
- File: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

## 2. Checklist — Validation

### CL-VAL-01: {{val_checklist_1_title}}
> **Tài liệu gốc:** [{{requirement_code}}-VAL](./{{requirement_code}}-VAL) — Mục {{val_ref_section}}
> **Mô tả:** {{val_checklist_1_desc}}
> **Trường liên quan:** `{{val_field}}`

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- FormRequest class: *(để trống — DEV điền)*
- Commit: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

### CL-VAL-02: {{val_checklist_2_title}}
> **Tài liệu gốc:** [{{requirement_code}}-VAL](./{{requirement_code}}-VAL)
> **Mô tả:** {{val_checklist_2_desc}}

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Commit: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

## 3. Checklist — Business Rules

### CL-BR-01: {{br_checklist_1_title}}
> **Tài liệu gốc:** [{{requirement_code}}-BR](./{{requirement_code}}-BR) — Rule {{br_rule_code}}
> **Mô tả:** {{br_checklist_1_desc}}

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Service method: *(để trống — DEV điền)*
- Commit: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

## 4. Checklist — Database

### CL-DB-01: {{db_checklist_1_title}}
> **Tài liệu gốc:** [{{requirement_code}}-SQL](./{{requirement_code}}-SQL) — Mục {{db_ref_section}}
> **Mô tả:** {{db_checklist_1_desc}}

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Migration file: *(để trống — DEV điền)*
- Commit: *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

## 5. Checklist — Test

### CL-TC-01: Unit test / Feature test đã viết
> **Tài liệu gốc:** [{{requirement_code}}-TC](./{{requirement_code}}-TC)
> **Mô tả:** Viết test cases theo tài liệu test

**Status:** ⬜ Chưa làm

**DEV chứng minh:**
- Test file: *(để trống — DEV điền)*
- Kết quả test: `php artisan test` → *(để trống — DEV điền)*
- Ghi chú DEV: *(để trống — DEV điền)*

**BA/PM review:**
- [ ] Đã kiểm tra và xác nhận đúng
- Comment: *(để trống — BA điền)*

---

## 6. Bảng Tổng Hợp Trạng Thái

| Mã | Hạng mục | DEV Status | BA Status | Comment |
|----|----------|-----------|-----------|---------|
| CL-API-01 | {{api_checklist_1_title}} | ⬜ | — | |
| CL-API-02 | {{api_checklist_2_title}} | ⬜ | — | |
| CL-VAL-01 | {{val_checklist_1_title}} | ⬜ | — | |
| CL-VAL-02 | {{val_checklist_2_title}} | ⬜ | — | |
| CL-BR-01 | {{br_checklist_1_title}} | ⬜ | — | |
| CL-DB-01 | {{db_checklist_1_title}} | ⬜ | — | |
| CL-TC-01 | Unit/Feature tests | ⬜ | — | |

**Tiến độ:** 0 / {{total_items}} items hoàn thành

---

## 7. Lịch Sử Comment

> Mọi comment rejection đều được ghi lại ở đây để trace.

| Ngày | Người | Item | Loại | Nội dung |
|------|-------|------|------|---------|
| *(tự động điền)* | | | | |
