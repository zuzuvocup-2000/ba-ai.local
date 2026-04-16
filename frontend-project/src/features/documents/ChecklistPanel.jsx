import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Spinner } from '../../components/ui/spinner'
import { EmptyState } from '../../components/ui/empty-state'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'

// ── Dev status config ──────────────────────────────────────────────────────────
const DEV_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Chưa làm' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'dev_done', label: 'Hoàn thành' },
]

const DEV_STATUS_COLORS = {
  not_started: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-blue-100 text-blue-700',
  dev_done: 'bg-emerald-100 text-emerald-700',
}

// ── Review status config ───────────────────────────────────────────────────────
const REVIEW_STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

const REVIEW_STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-500',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

// ── Category badge colors (cycle through a few) ────────────────────────────────
const CATEGORY_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
]

function categoryColor(category) {
  let hash = 0
  for (let i = 0; i < (category ?? '').length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) & 0xffff
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full bg-slate-200 h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium text-slate-600 tabular-nums">
        {value}/{max} ({pct}%)
      </span>
    </div>
  )
}

// ── Proof fields (for dev_done items) ─────────────────────────────────────────
function ProofFields({ proof = [], onChange }) {
  const PROOF_KEYS = [
    { key: 'commit_url', label: 'Commit URL' },
    { key: 'pr_url', label: 'PR URL' },
    { key: 'file_path', label: 'File path' },
  ]

  const getVal = (key) => proof.find((p) => p.key === key)?.value ?? ''
  const setVal = (key, value) => {
    const next = proof.filter((p) => p.key !== key)
    if (value) next.push({ key, value })
    onChange(next)
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Bằng chứng hoàn thành
      </p>
      {PROOF_KEYS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <label className="w-24 shrink-0 text-xs text-slate-500">{label}</label>
          <input
            type="text"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            placeholder={label}
            value={getVal(key)}
            onChange={(e) => setVal(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

// ── Inline comment list ────────────────────────────────────────────────────────
function CommentList({ comments = [] }) {
  if (!comments.length) return null
  const TYPE_LABELS = { note: 'Ghi chú', question: 'Câu hỏi', rejection: 'Từ chối' }
  const TYPE_COLORS = {
    note: 'bg-slate-100 text-slate-600',
    question: 'bg-blue-100 text-blue-700',
    rejection: 'bg-rose-100 text-rose-700',
  }
  return (
    <div className="mt-2 space-y-1.5">
      {comments.map((c, idx) => (
        <div key={idx} className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${TYPE_COLORS[c.type] ?? TYPE_COLORS.note}`}
          >
            {TYPE_LABELS[c.type] ?? c.type}
          </span>
          <span className="text-slate-700 leading-relaxed">{c.comment}</span>
        </div>
      ))}
    </div>
  )
}

// ── Single checklist item card ─────────────────────────────────────────────────
function ChecklistItemCard({ item, onUpdated, showToast }) {
  const session = getSession()
  const [expanded, setExpanded] = useState(false)
  const [devStatus, setDevStatus] = useState(item.dev_status ?? 'not_started')
  const [proof, setProof] = useState(Array.isArray(item.dev_proof) ? item.dev_proof : [])
  const [savingDev, setSavingDev] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentType, setCommentType] = useState('note')
  const [addingComment, setAddingComment] = useState(false)

  const handleDevStatusChange = useCallback(async (newStatus) => {
    setDevStatus(newStatus)
    setSavingDev(true)
    try {
      const updated = await api.updateChecklistItem(session?.token, item.id, {
        dev_status: newStatus,
        dev_proof: proof,
      })
      onUpdated?.(updated)
    } catch (err) {
      showToast?.(err.message ?? 'Cập nhật thất bại', 'error')
      setDevStatus(item.dev_status ?? 'not_started') // revert
    } finally {
      setSavingDev(false)
    }
  }, [item.id, item.dev_status, proof, session?.token, onUpdated, showToast])

  const handleSaveProof = useCallback(async () => {
    setSavingDev(true)
    try {
      const updated = await api.updateChecklistItem(session?.token, item.id, {
        dev_status: devStatus,
        dev_proof: proof,
      })
      showToast?.('Đã lưu bằng chứng', 'success')
      onUpdated?.(updated)
    } catch (err) {
      showToast?.(err.message ?? 'Lưu thất bại', 'error')
    } finally {
      setSavingDev(false)
    }
  }, [item.id, devStatus, proof, session?.token, onUpdated, showToast])

  const handleApproveItem = useCallback(async () => {
    setReviewing(true)
    try {
      const updated = await api.reviewChecklistItem(session?.token, item.id, {
        review_status: 'approved',
      })
      showToast?.('Đã chấp nhận', 'success')
      onUpdated?.(updated)
    } catch (err) {
      showToast?.(err.message ?? 'Thao tác thất bại', 'error')
    } finally {
      setReviewing(false)
    }
  }, [item.id, session?.token, onUpdated, showToast])

  const handleRejectItem = useCallback(async () => {
    if (!rejectComment.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối')
      return
    }
    setRejectError('')
    setReviewing(true)
    try {
      const updated = await api.reviewChecklistItem(session?.token, item.id, {
        review_status: 'rejected',
        comment: rejectComment.trim(),
      })
      showToast?.('Đã từ chối item', 'success')
      setShowRejectInput(false)
      setRejectComment('')
      onUpdated?.(updated)
    } catch (err) {
      showToast?.(err.message ?? 'Thao tác thất bại', 'error')
    } finally {
      setReviewing(false)
    }
  }, [item.id, rejectComment, session?.token, onUpdated, showToast])

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return
    setAddingComment(true)
    try {
      await api.addChecklistComment(session?.token, item.id, {
        comment: commentText.trim(),
        type: commentType,
      })
      showToast?.('Đã thêm nhận xét', 'success')
      setCommentText('')
    } catch (err) {
      showToast?.(err.message ?? 'Thêm nhận xét thất bại', 'error')
    } finally {
      setAddingComment(false)
    }
  }, [item.id, commentText, commentType, session?.token, showToast])

  const reviewStatus = item.review_status ?? 'pending'

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Item header row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {/* Code badge */}
        {item.code && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-600">
            {item.code}
          </span>
        )}

        {/* Category badge */}
        {item.category && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor(item.category)}`}
          >
            {item.category}
          </span>
        )}

        {/* Title */}
        <span className="flex-1 min-w-0 text-sm font-medium text-slate-800 truncate">
          {item.title}
        </span>

        {/* Dev status selector */}
        <div className="flex items-center gap-1.5">
          {savingDev && <Spinner size="sm" />}
          <select
            className={`rounded-lg border-0 px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer ${DEV_STATUS_COLORS[devStatus] ?? 'bg-slate-100 text-slate-600'}`}
            value={devStatus}
            onChange={(e) => handleDevStatusChange(e.target.value)}
            disabled={savingDev}
          >
            {DEV_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Review status badge */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${REVIEW_STATUS_COLORS[reviewStatus] ?? 'bg-slate-100 text-slate-500'}`}
        >
          {REVIEW_STATUS_LABELS[reviewStatus] ?? reviewStatus}
        </span>

        {/* Expand toggle */}
        <button
          type="button"
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3 bg-slate-50">
          {/* Description */}
          {item.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Mô tả</p>
              <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Doc section ref */}
          {item.doc_section_ref && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Tham chiếu phần tài liệu</p>
              <p className="text-xs text-slate-600 font-mono">{item.doc_section_ref}</p>
            </div>
          )}

          {/* Proof fields (only when dev_done) */}
          {devStatus === 'dev_done' && (
            <div>
              <ProofFields proof={proof} onChange={setProof} />
              <div className="mt-2">
                <Button size="sm" variant="secondary" onClick={handleSaveProof} disabled={savingDev}>
                  {savingDev ? <Spinner size="sm" /> : null}
                  Lưu bằng chứng
                </Button>
              </div>
            </div>
          )}

          {/* BA review actions */}
          {reviewStatus !== 'approved' && !showRejectInput && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleApproveItem}
                disabled={reviewing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {reviewing ? <Spinner size="sm" /> : <CheckCircle size={12} />}
                Chấp nhận
              </Button>
              {reviewStatus !== 'rejected' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowRejectInput(true)}
                  disabled={reviewing}
                >
                  <XCircle size={12} /> Từ chối
                </Button>
              )}
            </div>
          )}

          {/* Inline reject input for item */}
          {showRejectInput && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-rose-700">Lý do từ chối</p>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectComment}
                onChange={(e) => {
                  setRejectComment(e.target.value)
                  if (e.target.value.trim()) setRejectError('')
                }}
                rows={2}
                error={rejectError}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleRejectItem}
                  disabled={reviewing}
                >
                  {reviewing ? <Spinner size="sm" /> : null}
                  Xác nhận từ chối
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowRejectInput(false)
                    setRejectComment('')
                    setRejectError('')
                  }}
                  disabled={reviewing}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Existing comments */}
          <CommentList comments={item.comments ?? []} />

          {/* Add comment */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">Thêm nhận xét</p>
            <div className="flex gap-2 items-start">
              <select
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
              >
                <option value="note">Ghi chú</option>
                <option value="question">Câu hỏi</option>
                <option value="rejection">Từ chối</option>
              </select>
              <input
                type="text"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nhập nhận xét..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddComment}
                disabled={addingComment || !commentText.trim()}
              >
                {addingComment ? <Spinner size="sm" /> : 'Gửi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ChecklistPanel ────────────────────────────────────────────────────────
export function ChecklistPanel({ document }) {
  const session = getSession()
  const [checklist, setChecklist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const fetchChecklist = useCallback(async () => {
    if (!document?.id) return
    setLoading(true)
    try {
      const data = await api.getChecklist(session?.token, document.id)
      setChecklist(data)
    } catch {
      setChecklist(null)
    } finally {
      setLoading(false)
    }
  }, [document?.id, session?.token])

  useEffect(() => {
    fetchChecklist()
  }, [fetchChecklist])

  const handleGenerate = useCallback(async () => {
    if (!document?.id) return
    setGenerating(true)
    try {
      const data = await api.generateChecklist(session?.token, document.id)
      setChecklist(data)
      showToast('Đã sinh checklist', 'success')
    } catch (err) {
      showToast(err.message ?? 'Sinh checklist thất bại', 'error')
    } finally {
      setGenerating(false)
    }
  }, [document?.id, session?.token, showToast])

  const handleItemUpdated = useCallback((updatedItem) => {
    setChecklist((prev) => {
      if (!prev) return prev
      const items = prev.items.map((it) =>
        it.id === updatedItem.id ? { ...it, ...updatedItem } : it
      )
      const verified = items.filter((it) => it.review_status === 'approved').length
      return { ...prev, items, verified_items: verified }
    })
  }, [])

  return (
    <div className="space-y-4">
      <Toast toast={toast} onClose={hideToast} />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <CheckSquare size={15} className="text-slate-500" />
          Checklist
        </h3>

        {checklist && (
          <div className="flex-1 min-w-[180px]">
            <ProgressBar
              value={checklist.verified_items ?? 0}
              max={checklist.total_items ?? checklist.items?.length ?? 0}
            />
          </div>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={handleGenerate}
          disabled={generating || loading}
          className="ml-auto"
        >
          {generating ? <Spinner size="sm" /> : <RefreshCw size={12} />}
          Sinh Checklist
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && !checklist && (
        <EmptyState
          icon={CheckSquare}
          title="Chưa có checklist"
          description="Nhấn Sinh Checklist để tạo checklist bằng AI"
        />
      )}

      {/* Items */}
      {!loading && checklist && checklist.items?.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title="Checklist trống"
          description="Không có mục nào trong checklist này"
        />
      )}

      {!loading && checklist && checklist.items?.length > 0 && (
        <div className="space-y-2">
          {checklist.items.map((item) => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              onUpdated={handleItemUpdated}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  )
}
