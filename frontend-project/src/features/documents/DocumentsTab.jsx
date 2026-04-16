import { useState, useEffect, useCallback } from 'react'
import { FileText, Trash2, Eye, EyeOff, Zap, CheckSquare } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Spinner } from '../../components/ui/spinner'
import { EmptyState } from '../../components/ui/empty-state'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'
import { DocumentViewer } from './DocumentViewer'
import { GenerateModal } from './GenerateModal'
import { ChecklistPanel } from './ChecklistPanel'

const TYPE_LABELS = {
  brd: 'BRD',
  flow_diagram: 'Flow',
  sql_logic: 'SQL',
  business_rules: 'BR',
  validation_rules: 'VAL',
  test_cases: 'TC',
  checklist: 'CL',
}

const TYPE_COLORS = {
  brd: 'bg-blue-100 text-blue-700',
  flow_diagram: 'bg-emerald-100 text-emerald-700',
  sql_logic: 'bg-yellow-100 text-yellow-700',
  business_rules: 'bg-rose-100 text-rose-700',
  validation_rules: 'bg-slate-100 text-slate-600',
  test_cases: 'bg-emerald-100 text-emerald-700',
  checklist: 'bg-blue-100 text-blue-700',
}

const STATUS_LABELS = {
  draft: 'Nháp',
  generating: 'Đang sinh...',
  generated: 'Đã sinh',
  approved: 'Đã duyệt',
}

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  generating: 'bg-yellow-100 text-yellow-700',
  generated: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
}

export function DocumentsTab({ requirementId, groupId }) {
  const session = getSession()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [loadingDocId, setLoadingDocId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [checklistDocId, setChecklistDocId] = useState(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const fetchDocuments = useCallback(async () => {
    if (!requirementId) return
    setLoading(true)
    setError('')
    try {
      const data = await api.listDocuments(session.token, requirementId)
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message ?? 'Không thể tải tài liệu')
    } finally {
      setLoading(false)
    }
  }, [requirementId, session?.token])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleView = useCallback(async (doc) => {
    if (expandedId === doc.id) {
      setExpandedId(null)
      setExpandedDoc(null)
      return
    }
    // Load full content
    setLoadingDocId(doc.id)
    try {
      const full = await api.getDocument(session.token, doc.id)
      setExpandedDoc(full)
      setExpandedId(doc.id)
    } catch (err) {
      showToast(err.message ?? 'Không thể tải tài liệu', 'error')
    } finally {
      setLoadingDocId(null)
    }
  }, [expandedId, session?.token, showToast])

  const handleDelete = useCallback(async (doc) => {
    if (!window.confirm(`Xóa tài liệu "${doc.title}"?`)) return
    setDeletingId(doc.id)
    try {
      await api.deleteDocument(session.token, doc.id)
      showToast('Đã xóa tài liệu', 'success')
      if (expandedId === doc.id) {
        setExpandedId(null)
        setExpandedDoc(null)
      }
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err) {
      showToast(err.message ?? 'Xóa thất bại', 'error')
    } finally {
      setDeletingId(null)
    }
  }, [expandedId, session?.token, showToast])

  const handleUpdate = useCallback((updated) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
    )
    setExpandedDoc((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
  }, [])

  const handleGenerated = useCallback(() => {
    setGenerateOpen(false)
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-4">
      <Toast toast={toast} onClose={hideToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Tài liệu</h2>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setGenerateOpen(true)}
        >
          <Zap size={13} />
          Sinh tài liệu
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && documents.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Chưa có tài liệu"
          description="Nhấn Sinh tài liệu để tạo tài liệu bằng AI"
        />
      )}

      {/* Document list */}
      {!loading && !error && documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id}>
              {/* Row */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                {/* Type badge */}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[doc.type] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {TYPE_LABELS[doc.type] ?? doc.type}
                </span>

                {/* Title */}
                <span className="flex-1 min-w-0 truncate text-sm font-medium text-slate-700">
                  {doc.title}
                </span>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[doc.status] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {STATUS_LABELS[doc.status] ?? doc.status}
                </span>

                {/* Token info */}
                {doc.generation_log && (
                  <span className="text-xs text-slate-400">
                    {typeof doc.generation_log === 'object' && doc.generation_log.tokens
                      ? `tokens: ${doc.generation_log.tokens}`
                      : typeof doc.generation_log === 'string'
                      ? `log`
                      : null}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(doc)}
                    disabled={loadingDocId === doc.id}
                  >
                    {loadingDocId === doc.id ? (
                      <Spinner size="sm" />
                    ) : expandedId === doc.id ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    {expandedId === doc.id ? 'Đóng' : 'Xem'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setChecklistDocId((prev) => (prev === doc.id ? null : doc.id))
                    }
                    className={checklistDocId === doc.id ? 'text-blue-600 bg-blue-50' : ''}
                  >
                    <CheckSquare size={13} />
                    Checklist
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    {deletingId === doc.id ? <Spinner size="sm" /> : <Trash2 size={13} />}
                    Xóa
                  </Button>
                </div>
              </div>

              {/* Expanded viewer */}
              {expandedId === doc.id && expandedDoc && (
                <DocumentViewer
                  document={expandedDoc}
                  onClose={() => {
                    setExpandedId(null)
                    setExpandedDoc(null)
                  }}
                  onUpdate={handleUpdate}
                />
              )}

              {/* Checklist panel */}
              {checklistDocId === doc.id && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <ChecklistPanel document={doc} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        requirementId={requirementId}
        groupId={groupId}
        onGenerated={handleGenerated}
      />
    </div>
  )
}
