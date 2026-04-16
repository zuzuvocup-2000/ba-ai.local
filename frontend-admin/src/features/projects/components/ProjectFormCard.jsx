import { FolderGit2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select2 } from '../../../components/ui/select2'

const statusOptions = [
  { value: 'planning', label: 'Lập kế hoạch' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'on-hold', label: 'Tạm dừng' },
  { value: 'done', label: 'Hoàn thành' },
]

export function ProjectFormCard({
  loading,
  can,
  projectForm,
  setProjectForm,
  onSubmitProject,
  onResetProjectForm,
  fieldErrors,
}) {
  const selectedStatus = statusOptions.find((option) => option.value === projectForm.status) ?? statusOptions[0]

  return (
    <Card className="p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <FolderGit2 size={18} /> Biểu mẫu dự án
      </h3>
      <p className="mb-5 text-sm text-slate-500">Tạo mới hoặc cập nhật dự án.</p>
      <form onSubmit={onSubmitProject} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Mã dự án</label>
          <Input
            value={projectForm.code}
            onChange={(event) => setProjectForm({ ...projectForm, code: event.target.value })}
            required
          />
          {fieldErrors?.code && <p className="text-xs text-rose-600">{fieldErrors.code}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Tên dự án</label>
          <Input
            value={projectForm.name}
            onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
            required
          />
          {fieldErrors?.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Trạng thái</label>
          <Select2
            options={statusOptions}
            value={selectedStatus}
            onChange={(selectedOption) => setProjectForm({ ...projectForm, status: selectedOption?.value ?? 'planning' })}
          />
          {fieldErrors?.status && <p className="text-xs text-rose-600">{fieldErrors.status}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Mô tả</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            value={projectForm.description}
            onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
          />
          {fieldErrors?.description && <p className="text-xs text-rose-600">{fieldErrors.description}</p>}
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <Button
            type="submit"
            disabled={loading || (!can('projects.create') && !projectForm.id) || (!can('projects.edit') && !!projectForm.id)}
          >
            {projectForm.id ? 'Cập nhật dự án' : 'Tạo dự án'}
          </Button>
          <Button type="button" variant="secondary" onClick={onResetProjectForm}>
            Đặt lại
          </Button>
        </div>
      </form>
    </Card>
  )
}

