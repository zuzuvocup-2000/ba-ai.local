import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Save, Zap, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Spinner } from '../../components/ui/spinner'

// ── Roles editor ─────────────────────────────────────────────────────────────
function RolesEditor({ roles = [], onChange }) {
  const addRole = () => onChange([...roles, { name: '', description: '' }])

  const updateRole = (i, key, val) => {
    const next = [...roles]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  const removeRole = (i) => onChange(roles.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Vai trò / Quyền trong dự án
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={addRole}>
          <Plus size={13} /> Thêm vai trò
        </Button>
      </div>

      {roles.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400">
          Chưa có vai trò nào. Nhấn &quot;Thêm vai trò&quot; để bắt đầu.
        </p>
      )}

      <div className="space-y-2">
        {roles.map((role, i) => (
          <div
            key={i}
            className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white sm:w-36"
                placeholder="VD: admin"
                value={role.name}
                onChange={(e) => updateRole(i, 'name', e.target.value)}
              />
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                placeholder="Mô tả quyền hạn của vai trò này..."
                value={role.description}
                onChange={(e) => updateRole(i, 'description', e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRole(i)}
              className="mt-0.5 shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Common info fields ────────────────────────────────────────────────────────
const COMMON_INFO_FIELDS = [
  { key: 'tech_stack', label: 'Công nghệ sử dụng (Tech Stack)', placeholder: 'VD: Laravel 11, React 18, MySQL 8, Redis...' },
  { key: 'database', label: 'Cơ sở dữ liệu & cấu trúc chung', placeholder: 'VD: MySQL, chuẩn hóa 3NF, soft delete, timestamps...' },
  { key: 'naming', label: 'Quy ước đặt tên (Naming Conventions)', placeholder: 'VD: snake_case cho DB, camelCase cho JS, PascalCase cho class...' },
  { key: 'common_rules', label: 'Quy tắc nghiệp vụ chung', placeholder: 'VD: Mọi request phải có auth token, dữ liệu xóa dùng soft delete...' },
  { key: 'notes', label: 'Ghi chú / Thông tin bổ sung', placeholder: 'Bất kỳ thông tin nào cần AI biết khi gen tài liệu...' },
]

// ── Main Component ────────────────────────────────────────────────────────────
export function ProjectCommonInfoPanel({ project, onSaved, onDocGenerated }) {
  const session = getSession()

  const [roles, setRoles] = useState([])
  const [commonInfo, setCommonInfo] = useState({})
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [genError, setGenError] = useState('')
  const [generatedDoc, setGeneratedDoc] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  // Sync from project prop
  useEffect(() => {
    if (project) {
      setRoles(Array.isArray(project.roles) ? project.roles : [])
      setCommonInfo(project.common_info && typeof project.common_info === 'object' ? project.common_info : {})
    }
  }, [project?.id])

  const setInfoField = (key, val) => setCommonInfo((p) => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!project?.id || !session?.token) return
    setSaving(true)
    setSaveMsg('')
    try {
      await api.updateProjectCommonInfo(session.token, project.id, {
        roles,
        common_info: commonInfo,
      })
      setSaveMsg('Đã lưu thành công.')
      onSaved?.()
    } catch (err) {
      setSaveMsg(`Lỗi: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    if (!project?.id || !session?.token) return
    setGenerating(true)
    setGenError('')
    setGeneratedDoc(null)
    try {
      const doc = await api.generateCommonDoc(session.token, project.id)
      setGeneratedDoc(doc)
      onDocGenerated?.(doc)
    } catch (err) {
      setGenError(err.message ?? 'Sinh tài liệu thất bại')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Thông tin chung dự án</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Mô tả vai trò, công nghệ và quy tắc chung — AI sẽ dùng thông tin này khi sinh tài liệu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Roles */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <RolesEditor roles={roles} onChange={setRoles} />
          </div>

          {/* Common Info Fields */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Thông tin kỹ thuật & quy tắc chung
            </label>
            {COMMON_INFO_FIELDS.map((field) => (
              <Textarea
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={commonInfo[field.key] ?? ''}
                onChange={(e) => setInfoField(field.key, e.target.value)}
                rows={2}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" /> : <Save size={14} />}
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </Button>

            <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
              {generating ? <Spinner size="sm" /> : <Zap size={14} />}
              {generating ? 'Đang sinh tài liệu...' : 'Sinh tài liệu Common (AI)'}
            </Button>

            {saveMsg && (
              <span
                className={`text-sm ${saveMsg.startsWith('Lỗi') ? 'text-rose-600' : 'text-emerald-600'}`}
              >
                {saveMsg}
              </span>
            )}
          </div>

          {/* Generation error */}
          {genError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {genError}
            </div>
          )}

          {/* Generated doc preview */}
          {generatedDoc && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Tài liệu đã được sinh thành công!
                </span>
              </div>
              <p className="text-xs text-emerald-700">
                <span className="font-medium">{generatedDoc.title}</span> — trạng thái:{' '}
                <span className="capitalize">{generatedDoc.status}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Mở tab tài liệu để xem và chỉnh sửa nội dung được sinh ra.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
