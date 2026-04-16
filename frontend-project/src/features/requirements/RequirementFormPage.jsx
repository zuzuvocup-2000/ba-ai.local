import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Paperclip, X, FileText,
  Wand2, Save, AlertCircle, Monitor, Info, CheckCircle2,
} from 'lucide-react'
import api, { getSession } from '../../api'
import { AppLayout } from '../../layout/AppLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'draft',       label: 'Nháp',            color: 'bg-slate-100 text-slate-600' },
  { value: 'in_analysis', label: 'Đang phân tích',  color: 'bg-blue-100 text-blue-700' },
  { value: 'completed',   label: 'Hoàn thành',      color: 'bg-emerald-100 text-emerald-700' },
  { value: 'archived',    label: 'Lưu trữ',         color: 'bg-slate-200 text-slate-500' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Thấp',     color: 'bg-slate-100 text-slate-600' },
  { value: 'medium',   label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high',     label: 'Cao',      color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Khẩn cấp', color: 'bg-rose-100 text-rose-700' },
]

const SCREEN_ACCENT_COLORS = [
  'border-blue-400 bg-blue-50',
  'border-violet-400 bg-violet-50',
  'border-teal-400 bg-teal-50',
  'border-orange-400 bg-orange-50',
  'border-pink-400 bg-pink-50',
  'border-indigo-400 bg-indigo-50',
]

const SCREEN_BADGE_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateSampleData(screenName) {
  if (!screenName.trim()) return ''
  return `Màn hình: ${screenName.trim()}
- Dữ liệu đầu vào: [tên trường 1], [tên trường 2]
- Dữ liệu hiển thị: [danh sách / chi tiết]
- Hành động: [Lưu], [Hủy]
- Trạng thái: [loading], [lỗi validation], [thành công]`
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, gradient }) {
  return (
    <div className={`rounded-t-2xl px-6 py-4 ${gradient}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function RequirementFormPage() {
  const { projectId, requirementId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()

  const isEdit = Boolean(requirementId)
  const stateGroup = location.state?.group ?? null
  const stateProject = location.state?.project ?? null

  // ── Form state ──
  const [form, setForm] = useState({
    title: '',
    raw_content: '',
    tags: '',
    status: 'draft',
    priority: 'medium',
  })
  const [screens, setScreens] = useState([])
  const [attachments, setAttachments] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])
  const [removedIds, setRemovedIds] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  // ── Load existing requirement in edit mode ──
  useEffect(() => {
    if (!isEdit || !session?.token) return
    setLoading(true)
    Promise.all([
      api.getRequirement(session.token, requirementId),
      api.listAttachments(session.token, requirementId),
    ])
      .then(([req, atts]) => {
        setForm({
          title: req.title ?? '',
          raw_content: req.raw_content ?? '',
          tags: Array.isArray(req.tags) ? req.tags.join(', ') : (req.tags ?? ''),
          status: req.status ?? 'draft',
          priority: req.priority ?? 'medium',
        })
        setScreens(
          Array.isArray(req.screens)
            ? req.screens.map((s, i) => ({ ...s, _key: i }))
            : []
        )
        setAttachments(Array.isArray(atts) ? atts : [])
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [isEdit, requirementId, session?.token])

  // ── Screens helpers ──
  const addScreen = () =>
    setScreens((prev) => [...prev, { _key: Date.now(), name: '', description: '', sample_data: '' }])

  const removeScreen = (key) => setScreens((prev) => prev.filter((s) => s._key !== key))

  const updateScreen = (key, field, value) =>
    setScreens((prev) => prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)))

  // ── File helpers ──
  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList)
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, _key: Date.now() + Math.random() })),
    ])
  }, [])

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e) => {
    if (e.target.files.length) addFiles(e.target.files)
    e.target.value = ''
  }

  // ── Validation ──
  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Tiêu đề không được để trống.'
    if (!form.raw_content.trim()) errs.raw_content = 'Nội dung yêu cầu không được để trống.'
    screens.forEach((s, i) => {
      if (!s.name.trim()) errs[`screen_${i}`] = 'Tên màn hình không được để trống.'
    })
    return errs
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e?.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []
      const screensPayload = screens.map(({ name, description, sample_data }) => ({
        name: name.trim(),
        description: description ?? '',
        sample_data: sample_data ?? '',
      }))
      const payload = {
        ...form,
        tags: tagsArray,
        screens: screensPayload,
        project_id: Number(projectId),
        group_id: stateGroup?.id ?? null,
      }

      let saved
      if (isEdit) {
        saved = await api.updateRequirement(session.token, requirementId, payload)
      } else {
        saved = await api.createRequirement(session.token, payload)
      }

      const reqId = saved?.id ?? requirementId
      if (reqId) {
        await Promise.allSettled(removedIds.map((id) => api.deleteAttachment(session.token, reqId, id)))
        await Promise.allSettled(pendingFiles.map(({ file }) => api.uploadAttachment(session.token, reqId, file)))
      }

      navigate(`/projects/${projectId}/requirements/${reqId}`, { replace: true })
    } catch (err) {
      if (err.errors) {
        const normalized = Object.entries(err.errors).reduce((acc, [k, v]) => {
          acc[k] = Array.isArray(v) ? v[0] : v
          return acc
        }, {})
        setErrors(normalized)
      } else {
        setErrors({ _general: err.message })
      }
      setSaving(false)
    }
  }

  // ── Breadcrumbs ──
  const breadcrumbs = [
    { label: 'Dự án', href: '/projects' },
    { label: stateProject?.name ?? `Dự án #${projectId}`, href: `/projects/${projectId}/groups` },
    ...(stateGroup ? [{ label: stateGroup.name, href: `/projects/${projectId}/groups/${stateGroup.id}` }] : []),
    { label: isEdit ? 'Chỉnh sửa yêu cầu' : 'Thêm yêu cầu mới' },
  ]

  // ── Loading / Error states ──
  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </AppLayout>
    )
  }

  if (loadError) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-rose-400" />
          <p className="text-slate-600">{loadError}</p>
          <Button className="mt-4" onClick={() => navigate(-1)} variant="secondary">
            Quay lại
          </Button>
        </div>
      </AppLayout>
    )
  }

  // ── Render ──
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:text-slate-800 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Chỉnh sửa yêu cầu' : 'Thêm yêu cầu mới'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit ? 'Cập nhật thông tin yêu cầu nghiệp vụ' : 'Mô tả chi tiết yêu cầu nghiệp vụ mới'}
            </p>
          </div>
        </div>

        {/* Global error */}
        {errors._general && (
          <div
            data-error
            className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <AlertCircle size={16} className="shrink-0" />
            {errors._general}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left: Main form ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* ─── Section 1: Basic info ─── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={CheckCircle2}
                title="Thông tin cơ bản"
                subtitle="Tiêu đề, nội dung mô tả và phân loại yêu cầu"
                gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
              />
              <div className="space-y-5 p-6">
                {/* Title */}
                <div>
                  <FieldLabel required>Tiêu đề yêu cầu</FieldLabel>
                  <input
                    className={[
                      'flex h-11 w-full rounded-xl border px-4 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400',
                      'focus:border-blue-400 focus:ring-3 focus:ring-blue-500/15',
                      errors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white',
                    ].join(' ')}
                    placeholder="VD: Đăng nhập bằng email và mật khẩu"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    data-error={errors.title ? true : undefined}
                  />
                  {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
                </div>

                {/* Raw content */}
                <div>
                  <FieldLabel required>Nội dung yêu cầu nghiệp vụ</FieldLabel>
                  <textarea
                    className={[
                      'flex w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed',
                      'focus:border-blue-400 focus:ring-3 focus:ring-blue-500/15',
                      errors.raw_content ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white',
                    ].join(' ')}
                    placeholder="Mô tả chi tiết yêu cầu nghiệp vụ: người dùng cần làm gì, hệ thống phản hồi ra sao, các điều kiện đặc biệt..."
                    value={form.raw_content}
                    onChange={(e) => setForm((p) => ({ ...p, raw_content: e.target.value }))}
                    rows={7}
                    data-error={errors.raw_content ? true : undefined}
                  />
                  {errors.raw_content && (
                    <p className="mt-1 text-xs text-rose-600">{errors.raw_content}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <input
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-500/15"
                    placeholder="VD: auth, login, security (phân cách bằng dấu phẩy)"
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  />
                  {form.tags && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Trạng thái</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, status: opt.value }))}
                          className={[
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border-2',
                            form.status === opt.value
                              ? `${opt.color} border-current shadow-sm scale-105`
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Độ ưu tiên</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, priority: opt.value }))}
                          className={[
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border-2',
                            form.priority === opt.value
                              ? `${opt.color} border-current shadow-sm scale-105`
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Section 2: Screens ─── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={Monitor}
                title="Mô tả màn hình"
                subtitle="Liệt kê các màn hình giao diện liên quan đến yêu cầu"
                gradient="bg-gradient-to-r from-violet-500 to-purple-600"
              />
              <div className="p-6">
                {screens.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-8 text-center">
                    <Monitor size={32} className="mx-auto mb-2 text-violet-300" />
                    <p className="text-sm font-medium text-violet-600">Chưa có màn hình nào</p>
                    <p className="mt-1 text-xs text-slate-400">Nhấn nút bên dưới để thêm màn hình đầu tiên</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {screens.map((screen, idx) => {
                      const accentClass = SCREEN_ACCENT_COLORS[idx % SCREEN_ACCENT_COLORS.length]
                      const badgeClass = SCREEN_BADGE_COLORS[idx % SCREEN_BADGE_COLORS.length]
                      return (
                        <div
                          key={screen._key}
                          className={`rounded-xl border-l-4 p-4 space-y-3 ${accentClass}`}
                        >
                          {/* Screen header */}
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${badgeClass}`}
                            >
                              {idx + 1}
                            </span>
                            <input
                              className={[
                                'flex-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none transition-all',
                                errors[`screen_${idx}`]
                                  ? 'border-rose-400'
                                  : 'border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15',
                              ].join(' ')}
                              placeholder="Tên màn hình *"
                              value={screen.name}
                              onChange={(e) => updateScreen(screen._key, 'name', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeScreen(screen._key)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {errors[`screen_${idx}`] && (
                            <p className="text-xs text-rose-600 ml-9">{errors[`screen_${idx}`]}</p>
                          )}

                          {/* Description */}
                          <div className="ml-9">
                            <label className="mb-1 block text-xs font-medium text-slate-500">
                              Mô tả chức năng
                            </label>
                            <textarea
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 transition-all resize-none leading-relaxed"
                              placeholder="Mô tả chức năng và mục đích của màn hình..."
                              rows={2}
                              value={screen.description}
                              onChange={(e) => updateScreen(screen._key, 'description', e.target.value)}
                            />
                          </div>

                          {/* Sample data */}
                          <div className="ml-9">
                            <div className="mb-1 flex items-center justify-between">
                              <label className="text-xs font-medium text-slate-500">Dữ liệu mẫu</label>
                              <button
                                type="button"
                                onClick={() => updateScreen(screen._key, 'sample_data', generateSampleData(screen.name))}
                                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-violet-600 hover:bg-violet-100 transition-colors"
                              >
                                <Wand2 size={11} /> Tạo mẫu tự động
                              </button>
                            </div>
                            <textarea
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 transition-all resize-none"
                              placeholder="Nhập dữ liệu mẫu hoặc nhấn 'Tạo mẫu tự động'..."
                              rows={4}
                              value={screen.sample_data}
                              onChange={(e) => updateScreen(screen._key, 'sample_data', e.target.value)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addScreen}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 py-3 text-sm font-medium text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-all"
                >
                  <Plus size={16} /> Thêm màn hình
                </button>
              </div>
            </div>

            {/* ─── Section 3: Attachments ─── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={Paperclip}
                title="Tài liệu liên quan"
                subtitle="Đính kèm các tài liệu, hình ảnh wireframe, file đặc tả..."
                gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              />
              <div className="p-6 space-y-4">
                {/* Drop zone */}
                <div
                  className={[
                    'relative rounded-xl border-2 border-dashed transition-all cursor-pointer',
                    dragging
                      ? 'border-amber-400 bg-amber-50 scale-[1.01]'
                      : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/40',
                  ].join(' ')}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${dragging ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Paperclip size={22} className={dragging ? 'text-amber-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {dragging ? 'Thả tệp vào đây' : 'Kéo thả tệp vào đây'}
                      </p>
                      <p className="text-xs text-slate-400">hoặc nhấn để chọn từ máy tính (tối đa 20 MB/tệp)</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </div>

                {/* File list */}
                {(attachments.length > 0 || pendingFiles.length > 0) && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Tệp đính kèm ({attachments.length + pendingFiles.length})
                    </p>

                    {/* Existing saved files */}
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FileText size={16} className="text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-medium text-blue-600 hover:underline"
                          >
                            {att.original_name}
                          </a>
                          <p className="text-xs text-slate-400">{fmtSize(att.size)}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Đã lưu
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRemovedIds((p) => [...p, att.id])
                            setAttachments((p) => p.filter((a) => a.id !== att.id))
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Pending new files */}
                    {pendingFiles.map(({ file, _key }) => (
                      <div
                        key={_key}
                        className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                          <Paperclip size={16} className="text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-amber-800">{file.name}</p>
                          <p className="text-xs text-amber-500">{fmtSize(file.size)}</p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Chờ tải lên
                        </span>
                        <button
                          type="button"
                          onClick={() => setPendingFiles((p) => p.filter((f) => f._key !== _key))}
                          className="rounded-lg p-1.5 text-amber-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Sticky sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">

            {/* Context card */}
            {(stateGroup || stateProject) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Ngữ cảnh</p>
                {stateProject && (
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">DA</span>
                    <span className="text-sm font-medium text-slate-700">{stateProject.name}</span>
                  </div>
                )}
                {stateGroup && (
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: stateGroup.color ?? '#94a3b8' }}
                    />
                    <span className="text-sm text-slate-600">{stateGroup.name}</span>
                    {stateGroup.prefix && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                        {stateGroup.prefix}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Summary card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng quan</p>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Màn hình</span>
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    {screens.length}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Tệp đính kèm</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {attachments.length + pendingFiles.length}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_OPTIONS.find((s) => s.value === form.status)?.color ?? 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_OPTIONS.find((s) => s.value === form.status)?.label}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Ưu tiên</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_OPTIONS.find((s) => s.value === form.priority)?.color ?? 'bg-slate-100 text-slate-600'}`}>
                    {PRIORITY_OPTIONS.find((s) => s.value === form.priority)?.label}
                  </span>
                </li>
              </ul>
            </div>

            {/* Action card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    {isEdit ? 'Lưu thay đổi' : 'Tạo yêu cầu'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
            </div>

            {/* Tips card */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <Info size={13} /> Gợi ý
              </div>
              <ul className="space-y-1.5 text-xs text-blue-600 leading-relaxed">
                <li>• Mô tả rõ ràng giúp AI tạo tài liệu chính xác hơn</li>
                <li>• Thêm màn hình để AI phân tích flow đầy đủ</li>
                <li>• Đính kèm wireframe hoặc mockup nếu có</li>
                <li>• Tags giúp tìm kiếm và phân loại dễ hơn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
