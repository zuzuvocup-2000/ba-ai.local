import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, Lock } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Spinner } from '../../components/ui/spinner'

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'brd', label: 'BRD' },
  { key: 'flow_diagram', label: 'Flow Diagram' },
  { key: 'sql_logic', label: 'SQL Logic' },
  { key: 'business_rules', label: 'Business Rules' },
  { key: 'validation_rules', label: 'Validation Rules' },
  { key: 'test_cases', label: 'Test Cases' },
]

// Extended fields per tab type
const EXTENDED_FIELDS = {
  brd: [
    { key: 'scope', label: 'Phạm vi (Scope)' },
    { key: 'success_criteria', label: 'Tiêu chí thành công' },
    { key: 'assumptions', label: 'Giả định' },
    { key: 'constraints', label: 'Ràng buộc' },
  ],
  flow_diagram: [
    { key: 'diagram_description', label: 'Mô tả sơ đồ luồng' },
    { key: 'trigger', label: 'Trigger / Sự kiện khởi đầu' },
  ],
  sql_logic: [
    { key: 'tables_involved', label: 'Bảng dữ liệu liên quan' },
    { key: 'query_description', label: 'Mô tả truy vấn' },
    { key: 'indexes', label: 'Index cần thiết' },
  ],
  test_cases: [
    { key: 'test_approach', label: 'Phương án kiểm thử' },
    { key: 'test_environment', label: 'Môi trường test' },
  ],
}

// ── Dynamic list helper ──────────────────────────────────────────────────────
function DynamicList({ label, items = [], onChange, placeholder = 'Nhập nội dung...' }) {
  const addItem = () => onChange([...items, ''])
  const updateItem = (i, val) => {
    const next = [...items]
    next[i] = val
    onChange(next)
  }
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <GripVertical size={14} className="mt-2.5 shrink-0 text-slate-300" />
          <span className="mt-2 w-5 shrink-0 text-xs text-slate-400">{i + 1}.</span>
          <input
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="mt-1.5 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addItem}>
        <Plus size={13} /> Thêm dòng
      </Button>
    </div>
  )
}

// ── Data fields table ────────────────────────────────────────────────────────
function DataFieldsTable({ fields = [], onChange }) {
  const addRow = () =>
    onChange([...fields, { name: '', type: 'string', required: false, validation: '' }])

  const updateRow = (i, key, val) => {
    const next = [...fields]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  const removeRow = (i) => onChange(fields.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Trường dữ liệu</label>
      {fields.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th className="px-3 py-2 text-left font-medium">Tên trường</th>
                <th className="px-3 py-2 text-left font-medium">Kiểu dữ liệu</th>
                <th className="px-3 py-2 text-center font-medium">Bắt buộc</th>
                <th className="px-3 py-2 text-left font-medium">Validation</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-1.5">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                      value={row.name}
                      onChange={(e) => updateRow(i, 'name', e.target.value)}
                      placeholder="field_name"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                      value={row.type}
                      onChange={(e) => updateRow(i, 'type', e.target.value)}
                    >
                      {['string', 'number', 'boolean', 'date', 'datetime', 'email', 'enum', 'json', 'file'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={row.required ?? false}
                      onChange={(e) => updateRow(i, 'required', e.target.checked)}
                      className="accent-blue-600"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                      value={row.validation}
                      onChange={(e) => updateRow(i, 'validation', e.target.value)}
                      placeholder="max:255, email, ..."
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={addRow}>
        <Plus size={13} /> Thêm trường
      </Button>
    </div>
  )
}

// ── Empty analysis form structure ────────────────────────────────────────────
const emptyAnalysis = () => ({
  actors: [],
  preconditions: '',
  main_flow: [],
  alternative_flows: '',
  exception_flows: '',
  business_rules: [],
  data_fields: [],
  non_functional: '',
  notes: '',
  extended_data: {},
})

// ── Main AnalysisForm ────────────────────────────────────────────────────────
export function AnalysisForm({ requirementId, onSaved }) {
  const session = getSession()
  const [activeTab, setActiveTab] = useState('brd')
  const [analyses, setAnalyses] = useState({}) // { [type]: analysisData }
  const [loadingTab, setLoadingTab] = useState(false)
  const [savingTab, setSavingTab] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getCurrentForm = () => analyses[activeTab] ?? emptyAnalysis()

  const setCurrentForm = (updater) => {
    setAnalyses((prev) => ({
      ...prev,
      [activeTab]: typeof updater === 'function'
        ? updater(prev[activeTab] ?? emptyAnalysis())
        : updater,
    }))
  }

  const setField = (key, value) => setCurrentForm((p) => ({ ...p, [key]: value }))
  const setExtended = (key, value) =>
    setCurrentForm((p) => ({
      ...p,
      extended_data: { ...(p.extended_data ?? {}), [key]: value },
    }))

  // Load analysis for the current tab
  useEffect(() => {
    if (!requirementId || !session?.token) return
    setLoadingTab(true)
    setError('')
    api.getAnalysis(session.token, requirementId, activeTab)
      .then((data) => {
        const record = Array.isArray(data) ? data[0] : data
        if (record?.id) {
          setAnalyses((prev) => ({ ...prev, [activeTab]: { ...emptyAnalysis(), ...record } }))
        }
      })
      .catch(() => null)
      .finally(() => setLoadingTab(false))
  }, [activeTab, requirementId])

  const handleSave = async () => {
    setSavingTab(true)
    setError('')
    setSuccess('')
    const form = getCurrentForm()
    try {
      await api.upsertAnalysis(session.token, {
        ...form,
        requirement_id: requirementId,
        type: activeTab,
      })
      setSuccess('Đã lưu phân tích thành công.')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingTab(false)
    }
  }

  const form = getCurrentForm()
  const extendedFields = EXTENDED_FIELDS[activeTab] ?? []

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              'relative -mb-px px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            {tab.label}
            {analyses[tab.key]?.id && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-5 space-y-5">
        {loadingTab ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            {/* Actors */}
            <DynamicList
              label="Actors (người dùng / hệ thống tham gia)"
              items={form.actors ?? []}
              onChange={(val) => setField('actors', val)}
              placeholder="VD: Người dùng, Hệ thống thanh toán..."
            />

            {/* Preconditions */}
            <Textarea
              label="Điều kiện tiên quyết"
              value={form.preconditions ?? ''}
              onChange={(e) => setField('preconditions', e.target.value)}
              placeholder="Người dùng đã đăng nhập; Giỏ hàng không rỗng..."
              rows={3}
            />

            {/* Main flow */}
            <DynamicList
              label="Luồng chính (main flow)"
              items={form.main_flow ?? []}
              onChange={(val) => setField('main_flow', val)}
              placeholder="Bước: mô tả hành động..."
            />

            {/* Alternative flows */}
            <Textarea
              label="Luồng thay thế (alternative flows)"
              value={form.alternative_flows ?? ''}
              onChange={(e) => setField('alternative_flows', e.target.value)}
              rows={3}
            />

            {/* Exception flows */}
            <Textarea
              label="Luồng ngoại lệ (exception flows)"
              value={form.exception_flows ?? ''}
              onChange={(e) => setField('exception_flows', e.target.value)}
              rows={3}
            />

            {/* Business rules */}
            <DynamicList
              label="Quy tắc nghiệp vụ (business rules)"
              items={form.business_rules ?? []}
              onChange={(val) => setField('business_rules', val)}
              placeholder="VD: Mật khẩu phải tối thiểu 8 ký tự..."
            />

            {/* Data fields */}
            <DataFieldsTable
              fields={form.data_fields ?? []}
              onChange={(val) => setField('data_fields', val)}
            />

            {/* Non-functional */}
            <Textarea
              label="Yêu cầu phi chức năng"
              value={form.non_functional ?? ''}
              onChange={(e) => setField('non_functional', e.target.value)}
              rows={3}
              placeholder="Hiệu năng, bảo mật, khả năng mở rộng..."
            />

            {/* Extended fields per tab type */}
            {extendedFields.length > 0 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Trường mở rộng — {TABS.find((t) => t.key === activeTab)?.label}
                </p>
                {extendedFields.map((field) => (
                  <Textarea
                    key={field.key}
                    label={field.label}
                    value={form.extended_data?.[field.key] ?? ''}
                    onChange={(e) => setExtended(field.key, e.target.value)}
                    rows={2}
                  />
                ))}
              </div>
            )}

            {/* Notes */}
            <Textarea
              label="Ghi chú thêm"
              value={form.notes ?? ''}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
            />

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <Button onClick={handleSave} disabled={savingTab}>
                <Save size={14} />
                {savingTab ? 'Đang lưu...' : 'Lưu phân tích'}
              </Button>

              <div className="relative group">
                <Button variant="secondary" disabled className="cursor-not-allowed opacity-70">
                  <Lock size={13} />
                  Lưu & Tạo tài liệu →
                </Button>
                <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white group-hover:block">
                  Sẽ ra mắt ở Phase 2
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
