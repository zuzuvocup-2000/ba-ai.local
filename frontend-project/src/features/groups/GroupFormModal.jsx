import { useState, useEffect } from 'react'
import { Modal } from '../../components/ui/modal'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
]

export function GroupFormModal({ open, onClose, onSave, group, groups = [], projectId }) {
  const [form, setForm] = useState({
    name: '',
    prefix: '',
    color: PRESET_COLORS[0],
    description: '',
    parent_id: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        name: group?.name ?? '',
        prefix: group?.prefix ?? '',
        color: group?.color ?? PRESET_COLORS[0],
        description: group?.description ?? '',
        parent_id: group?.parent_id ? String(group.parent_id) : '',
      })
      setErrors({})
    }
  }, [open, group])

  // Only root groups can be parents (max 2 levels)
  const rootGroups = groups.filter((g) => !g.parent_id && g.id !== group?.id)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Tên nhóm không được để trống.'
    // If chosen parent itself has a parent → max depth violated
    if (form.parent_id) {
      const parent = groups.find((g) => String(g.id) === form.parent_id)
      if (parent?.parent_id) {
        errs.parent_id = 'Chỉ cho phép tối đa 2 cấp nhóm. Nhóm cha đã là nhóm con.'
      }
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      await onSave({
        ...form,
        prefix: form.prefix.toUpperCase(),
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        project_id: projectId,
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
      title={group ? 'Chỉnh sửa nhóm tính năng' : 'Thêm nhóm tính năng'}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errors._general && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errors._general}
          </p>
        )}

        <Input
          label="Tên nhóm *"
          placeholder="VD: Quản lý người dùng"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          error={errors.name}
          required
        />

        <Input
          label="Prefix (mã rút gọn)"
          placeholder="VD: USER"
          value={form.prefix}
          onChange={(e) => setForm((p) => ({ ...p, prefix: e.target.value.toUpperCase() }))}
          error={errors.prefix}
          maxLength={10}
        />

        <Select
          label="Nhóm cha (nếu là nhóm con)"
          value={form.parent_id}
          onChange={(e) => setForm((p) => ({ ...p, parent_id: e.target.value }))}
          error={errors.parent_id}
          options={[
            { value: '', label: '— Không có (nhóm gốc) —' },
            ...rootGroups.map((g) => ({ value: String(g.id), label: g.name })),
          ]}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Màu sắc</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((p) => ({ ...p, color }))}
                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: form.color === color ? '#1e293b' : 'transparent',
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn về nhóm tính năng..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : group ? 'Cập nhật' : 'Thêm nhóm'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
