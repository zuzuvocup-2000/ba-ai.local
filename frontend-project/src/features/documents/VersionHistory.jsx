import { useState, useEffect, useCallback } from 'react'
import { History, RotateCcw } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${min}`
}

const CHANGE_TYPE_CONFIG = {
  initial: { label: 'Khởi tạo', cls: 'bg-blue-100 text-blue-700' },
  ai_regenerated: { label: 'AI tạo lại', cls: 'bg-purple-100 text-purple-700' },
  manual_edit: { label: 'Sửa thủ công', cls: 'bg-slate-100 text-slate-600' },
  restored: { label: 'Khôi phục', cls: 'bg-orange-100 text-orange-700' },
}

function getChangeTypeCfg(type) {
  return CHANGE_TYPE_CONFIG[type] ?? { label: type, cls: 'bg-slate-100 text-slate-500' }
}

// ── Simple diff ───────────────────────────────────────────────────────────────

function simpleDiff(oldText, newText) {
  const oldLines = (oldText ?? '').split('\n')
  const newLines = (newText ?? '').split('\n')
  const result = []

  const oldSet = new Set(oldLines)
  const newSet = new Set(newLines)

  oldLines.forEach((line) => {
    if (newSet.has(line)) {
      result.push({ type: 'unchanged', text: line })
    } else {
      result.push({ type: 'removed', text: line })
    }
  })

  newLines.forEach((line) => {
    if (!oldSet.has(line)) {
      result.push({ type: 'added', text: line })
    }
  })

  return result
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VersionListItem({ version, selected, onClick }) {
  const cfg = getChangeTypeCfg(version.change_type)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
        selected
          ? 'border-blue-300 bg-blue-50'
          : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="rounded-full bg-slate-700 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
          v{version.version_number}
        </span>
        <span className={`rounded-full text-[10px] font-semibold px-1.5 py-0.5 leading-none ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>
      {version.change_summary && (
        <p className="text-xs text-slate-700 leading-snug truncate">{version.change_summary}</p>
      )}
      <p className="text-[10px] text-slate-400 mt-0.5">
        {version.created_by ?? '—'} · {formatDate(version.created_at)}
      </p>
    </button>
  )
}

function DiffView({ versionContent, currentContent }) {
  const lines = simpleDiff(versionContent ?? '', currentContent ?? '')
  return (
    <div className="overflow-auto max-h-[50vh] rounded-lg border border-slate-200 bg-white text-xs font-mono">
      {lines.map((line, idx) => {
        if (line.type === 'removed') {
          return (
            <div key={idx} className="flex gap-2 px-3 py-0.5 bg-red-50 text-red-700">
              <span className="select-none opacity-60 w-3 shrink-0">−</span>
              <span className="whitespace-pre-wrap break-all">{line.text}</span>
            </div>
          )
        }
        if (line.type === 'added') {
          return (
            <div key={idx} className="flex gap-2 px-3 py-0.5 bg-green-50 text-green-700">
              <span className="select-none opacity-60 w-3 shrink-0">+</span>
              <span className="whitespace-pre-wrap break-all">{line.text}</span>
            </div>
          )
        }
        return (
          <div key={idx} className="flex gap-2 px-3 py-0.5 text-slate-600">
            <span className="select-none opacity-0 w-3 shrink-0"> </span>
            <span className="whitespace-pre-wrap break-all">{line.text}</span>
          </div>
        )
      })}
      {lines.length === 0 && (
        <p className="px-3 py-4 text-slate-400 text-center">Không có sự thay đổi nào.</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function VersionHistory({ documentId, currentContent, onRestored }) {
  const session = getSession()

  const [versions, setVersions] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState(null)

  const [selectedVersion, setSelectedVersion] = useState(null) // version summary object
  const [versionContent, setVersionContent] = useState(null)   // full version with content
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [activeTab, setActiveTab] = useState('content') // 'content' | 'diff'

  const [restoring, setRestoring] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  const { toast, showToast, hideToast } = useToast()

  // Load version list
  useEffect(() => {
    if (!documentId) return
    setLoadingList(true)
    setListError(null)
    api.listVersions(session?.token, documentId)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        // Sort descending by version_number
        list.sort((a, b) => b.version_number - a.version_number)
        setVersions(list)
      })
      .catch((err) => setListError(err.message ?? 'Không tải được lịch sử phiên bản'))
      .finally(() => setLoadingList(false))
  }, [documentId, session?.token])

  // Load version detail when selection changes
  const handleSelectVersion = useCallback(async (v) => {
    setSelectedVersion(v)
    setActiveTab('content')
    setConfirmRestore(false)
    if (versionContent?.version_number === v.version_number) return
    setLoadingDetail(true)
    setVersionContent(null)
    try {
      const detail = await api.getVersion(session?.token, documentId, v.version_number)
      setVersionContent(detail)
    } catch (err) {
      showToast(err.message ?? 'Không tải được nội dung phiên bản', 'error')
    } finally {
      setLoadingDetail(false)
    }
  }, [documentId, session?.token, versionContent, showToast])

  const handleRestore = useCallback(async () => {
    if (!selectedVersion) return
    setRestoring(true)
    try {
      const updated = await api.restoreVersion(session?.token, documentId, selectedVersion.version_number)
      showToast(`Đã khôi phục về phiên bản v${selectedVersion.version_number}`, 'success')
      setConfirmRestore(false)
      onRestored?.(updated)
      // Reload version list after restore
      const list = await api.listVersions(session?.token, documentId)
      const sorted = (Array.isArray(list) ? list : []).sort((a, b) => b.version_number - a.version_number)
      setVersions(sorted)
    } catch (err) {
      showToast(err.message ?? 'Khôi phục thất bại', 'error')
    } finally {
      setRestoring(false)
    }
  }, [selectedVersion, documentId, session?.token, onRestored, showToast])

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Toast toast={toast} onClose={hideToast} />

      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50">
        <History size={14} className="text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Lịch sử phiên bản</span>
        {loadingList && <Spinner size="sm" />}
      </div>

      <div className="flex min-h-[300px]">
        {/* ── Left panel: version list (30%) ── */}
        <div className="w-[30%] shrink-0 border-r border-slate-100 overflow-y-auto max-h-[70vh] p-2 space-y-1">
          {loadingList ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : listError ? (
            <p className="text-xs text-red-500 px-2 py-4">{listError}</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-slate-400 px-2 py-4 text-center">Chưa có phiên bản nào.</p>
          ) : (
            versions.map((v) => (
              <VersionListItem
                key={v.id}
                version={v}
                selected={selectedVersion?.id === v.id}
                onClick={() => handleSelectVersion(v)}
              />
            ))
          )}
        </div>

        {/* ── Right panel: version detail (70%) ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedVersion ? (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400 py-12">
              Chọn phiên bản để xem nội dung
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white">
                <span className="text-sm font-semibold text-slate-700">
                  Phiên bản v{selectedVersion.version_number}
                </span>
                {selectedVersion.change_summary && (
                  <span className="text-xs text-slate-500 truncate">{selectedVersion.change_summary}</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {!confirmRestore ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirmRestore(true)}
                      disabled={restoring || loadingDetail}
                    >
                      <RotateCcw size={12} /> Khôi phục phiên bản này
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Xác nhận khôi phục?</span>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={restoring}
                        onClick={handleRestore}
                        disabled={restoring}
                      >
                        {restoring ? <Spinner size="sm" /> : null} Xác nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmRestore(false)}
                        disabled={restoring}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 border-b border-slate-100 px-4 bg-white">
                {['content', 'diff'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'content' ? 'Nội dung' : 'So sánh'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto p-4">
                {loadingDetail ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : activeTab === 'content' ? (
                  <pre className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 rounded-lg p-3 max-h-[50vh] overflow-auto">
                    {versionContent?.content ?? ''}
                  </pre>
                ) : (
                  <DiffView
                    versionContent={versionContent?.content ?? ''}
                    currentContent={currentContent ?? ''}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
