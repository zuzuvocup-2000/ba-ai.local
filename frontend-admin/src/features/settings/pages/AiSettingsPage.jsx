import { useEffect, useState } from 'react'
import { Eye, EyeOff, Save, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '../../../components/ui/button'

// All keys managed on this page
const ALL_KEYS = ['ai_provider', 'ai_api_key', 'ai_model', 'openai_api_key', 'openai_model', 'ai_max_tokens']

const AI_SETTING_META = {
  ai_provider:    { name: 'AI Provider',       type: 'string', group: 'ai', sort_order: 95  },
  ai_api_key:     { name: 'Anthropic API Key', type: 'string', group: 'ai', sort_order: 100 },
  ai_model:       { name: 'Anthropic Model',   type: 'string', group: 'ai', sort_order: 110 },
  openai_api_key: { name: 'OpenAI API Key',    type: 'string', group: 'ai', sort_order: 115 },
  openai_model:   { name: 'OpenAI Model',      type: 'string', group: 'ai', sort_order: 117 },
  ai_max_tokens:  { name: 'Max Tokens',        type: 'int',    group: 'ai', sort_order: 120 },
}

const ANTHROPIC_MODELS = ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001']
const OPENAI_MODELS    = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

function TextInput({ value, onChange, placeholder, list }) {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        list={list ? `list-${list}` : undefined}
        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
      />
      {list && (
        <datalist id={`list-${list}`}>
          {list.map((opt) => <option key={opt} value={opt} />)}
        </datalist>
      )}
    </>
  )
}

export function AiSettingsPage({ token, error, fetchAiSettings, updateAiSettings, onNotify }) {
  const [vals, setVals] = useState({
    ai_provider:  'anthropic',
    ai_api_key:   '',
    ai_model:     'claude-sonnet-4-6',
    openai_api_key: '',
    openai_model: 'gpt-4o',
    ai_max_tokens: '8000',
  })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAiSettings(token)
      .then((data) => {
        if (!mounted) return
        const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value ?? '']))
        setVals((prev) => ({ ...prev, ...map }))
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [fetchAiSettings, token])

  const set = (key, value) => setVals((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const payload = ALL_KEYS.map((key) => ({
        key,
        name:       AI_SETTING_META[key].name,
        value:      vals[key] ?? '',
        type:       AI_SETTING_META[key].type,
        group:      AI_SETTING_META[key].group,
        is_public:  false,
        sort_order: AI_SETTING_META[key].sort_order,
      }))
      await updateAiSettings(payload, token)
      setSaved(true)
      onNotify?.('success', 'Cập nhật cấu hình AI thành công.')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      onNotify?.('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const provider = vals.ai_provider

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── Provider selector ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
          <h3 className="font-semibold text-white">AI Provider</h3>
          <p className="mt-0.5 text-xs text-slate-300">Chọn nhà cung cấp AI đang sử dụng</p>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          {[
            {
              value: 'anthropic',
              label: 'Anthropic',
              sub: 'Claude Sonnet, Opus, Haiku',
              gradient: 'from-orange-400 to-amber-500',
              ring: 'ring-orange-400',
            },
            {
              value: 'openai',
              label: 'OpenAI',
              sub: 'GPT-4o, GPT-4o mini, GPT-3.5',
              gradient: 'from-emerald-400 to-teal-500',
              ring: 'ring-emerald-400',
            },
          ].map((opt) => {
            const active = provider === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('ai_provider', opt.value)}
                className={[
                  'relative rounded-2xl border-2 p-5 text-left transition-all',
                  active
                    ? `border-transparent ring-2 ${opt.ring} shadow-md`
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {active && (
                  <span className="absolute right-3 top-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </span>
                )}
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${opt.gradient} text-white shadow-sm`}>
                  <Zap size={18} />
                </div>
                <p className="font-semibold text-slate-800">{opt.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{opt.sub}</p>
                {active && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    Đang sử dụng
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Anthropic config ── */}
      <div className={[
        'overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all',
        provider === 'anthropic' ? 'border-orange-300' : 'border-slate-200 opacity-60',
      ].join(' ')}>
        <div className={`px-6 py-4 ${provider === 'anthropic' ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-slate-100'}`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${provider === 'anthropic' ? 'text-white' : 'text-slate-500'}`}>
              Anthropic (Claude)
            </h3>
            {provider === 'anthropic' && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                Active
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-xs ${provider === 'anthropic' ? 'text-white/70' : 'text-slate-400'}`}>
            claude.ai/api — API key bắt đầu bằng sk-ant-
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              API Key
            </label>
            <PasswordInput
              value={vals.ai_api_key}
              onChange={(e) => set('ai_api_key', e.target.value)}
              placeholder="sk-ant-..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Model
            </label>
            <TextInput
              value={vals.ai_model}
              onChange={(e) => set('ai_model', e.target.value)}
              placeholder="claude-sonnet-4-6"
              list={ANTHROPIC_MODELS}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ANTHROPIC_MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('ai_model', m)}
                  className={[
                    'rounded-lg border px-2.5 py-1 text-xs transition-colors',
                    vals.ai_model === m
                      ? 'border-orange-300 bg-orange-50 font-medium text-orange-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── OpenAI config ── */}
      <div className={[
        'overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all',
        provider === 'openai' ? 'border-emerald-300' : 'border-slate-200 opacity-60',
      ].join(' ')}>
        <div className={`px-6 py-4 ${provider === 'openai' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-100'}`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${provider === 'openai' ? 'text-white' : 'text-slate-500'}`}>
              OpenAI (GPT)
            </h3>
            {provider === 'openai' && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                Active
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-xs ${provider === 'openai' ? 'text-white/70' : 'text-slate-400'}`}>
            platform.openai.com — API key bắt đầu bằng sk-
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              API Key
            </label>
            <PasswordInput
              value={vals.openai_api_key}
              onChange={(e) => set('openai_api_key', e.target.value)}
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Model
            </label>
            <TextInput
              value={vals.openai_model}
              onChange={(e) => set('openai_model', e.target.value)}
              placeholder="gpt-4o"
              list={OPENAI_MODELS}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {OPENAI_MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('openai_model', m)}
                  className={[
                    'rounded-lg border px-2.5 py-1 text-xs transition-colors',
                    vals.openai_model === m
                      ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Shared settings ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-800">Thông số chung</h3>
          <p className="mt-0.5 text-xs text-slate-500">Áp dụng cho cả hai provider</p>
        </div>
        <div className="p-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Max Tokens
            <span className="ml-1.5 font-normal text-slate-400">(mặc định: 8000)</span>
          </label>
          <input
            type="number"
            min={256}
            max={128000}
            value={vals.ai_max_tokens}
            onChange={(e) => set('ai_max_tokens', e.target.value)}
            className="flex h-10 w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Giới hạn số token đầu ra cho mỗi lần gọi AI. Tăng lên nếu tài liệu bị cắt ngắn.
          </p>
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 size={15} /> Đã lưu thành công
          </span>
        )}
        <Button onClick={handleSave} disabled={saving || loading} size="lg">
          <Save size={16} />
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </div>
    </div>
  )
}
