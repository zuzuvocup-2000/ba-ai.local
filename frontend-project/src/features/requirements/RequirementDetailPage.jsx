import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Tag, Calendar, Lock, AlertCircle } from 'lucide-react'
import api, { getSession } from '../../api'
import { AppLayout } from '../../layout/AppLayout'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { PageSpinner } from '../../components/ui/spinner'
import { AnalysisForm } from '../analyses/AnalysisForm'

export function RequirementDetailPage() {
  const { projectId, requirementId } = useParams()
  const navigate = useNavigate()
  const session = getSession()

  const [requirement, setRequirement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('analysis')

  useEffect(() => {
    if (!session?.token || !requirementId) return
    setLoading(true)
    api.getRequirement(session.token, requirementId)
      .then(setRequirement)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [requirementId])

  const breadcrumbs = [
    { label: 'Dự án', href: '/projects' },
    { label: `Dự án #${projectId}`, href: `/projects/${projectId}/groups` },
    { label: requirement?.title ?? 'Yêu cầu' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>

        {loading && <PageSpinner />}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && requirement && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* ── Left: Main content ── */}
            <div className="space-y-5">
              {/* Requirement info card */}
              <Card className="p-5">
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  {requirement.code && (
                    <span className="font-mono text-xs text-slate-400">{requirement.code}</span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Badge status={requirement.status} />
                    <Badge priority={requirement.priority} />
                  </div>
                </div>

                <h1 className="text-xl font-bold text-slate-900">{requirement.title}</h1>

                {requirement.raw_content && (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Nội dung yêu cầu
                    </p>
                    <div className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 leading-relaxed">
                      {requirement.raw_content}
                    </div>
                  </div>
                )}

                {requirement.tags && requirement.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Tag size={12} className="text-slate-400" />
                    {(Array.isArray(requirement.tags)
                      ? requirement.tags
                      : requirement.tags.split(',')
                    ).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                  {requirement.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Tạo: {new Date(requirement.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  {requirement.updated_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Cập nhật: {new Date(requirement.updated_at).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </Card>

              {/* Section tabs */}
              <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {[
                  { key: 'analysis', label: 'Phân tích nghiệp vụ' },
                  { key: 'documents', label: 'Tài liệu' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSection(s.key)}
                    className={[
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                      activeSection === s.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900',
                    ].join(' ')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Analysis section */}
              {activeSection === 'analysis' && (
                <Card className="p-5">
                  <AnalysisForm requirementId={Number(requirementId)} />
                </Card>
              )}

              {/* Documents section (Phase 2) */}
              {activeSection === 'documents' && (
                <Card className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-semibold text-slate-700">Danh sách tài liệu</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Chức năng quản lý tài liệu sẽ ra mắt ở Phase 2.
                  </p>
                  <div className="mt-4">
                    <div className="relative inline-block group">
                      <Button disabled className="cursor-not-allowed opacity-70">
                        <Lock size={13} /> Tạo tài liệu
                      </Button>
                      <div className="absolute bottom-full left-1/2 mb-2 hidden w-44 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white group-hover:block">
                        Sắp ra mắt ở Phase 2
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* ── Right sidebar: Meta info ── */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Thông tin yêu cầu
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">Trạng thái</dt>
                    <dd className="mt-0.5">
                      <Badge status={requirement.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Độ ưu tiên</dt>
                    <dd className="mt-0.5">
                      <Badge priority={requirement.priority} />
                    </dd>
                  </div>
                  {requirement.group && (
                    <div>
                      <dt className="text-xs text-slate-400">Nhóm tính năng</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: requirement.group.color ?? '#94a3b8' }}
                        />
                        {requirement.group.name}
                      </dd>
                    </div>
                  )}
                  {requirement.code && (
                    <div>
                      <dt className="text-xs text-slate-400">Mã yêu cầu</dt>
                      <dd className="mt-0.5 font-mono text-sm text-slate-700">{requirement.code}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Documents placeholder */}
              <Card className="p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tài liệu đã tạo
                </h3>
                <p className="text-xs text-slate-400">Chưa có tài liệu. (Phase 2)</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
