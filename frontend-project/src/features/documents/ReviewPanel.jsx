import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft: {
    label: 'Nháp',
    bannerClass: 'bg-slate-50 border-slate-200 text-slate-700',
    badgeClass: 'bg-slate-100 text-slate-600',
    Icon: AlertCircle,
  },
  generated: {
    label: 'Đã sinh',
    bannerClass: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeClass: 'bg-blue-100 text-blue-700',
    Icon: AlertCircle,
  },
  under_review: {
    label: 'Đang review',
    bannerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    Icon: Clock,
  },
  approved: {
    label: 'Đã phê duyệt',
    bannerClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle,
  },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReviewHistoryList({ documentId }) {
  const session = getSession()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!documentId) return
    setLoading(true)
    api.listReviews(session?.token, documentId)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [documentId, session?.token])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <p className="py-3 text-xs text-slate-400 text-center">Chưa có lịch sử review.</p>
    )
  }

  const REVIEW_STATUS_LABELS = {
    approved: 'Phê duyệt',
    rejected: 'Từ chối',
    submitted: 'Gửi review',
    pending: 'Chờ duyệt',
  }

  const REVIEW_STATUS_COLORS = {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    submitted: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-2 pt-1">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${REVIEW_STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}
            >
              {REVIEW_STATUS_LABELS[r.status] ?? r.status}
            </span>
            {r.reviewer && (
              <span className="text-slate-600 font-medium">{r.reviewer}</span>
            )}
            {r.reviewed_at && (
              <span className="text-slate-400 ml-auto">{formatDate(r.reviewed_at)}</span>
            )}
          </div>
          {r.comment && (
            <p className="mt-1.5 text-slate-600 leading-relaxed">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export function ReviewPanel({ document, onDocumentUpdated }) {
  const session = getSession()
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const status = document?.status ?? 'draft'
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  const { Icon } = config

  // Reset reject UI when document status changes
  useEffect(() => {
    setShowRejectInput(false)
    setRejectComment('')
    setRejectError('')
  }, [status])

  const handleSubmitReview = useCallback(async () => {
    if (!document?.id) return
    setSubmitting(true)
    try {
      const updated = await api.submitReview(session?.token, document.id)
      showToast('Đã gửi yêu cầu review', 'success')
      onDocumentUpdated?.(updated)
    } catch (err) {
      showToast(err.message ?? 'Gửi review thất bại', 'error')
    } finally {
      setSubmitting(false)
    }
  }, [document?.id, session?.token, onDocumentUpdated, showToast])

  const handleApprove = useCallback(async () => {
    if (!document?.id) return
    setApproving(true)
    try {
      const updated = await api.approveDocument(session?.token, document.id, {})
      showToast('Đã phê duyệt tài liệu', 'success')
      onDocumentUpdated?.(updated)
    } catch (err) {
      showToast(err.message ?? 'Phê duyệt thất bại', 'error')
    } finally {
      setApproving(false)
    }
  }, [document?.id, session?.token, onDocumentUpdated, showToast])

  const handleReject = useCallback(async () => {
    if (!rejectComment.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối')
      return
    }
    setRejectError('')
    setRejecting(true)
    try {
      const updated = await api.rejectDocument(session?.token, document.id, {
        comment: rejectComment.trim(),
      })
      showToast('Đã từ chối tài liệu', 'success')
      setShowRejectInput(false)
      setRejectComment('')
      onDocumentUpdated?.(updated)
    } catch (err) {
      showToast(err.message ?? 'Từ chối thất bại', 'error')
    } finally {
      setRejecting(false)
    }
  }, [document?.id, rejectComment, session?.token, onDocumentUpdated, showToast])

  if (!document) return null

  return (
    <div className="border-b border-slate-100">
      <Toast toast={toast} onClose={hideToast} />

      {/* Status banner */}
      <div className={`flex flex-wrap items-center gap-3 border-b px-4 py-2.5 ${config.bannerClass}`}>
        <Icon size={14} className="shrink-0" />
        <span className="text-sm font-medium">{config.label}</span>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* draft or generated → submit for review */}
          {(status === 'draft' || status === 'generated') && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : <Send size={12} />}
              Gửi Review
            </Button>
          )}

          {/* under_review → approve / reject */}
          {status === 'under_review' && !showRejectInput && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={handleApprove}
                disabled={approving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {approving ? <Spinner size="sm" /> : <CheckCircle size={12} />}
                Phê duyệt
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowRejectInput(true)}
              >
                Từ chối
              </Button>
            </>
          )}

          {/* approved */}
          {status === 'approved' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle size={12} /> Đã phê duyệt ✓
            </span>
          )}
        </div>
      </div>

      {/* Inline reject input */}
      {showRejectInput && (
        <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-rose-700">Lý do từ chối</p>
          <Textarea
            placeholder="Nhập lý do từ chối tài liệu này..."
            value={rejectComment}
            onChange={(e) => {
              setRejectComment(e.target.value)
              if (e.target.value.trim()) setRejectError('')
            }}
            rows={3}
            error={rejectError}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={handleReject}
              disabled={rejecting}
            >
              {rejecting ? <Spinner size="sm" /> : null}
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
              disabled={rejecting}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Collapsible review history */}
      <div>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          Lịch sử review
        </button>

        {showHistory && (
          <div className="border-t border-slate-100 px-4 pb-3">
            <ReviewHistoryList documentId={document.id} />
          </div>
        )}
      </div>
    </div>
  )
}
