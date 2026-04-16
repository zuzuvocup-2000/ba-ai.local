import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Paperclip, X, FileText, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import { Modal } from '../../components/ui/modal'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import api, { getSession } from '../../api'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'in_analysis', label: 'Đang phân tích' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'archived', label: 'Lưu trữ' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
  { value: 'critical', label: 'Khẩn cấp' },
]

function generateSampleData(screenName) {
  const name = screenName.trim()
  if (!name) return ''
  return `Màn hình: ${name}
- Dữ liệu đầu vào: [tên trường 1], [tên trường 2]
- Dữ liệu hiển thị: [danh sách / chi tiết]
- Hành động: [Lưu], [Hủy]
- Trạng thái: [loading], [lỗi validation], [thành công]`
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RequirementFormModal({ open, onClose, onSave, requirement, group }) {
  const session = getSession()

  const [form, setForm] = useState({
    title: '',
    raw_content: '',
    tags: '',
    status: 'draft',
    priority: 'medium',
  })
  const [screens, setScreens] = useState([])
  const [attachments, setAttachments] = useState([])     // existing (saved)
  const [pendingFiles, setPendingFiles] = useState([])   // new files queued
  const [removedIds, setRemovedIds] = useState([])       // existing IDs to delete
  const [screensOpen, setScreensOpen] = useState(true)
  const [attachOpen, setAttachOpen] = useState(true)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadingAttach, setLoadingAttach] = useState(false)
  const fileInputRef = useRef(null)

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return

    setForm({
      title: requirement?.title ?? '',
      raw_content: requirement?.raw_content ?? '',
      tags: Array.isArray(requirement?.tags)
        ? requirement.tags.join(', ')
        : (requirement?.tags ?? ''),
      status: requirement?.status ?? 'draft',
      priority: requirement?.priority ?? 'medium',
    })

    setScreens(
      Array.isArray(requirement?.screens)
        ? requirement.screens.map((s, i) => ({ ...s, _key: i }))
        : []
    )

    setPendingFiles([])
    setRemovedIds([])
    setErrors({})

    // Load existing attachments for edit mode
    if (requirement?.id && session?.token) {
      setLoadingAttach(true)
      api.listAttachments(session.token, requirement.id)
        .then(setAttachments)
        .catch(() => setAttachments([]))
        .finally(() => setLoadingAttach(false))
    } else {
      setAttachments([])
    }
  }, [open, requirement?.id])

  // ── Screens helpers ────────────────────────────────────────────────────────
  const addScreen = () => {
    setScreens((prev) => [
      ...prev,
      { _key: Date.now(), name: '', description: '', sample_data: '' },
    ])
  }

  const removeScreen = (key) => {
    setScreens((prev) => prev.filter((s) => s._key !== key))
  }

  const updateScreen = (key, field, value) => {
    setScreens((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s))
    )
  }

  const autoGenSampleData = (key, name) => {
    updateScreen(key, 'sample_data', generateSampleData(name))
  }

  // ── Attachment helpers ─────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? [])
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, _key: Date.now() + Math.random() })),
    ])
    e.target.value = ''
  }

  const removePending = (key) => {
    setPendingFiles((prev) => prev.filter((f) => f._key !== key))
  }

  const removeExisting = (id) => {
    setRemovedIds((prev) => [...prev, id])
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  // ── Validate & Submit ──────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Tiêu đề không được để trống.'
    if (!form.raw_content.trim()) errs.raw_content = 'Nội dung yêu cầu không được để trống.'
    screens.forEach((s, i) => {
      if (!s.name.trim()) errs[`screens_${i}_name`] = 'Tên màn hình không được để trống.'
    })
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const screensPayload = screens.map(({ name, description, sample_data }) => ({
        name: name.trim(),
        description: description ?? '',
        sample_data: sample_data ?? '',
      }))

      const savedReq = await onSave({
        ...form,
        tags: tagsArray,
        screens: screensPayload,
        group_id: group?.id,
      })

      const reqId = savedReq?.id ?? requirement?.id
      if (reqId && session?.token) {
        // Delete removed attachments
        await Promise.allSettled(
          removedIds.map((id) => api.deleteAttachment(session.token, reqId, id))
        )
        // Upload new files
        await Promise.allSettled(
          pendingFiles.map(({ file }) => api.uploadAttachment(session.token, reqId, file))
        )
      }

      onClose()
    } catch (err) {
      if (err.errors) {
        const normalized = Object.entries(err.errors).reduce((acc, [k, v]) => {
          if (Array.isArray(v)) acc[k] = v[0]
          return acc
        }, {})
        setErrors(normalized)
      } else {
        setErrors({ _general: err.message })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={requirement ? 'Chỉnh sửa yêu cầu' : 'Thêm yêu cầu mới'}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="max-h-[75vh] overflow-y-auto space-y-4 pr-1">
          {/* Group context */}
          {group && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: group.color ?? '#94a3b8' }}
              />
              Nhóm: <strong>{group.name}</strong>
              {group.prefix && (
                <span className="rounded bg-slate-200 px-1 font-mono">{group.prefix}</span>
              )}
            </div>
          )}

          {errors._general && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errors._general}
            </p>
          )}

          {/* Basic fields */}
          <Input
            label="Tiêu đề *"
            placeholder="VD: Đăng nhập bằng email và mật khẩu"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={errors.title}
            required
          />

          <Textarea
            label="Nội dung yêu cầu (raw) *"
            placeholder="Mô tả chi tiết yêu cầu nghiệp vụ, người dùng cần làm gì, hệ thống phản hồi ra sao..."
            value={form.raw_content}
            onChange={(e) => setForm((p) => ({ ...p, raw_content: e.target.value }))}
            error={errors.raw_content}
            rows={5}
            required
          />

          <Input
            label="Tags (phân cách bằng dấu phẩy)"
            placeholder="VD: auth, login, security"
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            error={errors.tags}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
            <Select
              label="Độ ưu tiên"
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              options={PRIORITY_OPTIONS}
            />
          </div>

          {/* ── Screens section ── */}
          <div className="rounded-xl border border-slate-200">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
              onClick={() => setScreensOpen((v) => !v)}
            >
              <span className="flex items-center gap-2">
                Mô tả màn hình
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                  {screens.length}
                </span>
              </span>
              {screensOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {screensOpen && (
              <div className="border-t border-slate-100 px-4 pb-4 space-y-3 pt-3">
                {screens.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Chưa có màn hình nào. Nhấn "+ Thêm màn hình" để bắt đầu.
                  </p>
                )}

                {screens.map((screen, idx) => (
                  <div
                    key={screen._key}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-5 text-center">
                        {idx + 1}
                      </span>
                      <input
                        className={[
                          'flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors',
                          errors[`screens_${idx}_name`]
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-slate-200 bg-white focus:border-blue-400',
                        ].join(' ')}
                        placeholder="Tên màn hình *"
                        value={screen.name}
                        onChange={(e) => updateScreen(screen._key, 'name', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeScreen(screen._key)}
                        className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {errors[`screens_${idx}_name`] && (
                      <p className="text-xs text-rose-600 ml-7">{errors[`screens_${idx}_name`]}</p>
                    )}

                    <textarea
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="Mô tả chức năng màn hình..."
                      rows={2}
                      value={screen.description}
                      onChange={(e) => updateScreen(screen._key, 'description', e.target.value)}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Dữ liệu mẫu</span>
                        <button
                          type="button"
                          onClick={() => autoGenSampleData(screen._key, screen.name)}
                          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Wand2 size={11} /> Tạo mẫu
                        </button>
                      </div>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-400 transition-colors resize-none"
                        placeholder="Dữ liệu mẫu cho màn hình..."
                        rows={3}
                        value={screen.sample_data}
                        onChange={(e) => updateScreen(screen._key, 'sample_data', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addScreen}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
                >
                  <Plus size={13} /> Thêm màn hình
                </button>
              </div>
            )}
          </div>

          {/* ── Attachments section ── */}
          <div className="rounded-xl border border-slate-200">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
              onClick={() => setAttachOpen((v) => !v)}
            >
              <span className="flex items-center gap-2">
                Tài liệu liên quan
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                  {attachments.length + pendingFiles.length}
                </span>
              </span>
              {attachOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {attachOpen && (
              <div className="border-t border-slate-100 px-4 pb-4 space-y-2 pt-3">
                {loadingAttach && (
                  <p className="text-xs text-slate-400 text-center py-2">Đang tải...</p>
                )}

                {/* Existing attachments */}
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <FileText size={14} className="shrink-0 text-slate-400" />
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 truncate text-xs text-blue-600 hover:underline"
                    >
                      {att.original_name}
                    </a>
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatFileSize(att.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExisting(att.id)}
                      className="rounded p-0.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

                {/* Pending new files */}
                {pendingFiles.map(({ file, _key }) => (
                  <div
                    key={_key}
                    className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
                  >
                    <Paperclip size={14} className="shrink-0 text-blue-500" />
                    <span className="flex-1 truncate text-xs text-blue-700">{file.name}</span>
                    <span className="text-xs text-blue-400 shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePending(_key)}
                      className="rounded p-0.5 text-blue-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

                {attachments.length === 0 && pendingFiles.length === 0 && !loadingAttach && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Chưa có tài liệu đính kèm.
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
                >
                  <Paperclip size={13} /> Chọn tệp đính kèm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : requirement ? 'Cập nhật' : 'Thêm yêu cầu'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
