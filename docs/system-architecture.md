# Kiến Trúc Hệ Thống AI BA Assistant

> Phiên bản: 1.2 | Ngày: 2026-04-16

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mục tiêu

Hệ thống **AI BA Assistant** hỗ trợ Business Analyst chuyển đổi requirement thô thành tài liệu kỹ thuật chuẩn, tích hợp AI để tăng tốc quá trình phân tích và đảm bảo chất lượng tài liệu.

### 1.2 Luồng xử lý chính

```
[Project]
    ↓
[Feature Group / Folder]               ← Cụm chức năng (VD: Quản lý User)
    ↓
[Requirement]                          ← Chức năng đơn lẻ (VD: Thêm user)
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 1 — PHÂN TÍCH CÓ CẤU TRÚC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Raw Requirement Input]
    ↓
[AI Pre-fill Analysis Form]            ← AI đọc raw text → tự điền form phân tích
    ↓
[Structured Analysis Form]             ← User review/chỉnh form (actors, flows, fields...)
    ↓ (user submit)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 2 — GENERATE TÀI LIỆU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI Generation Engine] ←→ [Template Engine]
    (dùng structured analysis + group context)
    ↓
[Document Draft]                       ← BRD / Flow / SQL / Rules / Validation / TestCase
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 3 — TINH CHỈNH QUA CHAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Human sends chat message]
    ↓
[AI proposes changes]                  ← AI KHÔNG tự sửa, chỉ đề xuất
    ↓
[Change Proposal Preview]              ← Diff view: đỏ = xóa, xanh = thêm
    ↓
[User: Accept ✓ | Dismiss ✗]
    ↓ (Accept)
[Document Updated + Version Snapshot]
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 4 — REVIEW & APPROVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Submit for Review] → [PM Approve/Reject]
    ↓ (approve)
[Published Document — Version Locked]
```

### 1.3 Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                            │
│  ┌──────────────────┐     ┌──────────────────────────┐  │
│  │  Frontend Admin  │     │     Frontend User         │  │
│  │  (React + Vite)  │     │     (React + Vite)        │  │
│  └────────┬─────────┘     └───────────┬──────────────┘  │
└───────────┼───────────────────────────┼─────────────────┘
            │            HTTPS / REST API│
┌───────────▼───────────────────────────▼─────────────────┐
│                  Laravel 13 API Backend                  │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────────┐ │
│  │  Auth /    │ │  Document  │ │   AI Orchestration    │ │
│  │  RBAC      │ │  Modules   │ │   Service             │ │
│  └────────────┘ └────────────┘ └───────────────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────────┐ │
│  │  Project   │ │  Template  │ │   Version Control     │ │
│  │  Module    │ │  Module    │ │   Module              │ │
│  └────────────┘ └────────────┘ └───────────────────────┘ │
└────────────────────┬────────────────────┬────────────────┘
                     │                    │
         ┌───────────▼───┐    ┌───────────▼───────┐
         │  PostgreSQL   │    │      MongoDB       │
         │  (main data)  │    │  (logs + AI chat)  │
         └───────────────┘    └────────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   Claude API /      │
                              │   AI Provider       │
                              └────────────────────┘
```

---

## 2. Các Module Chính

### Module 1: Feature Groups (Folder / Cụm chức năng)
**Mục đích:** Tổ chức requirements theo cụm chức năng, tạo cây phân cấp tài liệu logic

**Ví dụ cấu trúc thực tế:**
```
📁 Quản lý User
├── 📄 REQ-001  Xem danh sách user
│   ├── 📑 BRD · Flow Diagram · SQL Logic · Business Rules · Validation · Test Cases
├── 📄 REQ-002  Thêm user mới
│   ├── 📑 BRD · Flow Diagram · SQL Logic · Business Rules · Validation · Test Cases
├── 📄 REQ-003  Sửa thông tin user
│   └── 📑 ...
└── 📄 REQ-004  Xóa user
    └── 📑 ...

📁 Quản lý Sản phẩm
├── 📁 Sản phẩm cơ bản          ← Sub-group (2 cấp)
│   ├── 📄 REQ-005  Xem danh sách
│   └── 📄 REQ-006  Thêm sản phẩm
└── 📁 Biến thể sản phẩm
    └── 📄 REQ-007  Quản lý size/màu

📁 Quản lý Đơn hàng
└── ...
```

| Tính năng | Mô tả |
|-----------|-------|
| Cây 2 cấp | Group → Sub-group (tránh lồng quá sâu) |
| Sắp xếp | Drag-drop để thay đổi thứ tự |
| Màu / icon | Phân biệt nhanh các cụm trên UI |
| Bulk generate | Sinh tài liệu cho toàn bộ requirements trong group cùng lúc |
| Progress | Hiển thị % tài liệu đã hoàn thành trong group |
| AI context | Tên group được đưa vào prompt để AI hiểu ngữ cảnh chức năng |

---

### Module 1.5: Requirements Management
**Mục đích:** Tiếp nhận, phân loại và quản lý requirement thô

| Chức năng | Mô tả |
|-----------|-------|
| Nhập requirement | Text, paste, upload file (.docx, .pdf, .txt) |
| Thuộc về group | Mỗi requirement gắn với 1 feature group |
| Phân loại | Gắn tag: functional, non-functional, constraint |
| Trạng thái | `draft` → `in_analysis` → `completed` → `archived` |
| Auto-code | Code tự sinh theo group: `UM-001`, `UM-002`... |

---

### Module 2: Document Generation (Core)
**Mục đích:** AI sinh tài liệu từ requirement, chia thành 2 giai đoạn rõ ràng

#### Giai đoạn 2A — Structured Analysis (Phân tích có cấu trúc)

Trước khi generate, user phải điền **Analysis Form** theo từng loại tài liệu.  
AI có thể **pre-fill form** từ raw requirement text — user chỉ cần review và bổ sung.

**Schema chung của Analysis Form (lưu dạng JSONB):**

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| `actors` | Các tác nhân liên quan | `["Admin", "User đã đăng nhập"]` |
| `preconditions` | Điều kiện tiên quyết | `"User đã có tài khoản"` |
| `main_flow` | Các bước luồng chính | `[{step:1, desc:"..."}, ...]` |
| `alternative_flows` | Luồng thay thế | `[{condition:"...", steps:[...]}]` |
| `exception_flows` | Luồng ngoại lệ / lỗi | `[{trigger:"...", handle:"..."}]` |
| `business_rules` | Ràng buộc nghiệp vụ | `["Email là duy nhất", ...]` |
| `data_fields` | Các trường dữ liệu | `[{name:"email", type:"string", required:true}]` |
| `non_functional` | Yêu cầu phi chức năng | `"Tải trang < 2s"` |
| `notes` | Ghi chú thêm | `"Tham khảo màn PRD-012"` |

**Schema riêng mở rộng theo loại document:**

```
BRD         → thêm: scope, assumptions, constraints, success_criteria
Flow Diagram→ thêm: start_trigger, end_states, decision_points
SQL Logic   → thêm: entities, operations[], joins[], filters[], sort[]
Test Cases  → thêm: test_types[], input_samples[], expected_outputs[]
Val. Rules  → thêm: fields[] với rule details (min/max/regex/unique...)
Bus. Rules  → thêm: rule_category (financial/access/data/process)
```

#### Giai đoạn 2B — AI Generate Document

AI nhận input gồm: **structured analysis** + **group context** + **template** → sinh document.

**6 loại tài liệu được sinh ra:**

| Loại | Format lưu trữ | Template |
|------|----------------|----------|
| Flow Diagram | Mermaid/PlantUML code | Có |
| BRD | Markdown / HTML | Có |
| SQL Logic | SQL text | Có |
| Business Rules | Markdown table | Có |
| Validation Rules | JSON Schema + Markdown | Có |
| Test Cases | Markdown table / Gherkin | Có |

**Trạng thái document:** `generating` → `draft` → `under_review` → `approved` → `archived`

---

### Module 3: Template Engine
**Mục đích:** Quản lý template mặc định cho từng loại tài liệu

| Tính năng | Mô tả |
|-----------|-------|
| Global template | Admin định nghĩa, áp dụng cho toàn hệ thống |
| Project template | Override template theo từng project |
| Placeholder | `{{requirement_title}}`, `{{date}}`, `{{author}}`, `{{project_name}}`... |
| Versioned template | Template cũng có version history |

**Template files mặc định** (seed vào DB khi deploy):

| Loại | File gốc | Mã |
|------|----------|----|
| BRD | `docs/templates/brd.md` | `*-BRD` |
| Flow Diagram | `docs/templates/flow-diagram.md` | `*-FLOW` |
| SQL Logic | `docs/templates/sql-logic.md` | `*-SQL` |
| Business Rules | `docs/templates/business-rules.md` | `*-BR` |
| Validation Rules | `docs/templates/validation-rules.md` | `*-VAL` |
| Test Cases | `docs/templates/test-cases.md` | `*-TC` |
| Document Checklist | `docs/templates/document-checklist.md` | `*-CL` |

---

### Module 4.5: Document Checklist
**Mục đích:** Chứng minh DEV đã implement đúng tài liệu; BA/PM xác nhận hoặc reject từng hạng mục

#### Vị trí trong luồng

```
[Document Approved] (BA + PM đã duyệt)
        ↓
[AI auto-generate Checklist]    ← AI đọc document → sinh danh sách checklist items
        ↓                           theo từng nhóm: API, Validation, Business Rules, DB, Test
[Checklist Published]
        ↓
[DEV nhìn vào Checklist, implement từng item]
        ↓ (từng item)
[DEV đánh dấu Done + điền proof (commit/PR/file)]
        ↓
[BA/PM review từng item DEV done]
        ├── ✔ Verified   → item hoàn thành
        └── ❌ Rejected  → item có comment giải thích sai chỗ nào
                               ↓
                          [DEV đọc comment, fix, re-submit item]
```

#### Các loại checklist items (tự động sinh từ document)

| Nhóm | Ký hiệu | Sinh từ tài liệu nào | Ví dụ |
|------|---------|---------------------|-------|
| API / Backend | `CL-API` | BRD (Section 4) | Implement endpoint POST /users |
| Validation | `CL-VAL` | Validation Rules | Validate email: required, format, max 255, unique |
| Business Rules | `CL-BR` | Business Rules | Kiểm tra BR-ACC-01: chỉ Admin mới được tạo user |
| Database | `CL-DB` | SQL Logic | Tạo migration thêm bảng users, index email |
| Test | `CL-TC` | Test Cases | Viết feature test cho TC-HP-01, TC-NEG-01..03 |
| UI | `CL-UI` | BRD (Section 7) | Implement form với validation inline |

#### Vòng đời item

```
⬜ not_started
    ↓ DEV bắt đầu
🔄 in_progress
    ↓ DEV submit + điền proof
✅ dev_done
    ↓ BA/PM review
    ├── ✔ verified    ← BA xác nhận đúng
    └── ❌ rejected   ← BA comment sai chỗ nào → DEV đọc, fix
                                                    ↓
                                              🔄 in_progress (lại)
```

#### Comment types

| Loại | Ai dùng | Mục đích |
|------|---------|---------|
| `clarification` | BA / DEV | Hỏi thêm về yêu cầu |
| `correction_ba` | BA | Tài liệu BA viết sai → đính chính |
| `correction_dev` | BA/PM | DEV làm sai so với tài liệu |
| `approval` | BA/PM | Xác nhận item đúng |
| `rejection` | BA/PM | Từ chối với lý do cụ thể |
| `general` | Tất cả | Ghi chú thêm |

---

### Module 4: AI Chat & Refinement (Change Proposal Flow)
**Mục đích:** Trao đổi với AI để tinh chỉnh tài liệu — AI chỉ đề xuất, không tự sửa

#### Luồng đề xuất thay đổi (Change Proposal Flow)

```
User gõ message
    ↓
AI phân tích document hiện tại + message
    ↓
AI trả về:
    ├── [explanation]   Giải thích sẽ thay đổi gì và tại sao
    ├── [proposed_content]  Toàn bộ nội dung mới đề xuất
    └── [change_summary]  Tóm tắt ngắn: "Thêm 3 validation rules cho email"
    ↓
Frontend render Change Proposal Card:
    ┌─────────────────────────────────────────────┐
    │ 💬 AI: "Tôi đề xuất bổ sung..."             │
    │                                             │
    │ 📋 PREVIEW THAY ĐỔI                         │
    │ ─────────────────────────────────────────── │
    │ - email phải đúng định dạng                 │  ← đỏ = xóa
    │ + email: required, format, max 255 chars    │  ← xanh = thêm
    │ + email: unique trong bảng users            │  ← xanh = thêm
    │ ─────────────────────────────────────────── │
    │  [✓ Chấp nhận thay đổi]  [✗ Bỏ qua]        │
    └─────────────────────────────────────────────┘
    ↓ User nhấn "Chấp nhận"
Document content cập nhật + version snapshot tự động tạo
```

#### Quy tắc quan trọng

| Quy tắc | Mô tả |
|---------|-------|
| **AI không tự sửa** | Mọi thay đổi đều phải qua Accept của user |
| **1 message = 1 proposal** | Mỗi tin nhắn AI sinh 1 change proposal độc lập |
| **Proposal hết hạn** | Khi user gửi message mới, proposal cũ tự động `dismissed` |
| **Accept tạo version** | Accept proposal tự động tạo version snapshot (`change_type: 'ai_chat'`) |
| **Partial accept** | User có thể chỉnh sửa proposal trước khi accept (editable preview) |
| **Dismiss không mất chat** | Bỏ qua proposal vẫn giữ lịch sử hội thoại |

| Tính năng khác | Mô tả |
|----------------|-------|
| Context-aware | AI nhận full document hiện tại trong mỗi lượt chat |
| Structured context | AI cũng nhận analysis form để hiểu intent gốc |
| Sibling awareness | AI biết các requirement khác trong cùng group |
| Regenerate section | User có thể yêu cầu AI sinh lại 1 section cụ thể |

---

### Module 5: Version Control
**Mục đích:** Quản lý lịch sử thay đổi của tài liệu

| Tính năng | Mô tả |
|-----------|-------|
| Auto-version | Mỗi lần approve tạo version mới |
| Manual snapshot | User có thể tạo snapshot bất kỳ lúc nào |
| Diff view | So sánh 2 version |
| Rollback | Khôi phục về version cũ |
| Change log | Ghi lý do thay đổi khi tạo version |

---

### Module 6: Review & Approval Workflow
**Mục đích:** Quy trình review theo vai trò

```
BA tạo document
    ↓
BA submit for review → PM review → Approve/Reject
    ↓ (approve)
Document locked (version tạo)
    ↓
DEV có thể comment / request clarification
```

---

### Module 7: Project & User Management (đã có)
Extend thêm:
- Project settings (AI model preference, default language)
- Member project role: `ba`, `dev`, `pm` (đã có cột `project_role`)

---

### Module 8: Admin System
| Tính năng | Mô tả |
|-----------|-------|
| Quản lý global templates | CRUD template toàn hệ thống |
| AI Settings | Cấu hình API key, model, temperature |
| Quản lý users/roles/permissions | Đã có |
| Audit logs | Log toàn bộ hành động |
| System settings | Đã có |

---

## 3. Thiết Kế Database

### 3.0 Nguyên tắc phân tách data (Data Distribution Strategy)

```
PostgreSQL                          MongoDB
─────────────────────────           ──────────────────────────────────
Dữ liệu QUAN HỆ                    Dữ liệu KHỐI LƯỢNG LỚN / LOG
• FK, JOIN, constraint              • Không cần JOIN
• Status, count, filter             • Không ảnh hưởng relational integrity
• Metadata nhỏ (ID, timestamp,      • Nội dung văn bản dài (TEXT lớn)
  enum, số nguyên)                  • Toàn bộ lịch sử chat (mọi lượt)
• Query thường xuyên với WHERE      • Prompt + response thô từ AI
• Cần transaction / rollback        • Snapshot nội dung version
                                    • Diff giữa các phiên bản
                                    • Payload AI không cần aggregate
```

**Quy tắc cụ thể áp dụng trong hệ thống này:**

| Field | Vị trí hiện tại | Vị trí đúng | Lý do |
|-------|----------------|-------------|-------|
| `documents.content` | PostgreSQL | **PostgreSQL** | Nội dung hiện tại — cần render + query status |
| `documents.ai_prompt_used` | PostgreSQL TEXT | **MongoDB** | Prompt lớn, không cần JOIN, chỉ dùng audit |
| `document_versions.content` | PostgreSQL TEXT | **MongoDB** | Snapshot lớn, không cần WHERE/JOIN |
| `document_change_proposals.original_content` | PostgreSQL TEXT | **MongoDB** | Blob lớn, không cần filter |
| `document_change_proposals.proposed_content` | PostgreSQL TEXT | **MongoDB** | Blob lớn, không cần filter |
| `document_change_proposals.diff` | PostgreSQL TEXT | **MongoDB** | Blob lớn, chỉ đọc khi xem proposal |
| AI chat messages | — | **MongoDB** | Log toàn bộ, không cần JOIN |
| AI prompt/response thô | — | **MongoDB** | Log audit, không cần aggregate |
| Diff giữa versions | — | **MongoDB** | Tính khi cần, lưu cache |
| Audit logs hệ thống | — | **MongoDB** | Volume cao, append-only |

**Kết quả:** PostgreSQL chỉ chứa metadata nhỏ + FK; MongoDB chứa toàn bộ nội dung văn bản lớn và log.

---

### 3.1 Sơ đồ quan hệ (ERD summary)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PostgreSQL — QUAN HỆ & METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
projects
    ├── project_user (+ project_role)
    ├── requirement_groups          (id, project_id, parent_id, name, prefix, ...)
    │   └── requirements            (id, group_id, code, title, raw_content, status, ...)
    │       ├── requirement_analyses(id, requirement_id, type, actors, main_flow, ... [JSONB nhỏ])
    │       └── documents           (id, requirement_id, type, title, content*, status, ...)
    │           ├── document_versions (id, document_id, version_number, change_summary,
    │           │                     change_type, mongo_content_id*)   ← content → MongoDB
    │           ├── document_change_proposals (id, document_id, conversation_id,
    │           │                     message_index, change_summary, status,
    │           │                     mongo_content_id*)                ← blobs → MongoDB
    │           ├── document_reviews (id, document_id, version_id, reviewer_id, status, ...)
    │           └── document_checklists (id, document_id, status, total/verified items)
    │               └── checklist_items (id, checklist_id, code, category, title,
    │                   │               dev_status, dev_proof[JSONB], review_status)
    │                   └── checklist_item_comments (id, item_id, author_id, type, content)
    ├── document_templates
    └── ai_generation_logs          (id, document_id, model, tokens, duration, status,
                                    mongo_detail_id*)                   ← full log → MongoDB
users
settings                            (+ ai.* keys)

* mongo_*_id: VARCHAR(24) lưu MongoDB ObjectId để cross-reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MongoDB — CONTENT BLOBS & LOGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ai_conversations          ← Toàn bộ lịch sử chat (mọi lượt, mọi field, không rút gọn)
ai_generation_details     ← Prompt đầy đủ + response thô + context khi generate
ai_prefill_logs           ← Prompt + response khi AI pre-fill analysis form
document_version_contents ← Snapshot nội dung document theo từng version
change_proposal_contents  ← original_content + proposed_content + diff
document_diff_cache       ← Cache diff đã tính giữa 2 version bất kỳ
audit_logs                ← Log mọi hành động người dùng (đã có qua MongoLogService)
```

---

### 3.2 Chi tiết bảng mới (PostgreSQL)

#### Bảng `requirement_groups`
```sql
CREATE TABLE requirement_groups (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id   BIGINT REFERENCES requirement_groups(id) ON DELETE SET NULL,
                -- NULL = root group; có giá trị = sub-group (tối đa 2 cấp)
    name        VARCHAR(200) NOT NULL,  -- "Quản lý User", "Quản lý Sản phẩm"
    description TEXT,
    prefix      VARCHAR(10),            -- "UM", "PM", "ORD" — dùng để auto-code requirement
    color       VARCHAR(20),            -- "#3B82F6" — màu hiển thị trên UI
    icon        VARCHAR(50),            -- "users", "shopping-cart" — icon name
    sort_order  INT DEFAULT 0,
    created_by  BIGINT REFERENCES users(id),
    updated_by  BIGINT REFERENCES users(id),
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- Chặn lồng quá 2 cấp bằng constraint ở tầng application (Service layer)
-- CHECK: parent phải là root group (parent_id IS NULL)
```

#### Bảng `requirements`
```sql
CREATE TABLE requirements (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id    BIGINT REFERENCES requirement_groups(id) ON DELETE SET NULL,
                -- NULL = requirement chưa được phân nhóm (Uncategorized)
    code        VARCHAR(50),                 -- Auto-gen: "UM-001", "UM-002" (từ group.prefix)
    title       VARCHAR(500) NOT NULL,
    raw_content TEXT NOT NULL,               -- Nội dung thô BA nhập vào
    tags        JSONB DEFAULT '[]',          -- ["functional", "payment"]
    status      VARCHAR(30) DEFAULT 'draft', -- draft|in_analysis|completed|archived
    priority    VARCHAR(20) DEFAULT 'medium',-- low|medium|high|critical
    sort_order  INT DEFAULT 0,               -- Thứ tự trong group
    created_by  BIGINT REFERENCES users(id),
    updated_by  BIGINT REFERENCES users(id),
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

#### Bảng `requirement_analyses`
```sql
CREATE TABLE requirement_analyses (
    id              BIGSERIAL PRIMARY KEY,
    requirement_id  BIGINT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    document_type   VARCHAR(50) NOT NULL, -- loại tài liệu form này dành cho
    -- Schema chung
    actors          JSONB DEFAULT '[]',           -- ["Admin", "User đã đăng nhập"]
    preconditions   TEXT,
    main_flow       JSONB DEFAULT '[]',           -- [{step:1, desc:"..."}]
    alternative_flows JSONB DEFAULT '[]',
    exception_flows JSONB DEFAULT '[]',
    business_rules  JSONB DEFAULT '[]',
    data_fields     JSONB DEFAULT '[]',           -- [{name, type, required, validation}]
    non_functional  TEXT,
    notes           TEXT,
    -- Schema mở rộng (lưu linh hoạt)
    extended_data   JSONB DEFAULT '{}',           -- Các field riêng theo document_type
    -- Trạng thái pre-fill
    prefilled_by_ai BOOLEAN DEFAULT FALSE,        -- AI đã pre-fill chưa
    prefilled_at    TIMESTAMP,
    -- Audit
    created_by      BIGINT REFERENCES users(id),
    updated_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    UNIQUE (requirement_id, document_type)        -- 1 requirement có 1 analysis per type
);
```

#### Bảng `document_change_proposals`
```sql
CREATE TABLE document_change_proposals (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    conversation_id     VARCHAR(24),             -- MongoDB ai_conversations._id (ObjectId)
    message_index       INT,                     -- Vị trí message trong conversation
    -- Nội dung lớn ở MongoDB, chỉ giữ reference và summary ở đây
    mongo_content_id    VARCHAR(24),             -- MongoDB change_proposal_contents._id
    change_summary      VARCHAR(500),            -- "Thêm 3 validation rules cho email"
    status              VARCHAR(20) DEFAULT 'pending',
                        -- pending|accepted|dismissed|superseded
    accepted_by         BIGINT REFERENCES users(id),
    accepted_at         TIMESTAMP,
    dismissed_at        TIMESTAMP,
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP
);
-- original_content, proposed_content, diff → MongoDB change_proposal_contents
```

#### Bảng `document_templates`
```sql
CREATE TABLE document_templates (
    id            BIGSERIAL PRIMARY KEY,
    type          VARCHAR(50) NOT NULL, -- flow_diagram|brd|sql_logic|business_rules|validation_rules|test_cases
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    content       TEXT NOT NULL,        -- Template body với placeholders
    placeholders  JSONB DEFAULT '[]',   -- Danh sách placeholders
    is_default    BOOLEAN DEFAULT FALSE,
    is_global     BOOLEAN DEFAULT TRUE, -- TRUE = admin template, FALSE = project template
    project_id    BIGINT REFERENCES projects(id) ON DELETE CASCADE, -- NULL nếu global
    version       INT DEFAULT 1,
    created_by    BIGINT REFERENCES users(id),
    updated_by    BIGINT REFERENCES users(id),
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);
```

#### Bảng `documents`
```sql
CREATE TABLE documents (
    id                  BIGSERIAL PRIMARY KEY,
    requirement_id      BIGINT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    template_id         BIGINT REFERENCES document_templates(id),
    type                VARCHAR(50) NOT NULL,
    title               VARCHAR(500) NOT NULL,
    content             TEXT,                   -- Nội dung HIỆN TẠI (latest) — giữ ở PG vì
                                                -- cần render trực tiếp, không qua lookup
    -- ai_prompt_used đã chuyển sang MongoDB ai_generation_details
    generation_log_id   BIGINT REFERENCES ai_generation_logs(id), -- trỏ đến log generate
    status              VARCHAR(30) DEFAULT 'draft',
    current_version     INT DEFAULT 1,
    approved_by         BIGINT REFERENCES users(id),
    approved_at         TIMESTAMP,
    created_by          BIGINT REFERENCES users(id),
    updated_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);
-- ai_prompt_used (TEXT lớn) → MongoDB ai_generation_details
```

#### Bảng `document_versions`
```sql
CREATE TABLE document_versions (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number      INT NOT NULL,
    -- content (TEXT lớn) đã chuyển sang MongoDB
    mongo_content_id    VARCHAR(24) NOT NULL,    -- MongoDB document_version_contents._id
    change_summary      VARCHAR(500),
    change_type         VARCHAR(30),             -- 'manual'|'ai_chat'|'ai_regenerated'|'approved'
    proposal_id         BIGINT REFERENCES document_change_proposals(id), -- nếu tạo từ accept
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP,
    UNIQUE (document_id, version_number)
);
-- content snapshot → MongoDB document_version_contents
```

#### Bảng `document_reviews`
```sql
CREATE TABLE document_reviews (
    id          BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_id  BIGINT REFERENCES document_versions(id),
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL, -- 'pending'|'approved'|'rejected'|'needs_revision'
    comment     TEXT,
    reviewed_at TIMESTAMP,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

#### Bảng `document_checklists`
```sql
CREATE TABLE document_checklists (
    id              BIGSERIAL PRIMARY KEY,
    document_id     BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    generated_by    VARCHAR(20) DEFAULT 'ai', -- 'ai' | 'manual'
    status          VARCHAR(20) DEFAULT 'active',
                    -- draft|active|completed
    total_items     INT DEFAULT 0,            -- Cache đếm tổng items
    verified_items  INT DEFAULT 0,            -- Cache đếm items đã verified
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    UNIQUE (document_id)                      -- 1 document có 1 checklist
);
```

#### Bảng `checklist_items`
```sql
CREATE TABLE checklist_items (
    id              BIGSERIAL PRIMARY KEY,
    checklist_id    BIGINT NOT NULL REFERENCES document_checklists(id) ON DELETE CASCADE,
    document_id     BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    code            VARCHAR(30) NOT NULL,      -- CL-API-01, CL-VAL-02...
    category        VARCHAR(20) NOT NULL,      -- api|validation|business_rule|db|test|ui
    title           VARCHAR(500) NOT NULL,     -- Tiêu đề ngắn của item
    description     TEXT,                     -- Mô tả chi tiết cần làm (không quá lớn)
    doc_section_ref VARCHAR(200),             -- Tham chiếu section tài liệu gốc (VD: "BRD §4.1")

    -- DEV tracking
    dev_status      VARCHAR(20) DEFAULT 'not_started',
                    -- not_started|in_progress|dev_done
    assigned_to     BIGINT REFERENCES users(id),
    dev_proof       JSONB DEFAULT '{}',
                    -- { commit_hash, pr_url, file_refs:[], note }
    dev_submitted_at TIMESTAMP,

    -- BA/PM review
    review_status   VARCHAR(20) DEFAULT 'pending',
                    -- pending|verified|rejected
    reviewed_by     BIGINT REFERENCES users(id),
    reviewed_at     TIMESTAMP,

    sort_order      INT DEFAULT 0,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

#### Bảng `checklist_item_comments`
```sql
CREATE TABLE checklist_item_comments (
    id              BIGSERIAL PRIMARY KEY,
    item_id         BIGINT NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
    author_id       BIGINT NOT NULL REFERENCES users(id),
    author_role     VARCHAR(20) NOT NULL,      -- ba|dev|pm|admin (role tại thời điểm comment)
    comment_type    VARCHAR(30) NOT NULL,
                    -- clarification|correction_ba|correction_dev|approval|rejection|general
    content         TEXT NOT NULL,             -- Nội dung comment (ngắn, giữ ở PG)
    is_resolved     BOOLEAN DEFAULT FALSE,     -- BA/DEV có thể đánh dấu đã giải quyết
    resolved_by     BIGINT REFERENCES users(id),
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

#### Bảng `ai_generation_logs` (PostgreSQL — metadata only)
```sql
CREATE TABLE ai_generation_logs (
    id              BIGSERIAL PRIMARY KEY,
    document_id     BIGINT REFERENCES documents(id),
    requirement_id  BIGINT REFERENCES requirements(id),
    analysis_id     BIGINT REFERENCES requirement_analyses(id),
    log_type        VARCHAR(30) NOT NULL, -- 'generate'|'regenerate'|'prefill'|'bulk'
    model_used      VARCHAR(100),
    tokens_input    INT,
    tokens_output   INT,
    duration_ms     INT,
    status          VARCHAR(20),          -- 'success'|'failed'
    error_message   VARCHAR(500),         -- Chỉ lưu message ngắn, chi tiết ở MongoDB
    mongo_detail_id VARCHAR(24),          -- MongoDB ai_generation_details._id
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP
);
-- Prompt đầy đủ + response thô → MongoDB ai_generation_details
```

### 3.3 MongoDB Collections

> **Nguyên tắc:** Mọi tương tác với AI đều được log đầy đủ — không rút gọn, không bỏ sót. PostgreSQL chỉ giữ metadata nhỏ và FK; toàn bộ nội dung lớn nằm tại đây.

---

#### Collection `ai_conversations`
*Toàn bộ lịch sử chat — mỗi lượt log đầy đủ, không rút gọn*

```json
{
  "_id": "ObjectId",
  "document_id": 123,
  "requirement_id": 45,
  "project_id": 10,
  "created_by": 5,

  "messages": [
    {
      "index": 0,
      "role": "user",
      "content": "Hãy thêm validation cho trường email và phone",
      "timestamp": "2026-04-16T10:00:00Z",
      "user_id": 5
    },
    {
      "index": 1,
      "role": "assistant",
      "content": "Tôi đề xuất bổ sung 3 validation rules sau...", // Full reply text
      "timestamp": "2026-04-16T10:00:02Z",

      // Context đã gửi cho AI trong lượt này (để audit/replay)
      "ai_request": {
        "system_prompt": "Bạn là Senior BA...",            // System prompt đầy đủ
        "document_context": "# BRD: Thêm user\n...",      // Document content lúc gửi
        "analysis_context": { "actors": [...], ... },     // Analysis form lúc gửi
        "messages_sent": [                                 // Toàn bộ history gửi lên AI
          { "role": "user", "content": "..." },
          { "role": "assistant", "content": "..." }
        ]
      },

      // Thông tin kỹ thuật của lượt gọi AI
      "ai_meta": {
        "model": "claude-sonnet-4-6",
        "tokens_input": 1850,
        "tokens_output": 420,
        "duration_ms": 2340,
        "stop_reason": "end_turn"
      },

      // Proposal được tạo từ message này (nếu có)
      "proposal": {
        "proposal_id": 55,             // FK → document_change_proposals.id (PG)
        "change_summary": "Thêm 3 validation rules cho email và phone",
        "status": "accepted"           // Sync từ PG khi status thay đổi
      }
    }
  ],

  "created_at": "2026-04-16T10:00:00Z",
  "updated_at": "2026-04-16T10:00:02Z"
}
```

---

#### Collection `ai_generation_details`
*Log đầy đủ mỗi lần AI generate/regenerate tài liệu*

```json
{
  "_id": "ObjectId",
  "generation_log_id": 10,            // FK → ai_generation_logs.id (PG)
  "document_id": 123,
  "requirement_id": 45,
  "log_type": "generate",             // generate|regenerate|regenerate_section|bulk

  // Toàn bộ input gửi cho AI
  "system_prompt": "Bạn là Senior BA và System Architect...",
  "user_prompt": "Dựa trên thông tin phân tích sau, hãy tạo BRD...",
  "analysis_snapshot": {              // Snapshot analysis form tại thời điểm generate
    "actors": ["Admin", "User"],
    "main_flow": [...],
    "data_fields": [...],
    "extended_data": { "scope": "..." }
  },
  "group_context": {
    "group_name": "Quản lý User",
    "group_path": "Quản lý User",
    "sibling_requirements": ["Xem danh sách", "Sửa user", "Xóa user"]
  },
  "template_used": "# BRD Template\n## 1. Phạm vi\n{{scope}}\n...",

  // Toàn bộ output từ AI
  "ai_response_raw": "# BRD: Thêm User Mới\n\n## 1. Phạm vi\n...", // Raw text đầy đủ

  // Thông tin kỹ thuật
  "model": "claude-sonnet-4-6",
  "tokens_input": 2150,
  "tokens_output": 1840,
  "duration_ms": 6200,
  "stop_reason": "end_turn",

  "created_at": "2026-04-16T09:00:00Z"
}
```

---

#### Collection `ai_prefill_logs`
*Log đầy đủ mỗi lần AI pre-fill analysis form*

```json
{
  "_id": "ObjectId",
  "generation_log_id": 8,             // FK → ai_generation_logs.id (PG)
  "requirement_id": 45,
  "document_type": "brd",

  "system_prompt": "Bạn là Senior BA...",
  "user_prompt": "Từ requirement sau, hãy điền form phân tích...",
  "raw_requirement": "Xây dựng chức năng thêm user mới vào hệ thống...",

  "ai_response_raw": "{ \"actors\": [...], \"main_flow\": [...] }",  // JSON thô AI trả về
  "parsed_result": {                  // Sau khi parse JSON
    "actors": ["Admin"],
    "main_flow": [...],
    "data_fields": [...]
  },

  "model": "claude-sonnet-4-6",
  "tokens_input": 650,
  "tokens_output": 380,
  "duration_ms": 1800,

  "created_at": "2026-04-16T08:55:00Z"
}
```

---

#### Collection `document_version_contents`
*Snapshot nội dung document theo từng version*

```json
{
  "_id": "ObjectId",
  "version_id": 15,                   // FK → document_versions.id (PG)
  "document_id": 123,
  "version_number": 3,
  "content": "# BRD: Thêm User Mới\n\n## 1. Phạm vi\n...", // Full document text
  "created_at": "2026-04-16T11:00:00Z"
}
```

---

#### Collection `change_proposal_contents`
*Nội dung đầy đủ của mỗi change proposal (original + proposed + diff)*

```json
{
  "_id": "ObjectId",
  "proposal_id": 55,                  // FK → document_change_proposals.id (PG)
  "document_id": 123,

  "original_content": "...toàn bộ nội dung document trước khi đề xuất...",
  "proposed_content": "...toàn bộ nội dung document AI đề xuất sau thay đổi...",
  "diff": "@@ -45,4 +45,7 @@\n-email phải đúng định dạng\n+email: required...",

  // Full AI explanation (phần giải thích trước khi đưa ra proposal)
  "ai_explanation": "Tôi đề xuất bổ sung 3 validation rules...",

  "created_at": "2026-04-16T10:00:02Z"
}
```

---

#### Collection `document_diff_cache`
*Cache diff đã tính giữa 2 version bất kỳ — tránh tính lại nhiều lần*

```json
{
  "_id": "ObjectId",
  "document_id": 123,
  "from_version": 1,
  "to_version": 3,
  "diff": "...(unified diff format)...",
  "computed_at": "2026-04-16T10:05:00Z"
}
```

---

#### Collection `audit_logs`
*Log mọi hành động người dùng — đã có qua MongoLogService, cần mở rộng*

```json
{
  "_id": "ObjectId",
  "user_id": 5,
  "project_id": 10,
  "action": "proposal.accepted",      // group.created|req.created|doc.generated|
                                      // proposal.accepted|proposal.dismissed|
                                      // version.restored|doc.approved|...
  "entity_type": "document_change_proposal",
  "entity_id": 55,
  "payload": {                        // Context đủ để audit
    "document_id": 123,
    "change_summary": "Thêm 3 validation rules cho email",
    "version_created": 4
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-04-16T10:00:05Z"
}
```

### 3.4 Settings keys mới (bảng `settings` hiện có)

| Key | Mô tả | Ví dụ |
|-----|-------|-------|
| `ai.provider` | AI provider | `anthropic` |
| `ai.model` | Model mặc định | `claude-sonnet-4-6` |
| `ai.api_key` | API key (encrypted) | `sk-...` |
| `ai.max_tokens` | Token limit | `4096` |
| `ai.temperature` | Temperature | `0.3` |
| `ai.language` | Ngôn ngữ output mặc định | `vi` |
| `document.auto_version` | Tự động tạo version khi approve | `true` |
| `document.require_approval` | Bắt buộc PM approve | `true` |

---

## 4. Cấu Trúc API

### 4.1 API Routes Overview

```
/api/v1/user/
├── groups/                              # Feature Groups (Folders)
│   ├── GET    /                        # Cây group của project (tree format)
│   ├── POST   /                        # Tạo group / sub-group mới
│   ├── GET    /{id}                    # Chi tiết group + danh sách requirements
│   ├── PUT    /{id}                    # Đổi tên, màu, icon, prefix
│   ├── DELETE /{id}                    # Xóa group (requirements → Uncategorized)
│   ├── PUT    /{id}/move               # Chuyển group sang parent khác
│   ├── PUT    /{id}/reorder            # Sắp xếp lại thứ tự các items trong group
│   ├── POST   /{id}/bulk-generate      # Sinh tài liệu cho toàn bộ requirements trong group
│   └── GET    /{id}/progress           # Thống kê % tài liệu đã hoàn thành trong group
│
├── requirements/
│   ├── GET    /                        # Danh sách requirements (filter: group_id, status)
│   ├── POST   /                        # Tạo requirement mới (kèm group_id)
│   ├── GET    /{id}                    # Chi tiết requirement
│   ├── PUT    /{id}                    # Cập nhật requirement
│   ├── DELETE /{id}                    # Xóa requirement
│   ├── PUT    /{id}/move-group         # Chuyển requirement sang group khác
│   └── GET    /{id}/documents          # Tất cả documents của requirement
│
├── analyses/                           # Structured Analysis Forms
│   ├── GET    /                        # Lấy analysis (filter: requirement_id, type)
│   ├── POST   /prefill                 # AI pre-fill form từ raw requirement
│   ├── GET    /{id}                    # Chi tiết analysis form
│   ├── PUT    /{id}                    # User chỉnh sửa analysis form
│   └── DELETE /{id}                    # Xóa analysis (reset về raw)
│
├── documents/
│   ├── GET    /                        # Danh sách documents (filter by type/status)
│   ├── POST   /generate                # AI generate document từ requirement
│   ├── GET    /{id}                    # Chi tiết document (latest version)
│   ├── PUT    /{id}                    # Cập nhật nội dung document
│   ├── DELETE /{id}                    # Xóa document
│   ├── POST   /{id}/regenerate         # AI sinh lại toàn bộ document
│   ├── POST   /{id}/regenerate-section # AI sinh lại một phần
│   ├── POST   /{id}/submit-review      # Submit để review
│   ├── POST   /{id}/approve            # PM approve
│   ├── POST   /{id}/reject             # PM reject
│   │
│   ├── /{id}/versions/
│   │   ├── GET  /                      # Danh sách versions
│   │   ├── POST /                      # Tạo manual snapshot
│   │   ├── GET  /{version_number}      # Lấy nội dung version cụ thể
│   │   ├── POST /{version_number}/restore  # Khôi phục về version cũ
│   │   └── GET  /diff?from=1&to=2      # So sánh 2 versions
│   │
│   └── /{id}/ai-chat/
│       ├── GET  /                      # Lịch sử chat
│       ├── POST /                      # Gửi message → AI trả về proposal
│       └── DELETE /                    # Xóa lịch sử chat
│
├── proposals/                          # Change Proposals (từ AI chat)
│   ├── GET    /                        # Danh sách proposals (filter: document_id, status)
│   ├── GET    /{id}                    # Chi tiết proposal (diff + full content)
│   ├── POST   /{id}/accept             # User accept → document updated + version created
│   ├── PUT    /{id}/accept-with-edit   # User sửa proposal rồi accept
│   └── POST   /{id}/dismiss            # User bỏ qua proposal
│
├── checklists/                         # Document Checklists
│   ├── GET    /                        # Lấy checklist của document (?document_id=X)
│   ├── POST   /generate                # AI auto-generate checklist từ document đã approve
│   ├── GET    /{id}                    # Chi tiết checklist + tất cả items
│   │
│   ├── /{id}/items/
│   │   ├── GET    /                    # Danh sách items (filter: category, dev_status, review_status)
│   │   ├── POST   /                    # Thêm item thủ công
│   │   ├── GET    /{itemId}            # Chi tiết item + comments
│   │   ├── PUT    /{itemId}            # Cập nhật item (BA/Admin)
│   │   ├── DELETE /{itemId}            # Xóa item
│   │   │
│   │   ├── POST   /{itemId}/start      # DEV: Bắt đầu làm item (not_started → in_progress)
│   │   ├── POST   /{itemId}/submit     # DEV: Submit done + proof (in_progress → dev_done)
│   │   ├── POST   /{itemId}/verify     # BA/PM: Xác nhận đúng (dev_done → verified)
│   │   ├── POST   /{itemId}/reject     # BA/PM: Từ chối + comment (dev_done → rejected)
│   │   │
│   │   └── /{itemId}/comments/
│   │       ├── GET    /                # Lịch sử comments của item
│   │       ├── POST   /                # Thêm comment (BA/DEV/PM)
│   │       └── PUT    /{commentId}/resolve  # Đánh dấu comment đã giải quyết
│
├── templates/
│   ├── GET    /                        # Danh sách templates (global + project)
│   ├── POST   /                        # Tạo project-level template
│   ├── GET    /{id}                    # Chi tiết template
│   ├── PUT    /{id}                    # Cập nhật template
│   └── DELETE /{id}                    # Xóa project template
│
└── projects/
    └── (đã có)

/api/v1/admin/
├── templates/
│   ├── GET    /                        # Danh sách global templates
│   ├── POST   /                        # Tạo global template
│   ├── GET    /{id}                    # Chi tiết template
│   ├── PUT    /{id}                    # Cập nhật global template
│   ├── DELETE /{id}                    # Xóa global template
│   └── POST   /{id}/set-default        # Đặt làm template mặc định
│
├── ai-settings/
│   ├── GET    /                        # Lấy AI config
│   ├── PUT    /                        # Cập nhật AI config
│   └── POST   /test-connection         # Test kết nối AI API
│
└── (users, roles, settings, logs — đã có)
```

### 4.2 Request/Response Format

**Bước 1 — AI Pre-fill Analysis Form:**
```http
POST /api/v1/user/analyses/prefill
Authorization: Bearer {token}

{
  "requirement_id": 5,
  "document_type": "brd"
}

→ 200 OK
{
  "success": true,
  "message": "AI đã phân tích và điền form. Vui lòng review trước khi tạo tài liệu.",
  "data": {
    "analysis_id": 12,
    "prefilled_by_ai": true,
    "actors": ["Admin", "User đã đăng nhập"],
    "preconditions": "User đã tồn tại trong hệ thống",
    "main_flow": [
      {"step": 1, "desc": "Admin truy cập trang danh sách user"},
      {"step": 2, "desc": "Hệ thống hiển thị danh sách với filter và phân trang"}
    ],
    "data_fields": [
      {"name": "email", "type": "string", "required": true},
      {"name": "role",  "type": "enum",   "required": true}
    ],
    "extended_data": { "scope": "Chức năng thêm user mới...", "success_criteria": "..." }
  }
}
```

**Bước 2 — Generate document từ analysis:**
```http
POST /api/v1/user/documents/generate
Authorization: Bearer {token}

{
  "requirement_id": 5,
  "analysis_id": 12,           // bắt buộc — phải có analysis trước khi generate
  "type": "brd",
  "template_id": 2,            // optional
  "language": "vi"
}

→ 202 Accepted
{
  "success": true,
  "message": "Đang sinh tài liệu, vui lòng chờ...",
  "data": { "document_id": 10, "status": "generating" }
}
```

**Bulk generate cho cả group:**
```http
POST /api/v1/user/groups/{id}/bulk-generate
Authorization: Bearer {token}

{
  "types": ["brd", "flow_diagram"],   // Loại tài liệu muốn sinh
  "requirement_ids": [1, 2, 3, 4],    // optional, mặc định = toàn bộ trong group
  "language": "vi",
  "skip_existing": true               // Bỏ qua requirement đã có tài liệu loại này
}

→ 202 Accepted
{
  "success": true,
  "message": "Đang xếp hàng sinh 8 tài liệu...",
  "data": {
    "job_ids": ["job-abc", "job-def", "..."],
    "total": 8
  }
}
```

**Lấy cây groups:**
```http
GET /api/v1/user/groups?project_id=10

→ 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "Quản lý User", "prefix": "UM",
      "color": "#3B82F6", "icon": "users",
      "progress": { "total": 4, "completed": 2, "percent": 50 },
      "children": [
        { "id": 3, "name": "Phân quyền User", "prefix": "UM-P", "children": [] }
      ]
    },
    {
      "id": 2, "name": "Quản lý Sản phẩm", "prefix": "PM",
      "progress": { "total": 6, "completed": 6, "percent": 100 },
      "children": []
    }
  ]
}
```

**Bước 3A — AI Chat (luôn trả về proposal, không tự sửa):**
```http
POST /api/v1/user/documents/{id}/ai-chat
Authorization: Bearer {token}

{
  "message": "Thêm validation cho trường email và phone"
}

→ 200 OK
{
  "success": true,
  "data": {
    "conversation_id": "abc123",
    "message_index": 3,
    "reply": "Tôi đề xuất bổ sung các validation sau đây...",
    "proposal": {
      "id": 55,
      "change_summary": "Thêm 3 validation rules cho email và phone",
      "diff": "@@ -12,3 +12,6 @@\n-email phải đúng định dạng\n+email: required, format RFC5322, max 255 chars\n+email: unique trong bảng users\n+phone: optional, regex [0-9]{10,11}",
      "status": "pending"
    }
  }
}
// Document KHÔNG thay đổi cho đến khi user accept
```

**Bước 3B — User Accept proposal:**
```http
POST /api/v1/user/proposals/{id}/accept
Authorization: Bearer {token}

→ 200 OK
{
  "success": true,
  "message": "Đã áp dụng thay đổi và tạo phiên bản mới.",
  "data": {
    "document_id": 10,
    "new_version": 4,
    "change_summary": "Thêm 3 validation rules cho email và phone"
  }
}
```

**Bước 3B' — Accept kèm chỉnh sửa (user sửa proposal trước khi accept):**
```http
PUT /api/v1/user/proposals/{id}/accept-with-edit
Authorization: Bearer {token}

{
  "edited_content": "...nội dung đã được user chỉnh sửa từ proposal..."
}

→ 200 OK  (tương tự accept thường)
```

**Version diff:**
```http
GET /api/v1/user/documents/{id}/versions/diff?from=1&to=3

→ 200 OK
{
  "success": true,
  "data": {
    "from_version": 1,
    "to_version": 3,
    "diff": "...",
    "changes_summary": "Thêm 5 validation rules, sửa 2 business rules"
  }
}
```

---

## 5. Thiết Kế Service Layer (Backend)

### Services cần thêm

```
app/Services/
├── RequirementGroupService.php         # CRUD group + max 2 cấp + auto-code prefix
├── RequirementService.php              # CRUD + move-group
├── RequirementAnalysisService.php      # CRUD analysis form + validate schema per type
├── DocumentService.php                 # CRUD + workflow state machine
├── DocumentVersionService.php
│       # - createVersion(documentId, content, changeType, proposalId?)
│       #   → INSERT document_versions (PG) + INSERT document_version_contents (MongoDB)
│       # - getContent(versionId) → fetch từ MongoDB qua mongo_content_id
│       # - restoreVersion(versionId) → fetch content từ MongoDB → update documents.content (PG)
│       # - getDiff(fromVersion, toVersion) → check diff_cache (MongoDB) hoặc tính mới
├── DocumentChecklistService.php
│       # - generate(documentId): AI auto-generate items từ approved document
│       #   → gọi ChecklistGenerationPromptBuilder → parse → INSERT items theo category
│       # - startItem(itemId, userId)   → dev_status: in_progress
│       # - submitItem(itemId, proof)   → dev_status: dev_done, lưu proof JSONB
│       # - verifyItem(itemId, reviewerId) → review_status: verified
│       #   → cập nhật checklist.verified_items counter
│       # - rejectItem(itemId, reviewerId, comment) → review_status: rejected
│       #   → tự động tạo comment type 'rejection'
│       # - addComment(itemId, content, type)
│       # - resolveComment(commentId)
│       # - Khi tất cả items verified → checklist.status = 'completed'
│
├── DocumentChangeProposalService.php
│       # - createProposal(documentId, proposedContent, conversationId, messageIndex)
│       #   → INSERT document_change_proposals (PG, metadata only)
│       #   → INSERT change_proposal_contents (MongoDB, content blobs)
│       # - accept(proposalId) → fetch proposed_content từ MongoDB
│       #   → update documents.content (PG) → createVersion → update proposal status (PG)
│       #   → sync proposal.status vào ai_conversations message (MongoDB)
│       # - acceptWithEdit(proposalId, editedContent) → tương tự accept với edited content
│       # - dismiss(proposalId) → update status PG + sync MongoDB
│       # - supersedePending(documentId) → đánh superseded toàn bộ pending proposals cũ
├── TemplateService.php                 # Template CRUD + resolve placeholders
├── AiOrchestrationService.php          # Điều phối AI: build prompt → call → parse → log
├── AiBulkGenerateService.php           # Bulk generate (dispatch queue jobs)
└── AiChatService.php
        # - sendMessage(documentId, userMessage, userId)
        #   → fetch document content + analysis + sibling context
        #   → build prompt (ChatRefinementPromptBuilder)
        #   → call AI
        #   → INSERT message vào ai_conversations (MongoDB) — đầy đủ ai_request + ai_meta
        #   → createProposal()
        #   → supersedePending()
        # - getHistory(documentId) → fetch từ MongoDB
        # - clearHistory(documentId) → delete từ MongoDB

app/Services/Ai/
├── ClaudeProvider.php                  # Anthropic Claude — gọi API, trả về full response
├── AiProviderInterface.php
├── DiffCalculator.php                  # Tính unified diff giữa 2 strings
├── LogWriter.php
│       # Mọi lệnh gọi AI đều đi qua đây sau khi hoàn thành:
│       # - Ghi ai_generation_details / ai_prefill_logs vào MongoDB
│       # - Ghi ai_generation_logs metadata vào PostgreSQL
│       # - Mọi exception cũng được log (status = 'failed' + error_message)
└── PromptBuilder/
    ├── AnalysisPrefillPromptBuilder.php    # Pre-fill analysis form từ raw requirement
    ├── BrdPromptBuilder.php
    ├── FlowDiagramPromptBuilder.php
    ├── SqlLogicPromptBuilder.php
    ├── BusinessRulesPromptBuilder.php
    ├── ValidationRulesPromptBuilder.php
    ├── TestCasesPromptBuilder.php
    ├── ChatRefinementPromptBuilder.php     # Output: explanation + proposed_content + summary
    └── ChecklistGenerationPromptBuilder.php
            # Input: approved document content (tất cả 6 loại đã có)
            # Output: JSON array checklist items phân loại theo category
            # Mỗi item: { code, category, title, description, doc_section_ref }
    -- Mỗi builder nhận: analysis snapshot + group context + sibling context + template
```

**Luồng ghi log mỗi lần gọi AI (bắt buộc):**
```
AiOrchestrationService / AiChatService
    ↓ gọi AI
ClaudeProvider::call(prompt) → { content, tokens_input, tokens_output, duration_ms }
    ↓ dù thành công hay thất bại
LogWriter::write()
    ├── INSERT ai_generation_details / ai_prefill_logs (MongoDB) ← full prompt + response
    └── INSERT ai_generation_logs (PostgreSQL)                   ← metadata + mongo_detail_id
```

**AI context khi generate — enriched với group info:**
```php
// AiOrchestrationService.php
$context = [
    'project_name'   => $requirement->project->name,
    'group_name'     => $requirement->group?->name,       // "Quản lý User"
    'group_path'     => $this->buildGroupPath($requirement), // "Quản lý User > Phân quyền"
    'req_code'       => $requirement->code,               // "UM-001"
    'req_title'      => $requirement->title,              // "Xem danh sách user"
    'req_content'    => $requirement->raw_content,
    'sibling_reqs'   => $this->getSiblingTitles($requirement), // ["Thêm user", "Sửa user", "Xóa user"]
];
// Sibling context giúp AI hiểu toàn bộ CRUD scope của cụm chức năng
```

---

## 6. Thiết Kế Frontend

### 6.1 Cấu trúc màn hình (User App)

```
/projects                                   # Danh sách project
/projects/{id}/
├── overview                                # Dashboard project
│
├── groups/                                 # Cây feature groups (sidebar trái)
│   ├── new
│   └── {groupId}/
│       ├── overview                        # Group detail + danh sách requirements
│       └── requirements/new
│
├── requirements/
│   ├── new                                 # Tạo requirement (chọn group)
│   └── {reqId}/
│       ├── detail                          # Chi tiết requirement
│       ├── analysis/{type}                 # Structured Analysis Form cho loại tài liệu
│       │   └── [AI Pre-fill] → [User review form] → [Generate]
│       └── documents/
│           └── {docId}/
│               ├── view                    # Xem document (readonly)
│               ├── edit                    # Chỉnh sửa thủ công
│               ├── versions                # Lịch sử version + diff
│               └── workspace               # ← màn hình chính (AI chat + document)
│
└── documents/
    └── (filter: group / type / status)
```

**Màn hình `workspace` — layout 3 cột:**

```
┌──────────────┬─────────────────────────────┬──────────────────────┐
│   Sidebar    │      DOCUMENT CONTENT        │    AI CHAT PANEL     │
│  (Groups     │                              │                      │
│   tree)      │  [Breadcrumb]                │  [Chat history]      │
│              │  Project > Group > REQ-002   │                      │
│              │                              │  User: Thêm valid... │
│              │  ─────────────────────────   │  AI: Tôi đề xuất...  │
│              │  # BRD: Thêm user mới        │                      │
│              │                              │  ┌──────────────────┐│
│              │  ## 1. Phạm vi               │  │ PREVIEW THAY ĐỔI ││
│              │  ...                         │  │ - email: format  ││
│              │                              │  │ + email: format, ││
│              │  ## 2. Actors                │  │   max 255, unique││
│              │  ...                         │  │                  ││
│              │                              │  │ [✓ Chấp nhận]    ││
│              │  [Chỉnh sửa] [Versions]      │  │ [✗ Bỏ qua]       ││
│              │  [Submit Review]             │  └──────────────────┘│
│              │                              │                      │
│              │                              │  [Nhập tin nhắn...] │
└──────────────┴─────────────────────────────┴──────────────────────┘
```

**Màn hình `analysis/{type}` — Structured Analysis Form:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Phân tích: REQ-002 — Thêm user mới  (BRD)                  │
│  ─────────────────────────────────────────────────────────────  │
│  [⚡ AI Pre-fill từ requirement]  ← nút fill tự động           │
│                                                                 │
│  Actors *              [Admin            ] [+ Thêm]            │
│  Điều kiện tiên quyết  [__________________________________]     │
│  Luồng chính  *                                                 │
│    Bước 1  [Admin truy cập trang danh sách user          ]     │
│    Bước 2  [Nhấn "Thêm mới"                              ]     │
│    [+ Thêm bước]                                               │
│  Luồng thay thế        [__________________________________]     │
│  Luồng ngoại lệ        [__________________________________]     │
│  Trường dữ liệu *                                               │
│    Tên         Kiểu     Bắt buộc  Validation                   │
│    email       string   ✓         [format, unique            ] │
│    role        enum     ✓         [ba|dev|pm                 ] │
│    [+ Thêm trường]                                             │
│  Business Rules        [__________________________________]     │
│                                                                 │
│  [Lưu phân tích]  [Lưu & Tạo tài liệu →]                      │
└─────────────────────────────────────────────────────────────────┘
```

**Sidebar trái — cấu trúc cây:**
```
📁 Quản lý User              [50%] ⚙ + 🗂
├── 📄 UM-001 Xem danh sách  ✅
├── 📄 UM-002 Thêm user      🟡
├── 📄 UM-003 Sửa user       ⬜
└── 📄 UM-004 Xóa user       ⬜

📁 Quản lý Sản phẩm          [100%] ⚙ + 🗂
├── 📁 Sản phẩm cơ bản
│   ├── 📄 PM-001 Xem        ✅
│   └── 📄 PM-002 Thêm       ✅
└── 📁 Biến thể
    └── 📄 PM-003 Size/màu   ✅

📂 Chưa phân nhóm            (3 requirements)
```

### 6.2 Cấu trúc màn hình (Admin App)

```
/dashboard
/users
/roles
/projects
/templates/                     # Quản lý global templates
│   ├── {type}                  # Filter theo type
│   └── new / {id}/edit
/ai-settings                    # Cấu hình AI
/settings
/logs
```

---

## 7. Phân Quyền (RBAC)

### Permissions mới cần thêm

| Permission | BA | DEV | PM | Admin |
|------------|----|----|----|----|
| `groups.view` | ✓ | ✓ | ✓ | ✓ |
| `groups.create` | ✓ | | ✓ | ✓ |
| `groups.edit` | ✓ | | ✓ | ✓ |
| `groups.delete` | ✓ | | ✓ | ✓ |
| `groups.bulk_generate` | ✓ | | ✓ | ✓ |
| `requirements.view` | ✓ | ✓ | ✓ | ✓ |
| `requirements.create` | ✓ | | ✓ | ✓ |
| `requirements.edit` | ✓ | | ✓ | ✓ |
| `requirements.delete` | ✓ | | ✓ | ✓ |
| `documents.view` | ✓ | ✓ | ✓ | ✓ |
| `documents.create` | ✓ | | ✓ | ✓ |
| `documents.edit` | ✓ | | ✓ | ✓ |
| `documents.generate` | ✓ | | | ✓ |
| `documents.approve` | | | ✓ | ✓ |
| `documents.delete` | ✓ | | ✓ | ✓ |
| `templates.view` | ✓ | ✓ | ✓ | ✓ |
| `templates.manage` | | | | ✓ |
| `ai_settings.manage` | | | | ✓ |

---

## 8. Thứ Tự Triển Khai (Implementation Roadmap)

### Phase 1 — Foundation (Tuần 1-2)
- [ ] PostgreSQL migrations:
  - `requirement_groups`, `requirements` (+ group_id, sort_order)
  - `requirement_analyses`
  - `documents` (bỏ `ai_prompt_used`, thêm `generation_log_id`)
  - `document_versions` (bỏ `content`, thêm `mongo_content_id`, `proposal_id`)
  - `document_change_proposals` (bỏ 3 TEXT fields, thêm `mongo_content_id`)
  - `document_templates`, `document_reviews`
  - `ai_generation_logs` (thêm `log_type`, `tokens_input/output`, `mongo_detail_id`)
- [ ] MongoDB — xác nhận collections (không cần migration, schema-less):
  - `ai_conversations`, `ai_generation_details`, `ai_prefill_logs`
  - `document_version_contents`, `change_proposal_contents`
  - `document_diff_cache`, `audit_logs`
- [ ] Seeder: global default templates cho 6 loại tài liệu
- [ ] CRUD API: **Requirement Groups** (tree + reorder + move)
- [ ] CRUD API: Requirements (+ group_id, move-group, auto-code)
- [ ] CRUD API: **Analyses** (CRUD + prefill endpoint)
- [ ] CRUD API: Templates (admin)
- [ ] Permissions seed cho BA/DEV/PM roles (+ groups.* permissions)

### Phase 2 — AI Generation + Logging (Tuần 3-4)
- [ ] AiProviderInterface + ClaudeProvider + DiffCalculator
- [ ] **LogWriter** (mọi AI call đều ghi cả PG + MongoDB, kể cả failed)
- [ ] AnalysisPrefillPromptBuilder (pre-fill form từ raw text)
- [ ] PromptBuilder cho 6 loại tài liệu (dùng structured analysis + group context)
- [ ] ChatRefinementPromptBuilder (luôn output proposed_content + change_summary)
- [ ] AiOrchestrationService + RequirementAnalysisService
- [ ] AiBulkGenerateService (dispatch queue jobs)
- [ ] API: `POST /analyses/prefill`
- [ ] API: `POST /documents/generate` (generate từ analysis_id)
- [ ] API: `POST /groups/{id}/bulk-generate`
- [ ] Frontend: sidebar cây groups + Analysis Form + màn hình workspace

### Phase 3 — Version Control (Tuần 5)
- [ ] DocumentVersionService (create, diff, restore)
- [ ] API: versions endpoints
- [ ] Frontend: version list + diff viewer

### Phase 4 — AI Chat + Change Proposal (Tuần 6)
- [ ] AiChatService:
  - Mỗi lượt chat ghi đầy đủ `ai_request` + `ai_meta` vào `ai_conversations` (MongoDB)
  - Không rút gọn, không bỏ sót bất kỳ field nào
- [ ] DocumentChangeProposalService:
  - create: INSERT PG (metadata) + INSERT MongoDB (content blobs)
  - accept/accept-with-edit: fetch content từ MongoDB → update PG → version snapshot
  - dismiss / supersede: update status PG + sync status vào MongoDB messages
- [ ] API: ai-chat endpoint (luôn trả về proposal, không tự sửa document)
- [ ] API: proposals endpoints (accept, accept-with-edit, dismiss)
- [ ] Frontend: Change Proposal Card (diff preview + Accept/Dismiss buttons)
- [ ] Frontend: Editable proposal preview (user chỉnh trước khi accept)

### Phase 5 — Review Workflow (Tuần 7)
- [ ] DocumentReviewService + state machine
- [ ] API: submit-review, approve, reject
- [ ] Frontend: review workflow UI + notification

### Phase 5.5 — Document Checklist (Tuần 7-8)
- [ ] DB migrations: `document_checklists`, `checklist_items`, `checklist_item_comments`
- [ ] ChecklistGenerationPromptBuilder (output JSON items theo category)
- [ ] DocumentChecklistService (generate + start/submit/verify/reject + comment)
- [ ] API: checklists endpoints (generate, items CRUD, start/submit/verify/reject, comments)
- [ ] Permissions: `checklist.view`, `checklist.submit` (DEV), `checklist.review` (BA/PM)
- [ ] Frontend — Checklist board:
  - Hiển thị items nhóm theo category (tab: API | Validation | BR | DB | Test | UI)
  - DEV: form submit proof (commit hash, PR URL, file refs, note)
  - BA/PM: nút Verify / Reject + modal nhập comment
  - Comment thread hiển thị theo từng item (thread view, có resolve)
  - Badge hiển thị progress: "4/7 verified"
  - Items bị reject highlight đỏ + hiển thị comment lý do

### Phase 6 — Polish & Admin (Tuần 9)
- [ ] Admin: template management UI (seed từ `docs/templates/*.md`)
- [ ] Admin: AI settings UI
- [ ] Audit logs mở rộng
- [ ] Export document (PDF, Word)
