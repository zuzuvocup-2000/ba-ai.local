import { useState, useCallback } from 'react'
import { Zap, Layers } from 'lucide-react'
import api, { getSession } from '../../api'
import { Modal } from '../../components/ui/modal'
import { Button } from '../../components/ui/button'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'

const DOCUMENT_TYPES = [
  { value: 'brd', label: 'BRD (Tài liệu yêu cầu)' },
  { value: 'flow_diagram', label: 'Flow Diagram' },
  { value: 'sql_logic', label: 'SQL Logic' },
  { value: 'business_rules', label: 'Business Rules' },
  { value: 'validation_rules', label: 'Validation Rules' },
  { value: 'test_cases', label: 'Test Cases' },
  { value: 'checklist', label: 'Checklist' },
]

export function GenerateModal({ open, onClose, requirementId, groupId, onGenerated }) {
  const session = getSession()
  const [selectedType, setSelectedType] = useState('brd')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const handleGenerate = useCallback(async () => {
    if (!requirementId || !selectedType) return
    setGenerating(true)
    setGenerateError('')
    try {
      await api.generateDocument(session.token, requirementId, selectedType)
      showToast('Đã sinh tài liệu thành công', 'success')
      onGenerated?.()
    } catch (err) {
      setGenerateError(err.message ?? 'Sinh tài liệu thất bại')
    } finally {
      setGenerating(false)
    }
  }, [requirementId, selectedType, session?.token, onGenerated, showToast])

  const handleBulkGenerate = useCallback(async () => {
    if (!groupId) return
    setBulkGenerating(true)
    setBulkResult(null)
    try {
      const result = await api.bulkGenerateDocuments(session.token, groupId, null)
      setBulkResult(result)
      showToast(`Sinh hàng loạt hoàn tất: ${result.generated}/${result.total}`, 'success')
      onGenerated?.()
    } catch (err) {
      showToast(err.message ?? 'Sinh hàng loạt thất bại', 'error')
    } finally {
      setBulkGenerating(false)
    }
  }, [groupId, session?.token, onGenerated, showToast])

  return (
    <Modal open={open} onClose={onClose} title="Sinh tài liệu bằng AI" size="md">
      <Toast toast={toast} onClose={hideToast} />

      {/* Section 1: Single document generation */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Zap size={14} className="text-blue-500" />
            Sinh từng tài liệu
          </h3>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DOCUMENT_TYPES.map((type) => (
              <label
                key={type.value}
                className={[
                  'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                  selectedType === type.value
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="docType"
                  value={type.value}
                  checked={selectedType === type.value}
                  onChange={() => setSelectedType(type.value)}
                  className="accent-blue-600"
                />
                {type.label}
              </label>
            ))}
          </div>

          {generateError && (
            <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {generateError}
            </p>
          )}

          <div className="mt-3">
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full sm:w-auto"
            >
              {generating ? <Spinner size="sm" /> : <Zap size={14} />}
              {generating ? 'Đang sinh...' : 'Sinh tài liệu'}
            </Button>
          </div>
        </div>

        {/* Section 2: Bulk generation — only if groupId provided */}
        {groupId && (
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-500" />
              Sinh hàng loạt
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              Sinh tất cả loại tài liệu cho toàn bộ yêu cầu trong nhóm này.
            </p>

            {bulkResult && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {bulkResult.generated}/{bulkResult.total} tài liệu thành công
                {bulkResult.failed > 0 && (
                  <span className="ml-2 text-rose-600">({bulkResult.failed} thất bại)</span>
                )}
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleBulkGenerate}
              disabled={bulkGenerating}
            >
              {bulkGenerating ? <Spinner size="sm" /> : <Layers size={14} />}
              {bulkGenerating ? 'Đang sinh hàng loạt...' : 'Sinh tất cả tài liệu cho nhóm này'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
