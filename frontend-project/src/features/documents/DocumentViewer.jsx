import { useState, useCallback } from 'react'
import { X, Edit2, Save, XCircle } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Spinner } from '../../components/ui/spinner'
import { useToast } from '../../components/ui/toast'
import { Toast } from '../../components/ui/toast'
import { Badge } from '../../components/ui/badge'

const TYPE_LABELS = {
  brd: 'BRD',
  flow_diagram: 'Flow Diagram',
  sql_logic: 'SQL Logic',
  business_rules: 'Business Rules',
  validation_rules: 'Validation Rules',
  test_cases: 'Test Cases',
  checklist: 'Checklist',
}

const DOC_STATUS_LABELS = {
  draft: 'Nháp',
  generating: 'Đang sinh...',
  generated: 'Đã sinh',
  approved: 'Đã duyệt',
}

const DOC_STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  generating: 'bg-yellow-100 text-yellow-700',
  generated: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
}

function renderMarkdown(content) {
  if (!content) return ''

  const lines = content.split('\n')
  let html = ''
  let inCodeBlock = false
  let codeLines = []
  let inList = false

  const escapeHtml = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const inlineFormat = (text) => {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    return text
  }

  const closeList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-2 font-mono">${escapeHtml(codeLines.join('\n'))}</pre>`
        codeLines = []
        inCodeBlock = false
      } else {
        closeList()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      closeList()
      html += `<h3 class="text-lg font-medium mt-2 mb-1">${inlineFormat(escapeHtml(line.slice(4)))}</h3>`
      continue
    }
    if (line.startsWith('## ')) {
      closeList()
      html += `<h2 class="text-xl font-semibold mt-3 mb-1">${inlineFormat(escapeHtml(line.slice(3)))}</h2>`
      continue
    }
    if (line.startsWith('# ')) {
      closeList()
      html += `<h1 class="text-2xl font-bold mt-4 mb-2">${inlineFormat(escapeHtml(line.slice(2)))}</h1>`
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      closeList()
      html += '<hr class="my-3 border-slate-200" />'
      continue
    }

    // Table row
    if (line.startsWith('|')) {
      closeList()
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      const isHeader = lines[i + 1]?.match(/^\|[-| :]+\|/)
      if (isHeader) {
        html += `<tr class="bg-slate-50">${cells.map((c) => `<th class="border border-slate-200 px-3 py-1.5 text-left text-sm font-semibold">${inlineFormat(escapeHtml(c.trim()))}</th>`).join('')}</tr>`
        i++ // skip separator line
        if (!html.includes('<table')) {
          html = html.replace('<tr', '<table class="w-full border-collapse my-2 text-sm"><thead><tr')
        }
      } else {
        // Check if we just closed a thead
        if (!html.endsWith('</thead><tbody>') && html.includes('</th></tr>') && !html.includes('<tbody>')) {
          html += '</thead><tbody>'
        }
        html += `<tr class="hover:bg-slate-50">${cells.map((c) => `<td class="border border-slate-200 px-3 py-1.5 text-sm">${inlineFormat(escapeHtml(c.trim()))}</td>`).join('')}</tr>`
      }
      // peek ahead: if next line is not a table row, close table
      if (!lines[i + 1]?.startsWith('|')) {
        if (!html.includes('<tbody>')) {
          html += '</table>'
        } else {
          html += '</tbody></table>'
        }
      }
      continue
    }

    // List items
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)/)
    if (listMatch) {
      if (!inList) {
        html += '<ul class="list-disc list-inside space-y-0.5 mb-2 ml-2">'
        inList = true
      }
      html += `<li class="text-sm text-slate-700">${inlineFormat(escapeHtml(listMatch[3]))}</li>`
      continue
    }

    closeList()

    // Empty line
    if (line.trim() === '') {
      html += ''
      continue
    }

    // Plain paragraph
    html += `<p class="mb-2 text-sm text-slate-700 leading-relaxed">${inlineFormat(escapeHtml(line))}</p>`
  }

  // Close any open code block
  if (inCodeBlock && codeLines.length > 0) {
    html += `<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-2 font-mono">${escapeHtml(codeLines.join('\n'))}</pre>`
  }
  closeList()

  return html
}

export function DocumentViewer({ document, onClose, onUpdate }) {
  const session = getSession()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(document?.content ?? '')
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const handleSave = useCallback(async () => {
    if (!document?.id) return
    setSaving(true)
    try {
      const updated = await api.updateDocument(session.token, document.id, { content: editContent })
      showToast('Đã lưu tài liệu', 'success')
      setEditing(false)
      onUpdate?.(updated)
    } catch (err) {
      showToast(err.message ?? 'Lưu thất bại', 'error')
    } finally {
      setSaving(false)
    }
  }, [document?.id, editContent, session?.token, onUpdate, showToast])

  const handleCancelEdit = useCallback(() => {
    setEditContent(document?.content ?? '')
    setEditing(false)
  }, [document?.content])

  if (!document) return null

  const typeLabel = TYPE_LABELS[document.type] ?? document.type
  const statusLabel = DOC_STATUS_LABELS[document.status] ?? document.status
  const statusColor = DOC_STATUS_COLORS[document.status] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-sm">
      <Toast toast={toast} onClose={hideToast} />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {typeLabel}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800 truncate">
          {document.title}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          {!editing ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditContent(document.content ?? '')
                setEditing(true)
              }}
            >
              <Edit2 size={13} /> Sửa
            </Button>
          ) : (
            <>
              <Button size="sm" variant="primary" loading={saving} onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : <Save size={13} />} Lưu
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCancelEdit} disabled={saving}>
                <XCircle size={13} /> Hủy
              </Button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {editing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={24}
            className="font-mono text-xs"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none overflow-auto max-h-[60vh] text-slate-700"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(document.content) }}
          />
        )}

        {/* Generation log */}
        {document.generation_log && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span className="font-medium">Log:</span>{' '}
            {typeof document.generation_log === 'object'
              ? JSON.stringify(document.generation_log)
              : document.generation_log}
          </div>
        )}
      </div>
    </div>
  )
}
