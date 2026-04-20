import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, FolderTree, AlertCircle } from 'lucide-react'
import api, { getSession } from '../../api'
import { AppLayout } from '../../layout/AppLayout'
import { Button } from '../../components/ui/button'
import { PageSpinner } from '../../components/ui/spinner'
import { EmptyState } from '../../components/ui/empty-state'
import { Toast, useToast } from '../../components/ui/toast'
import { GroupTree } from './GroupTree'
import { GroupFormModal } from './GroupFormModal'
import { RequirementsList } from '../requirements/RequirementsList'
import { ProjectOverview } from '../projects/ProjectOverview'

export function GroupsPage() {
  const { projectId, groupId } = useParams()
  const navigate = useNavigate()
  const session = getSession()
  const { toast, showToast, hideToast } = useToast()

  const [project, setProject] = useState(null)
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groupsError, setGroupsError] = useState('')

  // Selected group from URL param or click
  const [selectedGroupId, setSelectedGroupId] = useState(groupId ? Number(groupId) : null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [defaultParent, setDefaultParent] = useState(null)

  const loadGroups = useCallback(async () => {
    if (!session?.token || !projectId) return
    setLoadingGroups(true)
    setGroupsError('')
    try {
      const data = await api.getGroups(session.token, projectId)
      setGroups(Array.isArray(data) ? data : (data.groups ?? []))
    } catch (err) {
      setGroupsError(err.message)
    } finally {
      setLoadingGroups(false)
    }
  }, [projectId, session?.token])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Load full project info (includes roles + common_info)
  useEffect(() => {
    if (!session?.token || !projectId) return
    api.getProject(session.token, projectId)
      .then((p) => setProject(p ?? null))
      .catch(() => {
        // Fallback: load from list
        api.getProjects(session.token)
          .then((list) => setProject(list.find((p) => String(p.id) === String(projectId)) ?? null))
          .catch(() => null)
      })
  }, [projectId, session?.token])

  const handleSelect = (group) => {
    setSelectedGroupId(group.id)
    navigate(`/projects/${projectId}/groups/${group.id}`, { replace: true })
  }

  const handleAdd = (parentGroup = null) => {
    setEditingGroup(null)
    setDefaultParent(parentGroup)
    setModalOpen(true)
  }

  const handleEdit = (group) => {
    setEditingGroup(group)
    setDefaultParent(null)
    setModalOpen(true)
  }

  const handleDelete = async (group) => {
    if (!window.confirm(`Xóa nhóm "${group.name}"? Thao tác này không thể hoàn tác.`)) return
    try {
      await api.deleteGroup(session.token, group.id)
      showToast(`Đã xóa nhóm "${group.name}"`, 'success')
      if (selectedGroupId === group.id) setSelectedGroupId(null)
      loadGroups()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSave = async (formData) => {
    if (editingGroup) {
      await api.updateGroup(session.token, editingGroup.id, formData)
      showToast('Đã cập nhật nhóm', 'success')
    } else {
      await api.createGroup(session.token, formData)
      showToast('Đã thêm nhóm mới', 'success')
    }
    loadGroups()
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  const breadcrumbs = [
    { label: 'Dự án', href: '/projects' },
    { label: project?.name ?? `Dự án #${projectId}`, href: `/projects/${projectId}/groups` },
    selectedGroup ? { label: selectedGroup.name } : { label: 'Nhóm tính năng' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nhóm tính năng
            </span>
            <Button size="sm" variant="ghost" onClick={() => handleAdd(null)} title="Thêm nhóm gốc">
              <Plus size={14} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-1">
            {loadingGroups && (
              <div className="flex justify-center py-8">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
            {!loadingGroups && groupsError && (
              <div className="px-2 py-4 text-xs text-rose-600">
                <AlertCircle size={12} className="inline mr-1" />
                {groupsError}
              </div>
            )}
            {!loadingGroups && !groupsError && groups.length === 0 && (
              <EmptyState
                icon={FolderTree}
                title="Chưa có nhóm nào"
                description='Nhấn "+" để thêm nhóm tính năng.'
                className="py-8 text-xs"
              />
            )}
            {!loadingGroups && groups.length > 0 && (
              <GroupTree
                groups={groups}
                selectedId={selectedGroupId}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
              />
            )}
          </div>

          {/* Project info footer */}
          {project && (
            <div className="border-t border-slate-100 px-3 py-2">
              <p className="truncate text-xs font-medium text-slate-600">{project.name}</p>
              {project.code && (
                <p className="font-mono text-[10px] text-slate-400">{project.code}</p>
              )}
            </div>
          )}
        </aside>

        {/* ── Main content ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {!selectedGroupId ? (
            <ProjectOverview
              project={project}
              onSaved={() => {
                if (session?.token && projectId) {
                  api.getProject(session.token, projectId)
                    .then((p) => setProject(p ?? null))
                    .catch(() => null)
                }
                showToast('Đã lưu thông tin dự án', 'success')
              }}
              onDocGenerated={(doc) => {
                showToast(`Đã sinh tài liệu: ${doc.title}`, 'success')
              }}
            />
          ) : (
            <RequirementsList
              projectId={Number(projectId)}
              group={selectedGroup}
              groups={groups}
              project={project}
            />
          )}
        </main>
      </div>

      <GroupFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingGroup(null); setDefaultParent(null) }}
        onSave={handleSave}
        group={editingGroup}
        groups={groups}
        projectId={Number(projectId)}
        defaultParent={defaultParent}
      />

      <Toast toast={toast} onClose={hideToast} />
    </AppLayout>
  )
}
