import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, FileText, AlertCircle, Filter } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select } from '../../components/ui/select'
import { PageSpinner } from '../../components/ui/spinner'
import { EmptyState } from '../../components/ui/empty-state'
import { Toast, useToast } from '../../components/ui/toast'
import { RequirementFormModal } from './RequirementFormModal'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'review', label: 'Đang review' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'done', label: 'Hoàn thành' },
]

export function RequirementsList({ projectId, group, groups = [] }) {
  const navigate = useNavigate()
  const { projectId: paramProjectId } = useParams()
  const resolvedProjectId = projectId ?? Number(paramProjectId)
  const session = getSession()
  const { toast, showToast, hideToast } = useToast()

  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReq, setEditingReq] = useState(null)

  const loadRequirements = useCallback(async () => {
    if (!session?.token || !resolvedProjectId) return
    setLoading(true)
    setError('')
    try {
      const filters = {}
      if (group?.id) filters.group_id = group.id
      if (statusFilter) filters.status = statusFilter
      const data = await api.getRequirements(session.token, resolvedProjectId, filters)
      setRequirements(Array.isArray(data) ? data : (data.requirements ?? []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [resolvedProjectId, group?.id, statusFilter, session?.token])

  useEffect(() => { loadRequirements() }, [loadRequirements])

  const handleAdd = () => { setEditingReq(null); setModalOpen(true) }
  const handleEdit = (req) => { setEditingReq(req); setModalOpen(true) }

  const handleDelete = async (req) => {
    if (!window.confirm(`Xóa yêu cầu "${req.title}"?`)) return
    try {
      await api.deleteRequirement(session.token, req.id)
      showToast('Đã xóa yêu cầu', 'success')
      loadRequirements()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSave = async (formData) => {
    const payload = { ...formData, project_id: resolvedProjectId }
    if (editingReq) {
      await api.updateRequirement(session.token, editingReq.id, payload)
      showToast('Đã cập nhật yêu cầu', 'success')
    } else {
      await api.createRequirement(session.token, payload)
      showToast('Đã thêm yêu cầu mới', 'success')
    }
    loadRequirements()
  }

  const handleView = (req) => {
    navigate(`/projects/${resolvedProjectId}/requirements/${req.id}`)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div>
          {group ? (
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: group.color ?? '#94a3b8' }}
              />
              <h2 className="font-semibold text-slate-900">{group.name}</h2>
              {group.prefix && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                  {group.prefix}
                </span>
              )}
            </div>
          ) : (
            <h2 className="font-semibold text-slate-900">Tất cả yêu cầu</h2>
          )}
          <p className="text-xs text-slate-500">
            {loading ? 'Đang tải...' : `${requirements.length} yêu cầu`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTER_OPTIONS}
              className="h-8 w-40 text-xs"
            />
          </div>
          <Button size="sm" onClick={handleAdd}>
            <Plus size={14} /> Thêm yêu cầu
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading && <PageSpinner />}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && requirements.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Chưa có yêu cầu nào"
            description={group ? `Nhóm "${group.name}" chưa có yêu cầu nào.` : 'Chưa có yêu cầu nào trong dự án.'}
            action={
              <Button size="sm" onClick={handleAdd}>
                <Plus size={14} /> Thêm yêu cầu đầu tiên
              </Button>
            }
          />
        )}

        {!loading && !error && requirements.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Mã / Tiêu đề</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ưu tiên</th>
                  <th className="px-4 py-3">Tài liệu</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        {req.code && (
                          <span className="mb-0.5 block font-mono text-xs text-slate-400">
                            {req.code}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleView(req)}
                          className="text-left font-medium text-slate-800 hover:text-blue-700 hover:underline"
                        >
                          {req.title}
                        </button>
                        {req.tags && req.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(Array.isArray(req.tags) ? req.tags : req.tags.split(',')).map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-500"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {req.documents_count ?? req.analyses_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(req)}
                          title="Xem chi tiết"
                        >
                          <Eye size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(req)}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(req)}
                          title="Xóa"
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RequirementFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingReq(null) }}
        onSave={handleSave}
        requirement={editingReq}
        group={group}
        groups={groups}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
