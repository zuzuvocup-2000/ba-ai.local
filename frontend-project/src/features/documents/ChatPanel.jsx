import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, ChevronDown, ChevronUp } from 'lucide-react'
import api, { getSession } from '../../api'
import { Spinner } from '../../components/ui/spinner'

// ── Type badge label map ──────────────────────────────────────────────────────

const TYPE_LABELS = {
  brd: 'BRD',
  flow_diagram: 'Flow Diagram',
  sql_logic: 'SQL Logic',
  business_rules: 'Business Rules',
  validation_rules: 'Validation Rules',
  test_cases: 'Test Cases',
  checklist: 'Checklist',
}

// ── Simple diff (same logic as VersionHistory) ────────────────────────────────

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

function DiffView({ oldContent, newContent }) {
  const lines = simpleDiff(oldContent ?? '', newContent ?? '')
  return (
    <div className="overflow-auto max-h-48 rounded-lg border border-slate-200 bg-white text-xs font-mono mt-2">
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

// ── Proposal card ─────────────────────────────────────────────────────────────

function ProposalCard({ message, document, onAccepted, onDismissed }) {
  const session = getSession()
  const [showDiff, setShowDiff] = useState(false)
  const [acting, setActing] = useState(false)
  const [status, setStatus] = useState(null) // null | 'accepted' | 'dismissed'

  const handleAccept = useCallback(async () => {
    setActing(true)
    try {
      const updatedDoc = await api.acceptProposal(session?.token, document.id, message.proposal_id)
      setStatus('accepted')
      onAccepted?.(updatedDoc)
    } catch {
      // swallow – parent will handle errors if needed
    } finally {
      setActing(false)
    }
  }, [session?.token, document.id, message.proposal_id, onAccepted])

  const handleDismiss = useCallback(async () => {
    setActing(true)
    try {
      await api.dismissProposal(session?.token, document.id, message.proposal_id)
      setStatus('dismissed')
      onDismissed?.()
    } catch {
      // swallow
    } finally {
      setActing(false)
    }
  }, [session?.token, document.id, message.proposal_id, onDismissed])

  return (
    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-blue-800 text-xs">
          AI đề xuất thay đổi tài liệu
        </span>
        <button
          type="button"
          onClick={() => setShowDiff((v) => !v)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showDiff ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showDiff ? 'Ẩn thay đổi' : 'Xem thay đổi'}
        </button>
      </div>

      {showDiff && (
        <DiffView
          oldContent={document.content ?? ''}
          newContent={message.proposed_content ?? ''}
        />
      )}

      <div className="mt-2.5 flex items-center gap-2">
        {status === null ? (
          <>
            <button
              type="button"
              disabled={acting}
              onClick={handleAccept}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {acting ? <Spinner size="sm" /> : null}
              Áp dụng
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Bỏ qua
            </button>
          </>
        ) : status === 'accepted' ? (
          <span className="text-xs font-semibold text-emerald-700">Đã áp dụng thay đổi</span>
        ) : (
          <span className="text-xs font-semibold text-slate-500">Đã bỏ qua đề xuất</span>
        )}
      </div>
    </div>
  )
}

// ── Loading dots ──────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-2">
      <div className="rounded-tr-2xl rounded-tl-sm rounded-b-2xl bg-gray-100 px-4 py-2.5 flex items-center gap-1">
        <span
          className="block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}

// ── Main ChatPanel component ──────────────────────────────────────────────────

export function ChatPanel({ document, onDocumentUpdated, onClose }) {
  const session = getSession()

  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Scroll to bottom whenever messages change or sending state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    // Build previous_messages from all messages BEFORE the new user message
    const previousMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const result = await api.chatDocument(session?.token, document.id, {
        message: text,
        ...(conversationId ? { conversation_id: conversationId } : {}),
        previous_messages: previousMessages,
      })

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.reply ?? '',
        proposal_id: result.proposal_id ?? null,
        proposed_content: result.proposed_content ?? null,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMsg])

      if (!conversationId && result.conversation_id) {
        setConversationId(result.conversation_id)
      }
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err.message ?? 'Có lỗi xảy ra, vui lòng thử lại.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setSending(false)
    }
  }, [input, sending, messages, conversationId, session?.token, document?.id])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const typeLabel = TYPE_LABELS[document?.type] ?? document?.type

  return (
    <>
      {/* Backdrop (click to close) */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col bg-white shadow-2xl border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 bg-white shrink-0">
          <span className="font-semibold text-slate-800 text-sm flex-1">AI Assistant</span>
          {typeLabel && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shrink-0">
              {typeLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {messages.length === 0 && !sending && (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-slate-400 px-6">
                Hỏi AI về tài liệu này. AI có thể đề xuất thay đổi nội dung.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} mb-1`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tl-2xl rounded-tr-sm rounded-b-2xl'
                    : 'bg-gray-100 text-gray-800 rounded-tr-2xl rounded-tl-sm rounded-b-2xl'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>

              {/* Proposal card for AI messages with proposed_content */}
              {msg.role === 'assistant' && msg.proposed_content && msg.proposal_id && (
                <div className="max-w-[95%] w-full">
                  <ProposalCard
                    message={msg}
                    document={document}
                    onAccepted={(updatedDoc) => {
                      onDocumentUpdated?.(updatedDoc)
                    }}
                    onDismissed={() => {
                      // nothing extra needed
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {sending && <TypingDots />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-100 px-3 py-3 bg-white shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={2}
              placeholder="Nhập câu hỏi... (Enter gửi, Shift+Enter xuống dòng)"
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 transition"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {sending ? <Spinner size="sm" /> : <Send size={14} />}
              Gửi
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
