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

const statusLabelMap = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]))

export function ProjectsPage({
  projects,
  users,
  loading,
  can,
  projectForm,
  setProjectForm,
  onSubmitProject,
  onResetProjectForm,
  onEditProject,
  onDeleteProject,
  onSyncProjectMembers,
  fieldErrors,
  error,
}) {
  const memberOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }))
  const selectedMembers = memberOptions.filter((option) => projectForm.member_ids.includes(option.value))
  const selectedStatus = statusOptions.find((option) => option.value === projectForm.status) ?? statusOptions[0]

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-6 2xl:grid-cols-[430px_1fr]">
        <Card className="p-6">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FolderGit2 size={18} /> Biểu mẫu dự án
          </h3>
          <p className="mb-5 text-sm text-slate-500">Tạo mới hoặc cập nhật dự án và thành viên.</p>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Thành viên</label>
              <Select2
                isMulti
                options={memberOptions}
                value={selectedMembers}
                onChange={(selectedOptions) =>
                  setProjectForm({
                    ...projectForm,
                    member_ids: (selectedOptions ?? []).map((option) => Number(option.value)),
                  })}
              />
              {fieldErrors?.member_ids && <p className="text-xs text-rose-600">{fieldErrors.member_ids}</p>}
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

        <Card className="p-6">
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Danh sách dự án</h3>
          <p className="mb-4 text-sm text-slate-500">Xem, sửa, xóa và cập nhật nhanh thành viên từng dự án.</p>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-3">Mã</th>
                  <th className="px-3 py-3">Tên</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Thành viên</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-slate-100 align-top last:border-b-0">
                    <td className="px-3 py-3 font-medium text-slate-700">{project.code}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{project.name}</p>
                      {project.description ? <p className="mt-1 text-xs text-slate-500">{project.description}</p> : null}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{statusLabelMap[project.status] ?? project.status}</td>
                    <td className="px-3 py-3">
                      <div className="mb-2 text-xs text-slate-500">
                        {project.members.length ? project.members.map((member) => member.name).join(', ') : 'Chưa có member'}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!can('projects.edit')}
                        onClick={() => onSyncProjectMembers(project.id, projectForm.id === project.id ? projectForm.member_ids : project.members.map((m) => m.id))}
                      >
                        Cập nhật thành viên
                      </Button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" disabled={!can('projects.edit')} onClick={() => onEditProject(project)}>
                          Sửa
                        </Button>
                        <Button type="button" variant="danger" disabled={!can('projects.delete')} onClick={() => onDeleteProject(project.id)}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!projects.length && <p className="py-4 text-center text-sm text-slate-500">Không có dữ liệu dự án.</p>}
          </div>
        </Card>
      </div>
    </>
  )
}

