import { useState, useEffect } from 'react'
import { Modal } from '../../components/ui/modal'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'review', label: 'Đang review' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'done', label: 'Hoàn thành' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
  { value: 'critical', label: 'Khẩn cấp' },
]

export function RequirementFormModal({ open, onClose, onSave, requirement, group }) {
  const [form, setForm] = useState({
    title: '',
    raw_content: '',
    tags: '',
    status: 'draft',
    priority: 'medium',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        title: requirement?.title ?? '',
        raw_content: requirement?.raw_content ?? '',
        tags: Array.isArray(requirement?.tags)
          ? requirement.tags.join(', ')
          : (requirement?.tags ?? ''),
        status: requirement?.status ?? 'draft',
        priority: requirement?.priority ?? 'medium',
      })
      setErrors({})
    }
  }, [open, requirement])

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Tiêu đề không được để trống.'
    if (!form.raw_content.trim()) errs.raw_content = 'Nội dung yêu cầu không được để trống.'
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
      await onSave({
        ...form,
        tags: tagsArray,
        group_id: group?.id,
      })
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
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Context: group */}
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
          rows={6}
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

        <div className="flex justify-end gap-2 pt-2">
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
