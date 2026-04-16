import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Users, ChevronRight, AlertCircle } from 'lucide-react'
import api, { getSession } from '../../api'
import { AppLayout } from '../../layout/AppLayout'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { PageSpinner } from '../../components/ui/spinner'
import { EmptyState } from '../../components/ui/empty-state'

export function ProjectsPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.token) return
    api.getProjects(session.token)
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout breadcrumbs={[{ label: 'Dự án của tôi' }]}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Dự án của tôi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn dự án để xem nhóm tính năng và yêu cầu.
          </p>
        </div>

        {loading && <PageSpinner />}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title="Chưa có dự án nào"
            description="Bạn chưa được gán vào dự án nào. Liên hệ quản trị viên để được phân quyền."
          />
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer p-5 transition-all hover:border-blue-300 hover:shadow-md"
                onClick={() => navigate(`/projects/${project.id}/groups`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FolderKanban size={20} />
                  </div>
                  <Badge status={project.status} />
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {project.name}
                </h3>

                {project.code && (
                  <p className="mt-0.5 text-xs font-mono text-slate-500">{project.code}</p>
                )}

                {project.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{project.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {project.members_count ?? project.member_count ?? '—'} thành viên
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-300 group-hover:text-blue-500 transition-colors"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
