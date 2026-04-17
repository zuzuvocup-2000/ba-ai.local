import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Tag, Calendar, AlertCircle, Monitor, Paperclip, Zap, CheckCircle2, Pencil, SkipForward, RefreshCw } from 'lucide-react'
import api, { getSession } from '../../api'
import { AppLayout } from '../../layout/AppLayout'
import { Badge } from '../../components/ui/badge'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PageSpinner, Spinner } from '../../components/ui/spinner'
import { DocumentsTab } from '../documents/DocumentsTab'

const DOC_TYPES = ['brd', 'flow_diagram', 'sql_logic', 'business_rules', 'validation_rules', 'test_cases']
const DOC_LABELS = {
  brd: 'BRD',
  flow_diagram: 'Flow Diagram',
  sql_logic: 'SQL Logic',
  business_rules: 'Business Rules',
  validation_rules: 'Validation Rules',
  test_cases: 'Test Cases',
}

export function RequirementDetailPage() {
  const { projectId, requirementId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()

  // ?generate=1 — navigate from form with "Save & Generate"
  const shouldAutoGenerate = new URLSearchParams(location.search).get('generate') === '1'

  const [requirement, setRequirement] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState(null)
  const [genError, setGenError] = useState('')
  const [docsKey, setDocsKey] = useState(0) // force DocumentsTab re-mount

  useEffect(() => {
    if (!session?.token || !requirementId) return
    setLoading(true)
    api.getRequirement(session.token, requirementId)
      .then((req) => {
        setRequirement(req)
        return api.listAttachments(session.token, requirementId)
      })
      .then(setAttachments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [requirementId])

  // Auto-generate when coming from form with ?generate=1
  useEffect(() => {
    if (!shouldAutoGenerate || !requirement || generating) return
    handleGenerateAll()
    // Remove ?generate param from URL so refresh doesn't re-trigger
    navigate(location.pathname, { replace: true })
  }, [shouldAutoGenerate, requirement])

  const handleGenerateAll = useCallback(async (force = false) => {
    if (!session?.token || !requirementId) return
    setGenerating(true)
    setGenError('')
    setGenResult(null)
    try {
      const result = await api.generateAllDocs(session.token, requirementId, force)
      setGenResult(result)
      setDocsKey((k) => k + 1)
    } catch (err) {
      setGenError(err.message ?? 'Sinh tài liệu thất bại')
    } finally {
      setGenerating(false)
    }
  }, [requirementId, session?.token])

  const breadcrumbs = [
    { label: 'Dự án', href: '/projects' },
    { label: `Dự án #${projectId}`, href: `/projects/${projectId}/groups` },
    { label: requirement?.title ?? 'Yêu cầu' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Back button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>

          {requirement && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate(`/projects/${projectId}/requirements/${requirementId}/edit`)
              }
            >
              <Pencil size={13} /> Chỉnh sửa yêu cầu
            </Button>
          )}
        </div>

        {loading && <PageSpinner />}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && requirement && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
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

                {/* Screens */}
                {requirement.screens && requirement.screens.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <Monitor size={12} /> Màn hình ({requirement.screens.length})
                    </p>
                    <div className="space-y-3">
                      {requirement.screens.map((screen, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <p className="font-medium text-slate-800 text-sm">
                            <span className="mr-2 font-mono text-xs text-slate-400">{idx + 1}.</span>
                            {screen.name}
                          </p>
                          {screen.description && (
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {screen.description}
                            </p>
                          )}
                          {screen.sample_data && (
                            <pre className="mt-2 rounded bg-white border border-slate-200 px-3 py-2 text-xs text-slate-600 font-mono whitespace-pre-wrap">
                              {screen.sample_data}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
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

              {/* ── Generate All Banner ── */}
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-emerald-900">
                      <Zap size={16} className="text-emerald-600" />
                      Sinh tất cả tài liệu bằng AI
                    </h3>
                    <p className="mt-0.5 text-xs text-emerald-700">
                      AI sẽ gen ngay: BRD · Flow Diagram · SQL Logic · Business Rules · Validation Rules · Test Cases
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      onClick={() => handleGenerateAll(false)}
                      disabled={generating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {generating ? (
                        <>
                          <Spinner size="sm" />
                          Đang sinh...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Sinh tài liệu mới
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerateAll(true)}
                      disabled={generating}
                      title="Sinh lại toàn bộ, kể cả tài liệu đã có (tốn token)"
                    >
                      <RefreshCw size={14} />
                      Sinh lại tất cả
                    </Button>
                  </div>
                </div>

                {/* Generating progress indicator */}
                {generating && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {DOC_TYPES.map((type) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-emerald-800"
                      >
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
                        {DOC_LABELS[type]}
                      </div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {genResult && !generating && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      {genResult.generated > 0 && (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 size={15} />
                          {genResult.generated} tài liệu sinh thành công
                        </span>
                      )}
                      {genResult.skipped > 0 && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <SkipForward size={14} />
                          {genResult.skipped} đã có — bỏ qua (tiết kiệm token)
                        </span>
                      )}
                      {genResult.failed > 0 && (
                        <span className="text-sm font-semibold text-rose-600">
                          {genResult.failed} thất bại
                        </span>
                      )}
                    </div>
                    {genResult.failed > 0 && genResult.errors?.length > 0 && (
                      <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                        {genResult.errors.join(' · ')}
                      </p>
                    )}
                  </div>
                )}

                {genError && !generating && (
                  <p className="mt-3 text-sm text-rose-700">{genError}</p>
                )}
              </div>

              {/* ── Documents Tab ── */}
              <Card className="p-5">
                <h2 className="mb-4 text-sm font-semibold text-slate-700">Tài liệu đã tạo</h2>
                <DocumentsTab
                  key={docsKey}
                  requirementId={Number(requirementId)}
                  groupId={requirement.group_id ?? requirement.group?.id}
                />
              </Card>
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

              {/* Related attachments */}
              {attachments.length > 0 && (
                <Card className="p-4">
                  <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Paperclip size={12} /> Tài liệu đính kèm ({attachments.length})
                  </h3>
                  <ul className="space-y-2">
                    {attachments.map((att) => (
                      <li key={att.id} className="flex items-center gap-2">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 truncate text-xs text-blue-600 hover:underline"
                        >
                          {att.original_name}
                        </a>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {att.size < 1024 * 1024
                            ? `${(att.size / 1024).toFixed(1)} KB`
                            : `${(att.size / (1024 * 1024)).toFixed(1)} MB`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* How to use card */}
              <Card className="p-4 border-emerald-100 bg-emerald-50">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Zap size={12} /> Quy trình
                </h3>
                <ol className="space-y-1.5 text-xs text-emerald-700 leading-relaxed">
                  <li>1. Nhấn <strong>Sinh tất cả tài liệu</strong></li>
                  <li>2. AI gen BRD, Flow, SQL, Rules, Tests</li>
                  <li>3. BA / Dev rà soát và chỉnh sửa</li>
                  <li>4. Submit review → approve</li>
                </ol>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
