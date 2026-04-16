import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

const DOCUMENT_TYPES = [
  { value: 'brd', label: 'BRD' },
  { value: 'flow_diagram', label: 'Flow Diagram' },
  { value: 'sql_logic', label: 'SQL Logic' },
  { value: 'business_rules', label: 'Business Rules' },
  { value: 'validation_rules', label: 'Validation Rules' },
  { value: 'test_cases', label: 'Test Cases' },
  { value: 'checklist', label: 'Checklist' },
]

const TYPE_COLORS = {
  brd: 'bg-indigo-100 text-indigo-700',
  flow_diagram: 'bg-sky-100 text-sky-700',
  sql_logic: 'bg-violet-100 text-violet-700',
  business_rules: 'bg-amber-100 text-amber-700',
  validation_rules: 'bg-orange-100 text-orange-700',
  test_cases: 'bg-green-100 text-green-700',
  checklist: 'bg-teal-100 text-teal-700',
}

const EMPTY_FORM = {
  name: '',
  type: 'brd',
  body: '',
  is_global: true,
  is_default: false,
}

export function TemplatesPage({ token, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate, setDefaultTemplate, onNotify }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [editModal, setEditModal] = useState(null) // null | { mode: 'create' | 'edit', data: object }
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    fetchTemplates(token)
      .then((data) => setTemplates(data ?? []))
      .catch((err) => onNotify?.('error', err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [token])

  const filtered = filterType === 'all' ? templates : templates.filter((t) => t.type === filterType)

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditModal({ mode: 'create' })
  }

  const openEdit = (template) => {
    setForm({
      name: template.name ?? '',
      type: template.type ?? 'brd',
      body: template.body ?? '',
      is_global: Boolean(template.is_global),
      is_default: Boolean(template.is_default),
    })
    setEditModal({ mode: 'edit', data: template })
  }

  const closeModal = () => {
    setEditModal(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormLoading(true)
    try {
      if (editModal.mode === 'create') {
        await createTemplate(form, token)
        onNotify?.('success', 'Tạo template thành công.')
      } else {
        await updateTemplate(editModal.data.id, form, token)
        onNotify?.('success', 'Cập nhật template thành công.')
      }
      closeModal()
      load()
    } catch (err) {
      onNotify?.('error', err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setFormLoading(true)
    try {
      await deleteTemplate(deleteTarget.id, token)
      onNotify?.('success', 'Xóa template thành công.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      onNotify?.('error', err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSetDefault = async (template) => {
    try {
      await setDefaultTemplate(template.id, token)
      onNotify?.('success', `Đã đặt "${template.name}" làm mặc định.`)
      load()
    } catch (err) {
      onNotify?.('error', err.message)
    }
  }

  const typeLabel = (type) => DOCUMENT_TYPES.find((d) => d.value === type)?.label ?? type

  return (
    <>
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Admin dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Quản lý Template</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý các template tài liệu dùng cho AI BA Assistant</p>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({templates.length})
            </button>
            {DOCUMENT_TYPES.map((dt) => {
              const count = templates.filter((t) => t.type === dt.value).length
              return (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setFilterType(dt.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterType === dt.value
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dt.label} ({count})
                </button>
              )
            })}
          </div>
          <Button onClick={openCreate}>
            <Plus size={15} className="mr-1.5" />
            Tạo template
          </Button>
        </div>

        {loading && <p className="text-sm text-slate-500">Đang tải template...</p>}

        <div className="space-y-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-gradient-to-br from-indigo-100 to-sky-100 p-1.5 text-indigo-600">
                    <FileText size={14} />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{template.name}</p>
                  <Badge className={TYPE_COLORS[template.type] ?? 'bg-slate-100 text-slate-700'}>
                    {typeLabel(template.type)}
                  </Badge>
                  {template.is_global && (
                    <Badge className="bg-sky-100 text-sky-700">Global</Badge>
                  )}
                  {template.is_default && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Star size={10} className="mr-1 inline" />
                      Mặc định
                    </Badge>
                  )}
                </div>
                {template.body && (
                  <p className="mt-2 line-clamp-2 pl-8 text-xs text-slate-400">{template.body}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!template.is_default && (
                  <button
                    type="button"
                    title="Đặt làm mặc định"
                    onClick={() => handleSetDefault(template)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  title="Sửa template"
                  onClick={() => openEdit(template)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  title="Xóa template"
                  onClick={() => setDeleteTarget(template)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-rose-100 hover:text-rose-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {!loading && !filtered.length && (
            <p className="text-sm text-slate-500">
              {filterType === 'all' ? 'Chưa có template nào.' : `Chưa có template nào cho loại "${typeLabel(filterType)}".`}
            </p>
          )}
        </div>
      </Card>

      {/* Create / Edit Modal */}
      {editModal && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {editModal.mode === 'create' ? 'Tạo template mới' : 'Sửa template'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Tên template <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tên template..."
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Loại tài liệu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus-visible:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  required
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nội dung template (Body) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Nhập nội dung template, dùng {variable} cho các biến động..."
                  rows={10}
                  required
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus-visible:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-0 font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_global}
                    onChange={(e) => setForm({ ...form, is_global: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Template toàn cục (global)
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Đặt làm mặc định
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Hủy
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Đang xử lý...' : editModal.mode === 'create' ? 'Tạo template' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Xác nhận xóa</h3>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc muốn xóa template{' '}
              <span className="font-medium text-slate-800">"{deleteTarget.name}"</span> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button type="button" variant="danger" disabled={formLoading} onClick={handleDelete}>
                {formLoading ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
