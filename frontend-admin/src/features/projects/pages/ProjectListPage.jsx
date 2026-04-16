import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Select2 } from '../../../components/ui/select2'

const statusMap = {
  planning: 'Lập kế hoạch',
  active: 'Đang hoạt động',
  'on-hold': 'Tạm dừng',
  done: 'Hoàn thành',
}

export function ProjectListPage({ projects, users, loading, can, onDeleteProject, onSyncProjectMembers, error }) {
  const [deleteProjectId, setDeleteProjectId] = useState(null)
  const [memberProjectId, setMemberProjectId] = useState(null)
  const [memberAssignments, setMemberAssignments] = useState([])

  const openMemberModal = (project) => {
    setMemberProjectId(project.id)
    setMemberAssignments(project.members.map((member) => ({
      user_id: member.id,
      project_role: member.project_role ?? 'dev',
    })))
  }

  const activeProject = projects.find((project) => project.id === memberProjectId) ?? null
  const projectRoleOptions = [
    { value: 'project-manager', label: 'Project Manager' },
    { value: 'ba', label: 'BA' },
    { value: 'dev', label: 'Dev' },
  ]

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Danh sách dự án</h3>
            <p className="text-sm text-slate-500">Quản lý theo màn hình riêng: danh sách, tạo mới, chỉnh sửa.</p>
          </div>
          <Link to="/admin/projects/create">
            <Button disabled={!can('projects.create')}>Tạo dự án</Button>
          </Link>
        </div>
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
                  <td className="px-3 py-3 text-slate-600">{statusMap[project.status] ?? project.status}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {project.members.length
                      ? project.members.map((member) => `${member.name} (${member.project_role ?? 'dev'})`).join(', ')
                      : 'Chưa có thành viên'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/projects/${project.id}/edit`}>
                        <Button type="button" variant="secondary" disabled={!can('projects.edit')}>
                          Sửa
                        </Button>
                      </Link>
                      <Button type="button" variant="secondary" disabled={!can('projects.edit')} onClick={() => openMemberModal(project)}>
                        Thành viên
                      </Button>
                      <Button type="button" variant="danger" disabled={!can('projects.delete')} onClick={() => setDeleteProjectId(project.id)}>
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

      {deleteProjectId && (
        <div className="fixed inset-0 z-[9998] grid place-items-center bg-slate-900/55 p-4">
          <Card className="w-full max-w-md p-6">
            <h4 className="text-base font-semibold text-slate-900">Xác nhận xóa dự án</h4>
            <p className="mt-2 text-sm text-slate-600">Bạn có chắc muốn xóa dự án này? Thao tác này không thể hoàn tác.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteProjectId(null)}>Hủy</Button>
              <Button
                variant="danger"
                disabled={loading}
                onClick={async () => {
                  await onDeleteProject(deleteProjectId)
                  setDeleteProjectId(null)
                }}
              >
                Xác nhận xóa
              </Button>
            </div>
          </Card>
        </div>
      )}

      {memberProjectId && activeProject && (
        <div className="fixed inset-0 z-[9998] grid place-items-center bg-slate-900/55 p-4">
          <Card className="w-full max-w-xl p-6">
            <h4 className="text-base font-semibold text-slate-900">Quản lý thành viên dự án</h4>
            <p className="mt-1 text-sm text-slate-500">{activeProject.name}</p>
            <div className="mt-4">
              <div className="space-y-2">
                {memberAssignments.map((assignment, index) => (
                  <div key={`${index}-${assignment.user_id || 'new'}`} className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={assignment.user_id}
                      onChange={(event) => {
                        const next = [...memberAssignments]
                        next[index] = { ...next[index], user_id: Number(event.target.value) }
                        setMemberAssignments(next)
                      }}
                    >
                      <option value="">Chọn thành viên</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <Select2
                      options={projectRoleOptions}
                      value={projectRoleOptions.find((role) => role.value === assignment.project_role) ?? projectRoleOptions[2]}
                      onChange={(selected) => {
                        const next = [...memberAssignments]
                        next[index] = { ...next[index], project_role: selected?.value ?? 'dev' }
                        setMemberAssignments(next)
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setMemberAssignments(memberAssignments.filter((_, memberIndex) => memberIndex !== index))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => setMemberAssignments([...memberAssignments, { user_id: '', project_role: 'dev' }])}
              >
                Thêm thành viên
              </Button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMemberProjectId(null)}>Đóng</Button>
              <Button
                disabled={loading || !can('projects.edit')}
                onClick={async () => {
                  await onSyncProjectMembers(memberProjectId, memberAssignments)
                  setMemberProjectId(null)
                }}
              >
                Lưu thành viên
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

