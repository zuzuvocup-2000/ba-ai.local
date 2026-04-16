import { useEffect, useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

const AI_SETTING_DEFINITIONS = [
  { key: 'ai_api_key', name: 'API Key', type: 'string', description: 'Anthropic API Key dùng để gọi AI', is_password: true },
  { key: 'ai_model', name: 'Model', type: 'string', description: 'Model AI sử dụng (vd: claude-sonnet-4-6)', is_password: false },
  { key: 'ai_max_tokens', name: 'Max Tokens', type: 'int', description: 'Số token tối đa cho mỗi request (mặc định: 8000)', is_password: false },
]

export function AiSettingsPage({ token, error, fetchAiSettings, updateAiSettings, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState({})

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetchAiSettings(token)
      .then((data) => {
        if (mounted) {
          const byKey = new Map((data ?? []).map((item) => [item.key, item]))
          const normalized = AI_SETTING_DEFINITIONS.map((definition, index) => {
            const matched = byKey.get(definition.key)
            return {
              key: definition.key,
              name: definition.name,
              value: matched?.value ?? '',
              type: definition.type,
              group: 'ai',
              description: definition.description,
              is_public: false,
              sort_order: index + 1,
              is_password: definition.is_password,
            }
          })
          setItems(normalized)
        }
      })
      .catch(() => {
        if (mounted) {
          const normalized = AI_SETTING_DEFINITIONS.map((definition, index) => ({
            key: definition.key,
            name: definition.name,
            value: definition.key === 'ai_model' ? 'claude-sonnet-4-6' : definition.key === 'ai_max_tokens' ? '8000' : '',
            type: definition.type,
            group: 'ai',
            description: definition.description,
            is_public: false,
            sort_order: index + 1,
            is_password: definition.is_password,
          }))
          setItems(normalized)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [fetchAiSettings, token])

  const updateValue = (index, value) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, value } : item)))
  }

  const toggleShow = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const payload = items.map((item) => ({
        key: item.key,
        value: item.value ?? '',
      }))
      await updateAiSettings(payload, token)
      setMessage('Cập nhật cấu hình AI thành công.')
      onNotify?.('success', 'Cập nhật cấu hình AI thành công.')
    } catch (requestError) {
      setMessage(requestError.message)
      onNotify?.('error', requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Cấu hình AI</h3>
            <p className="mt-1 text-sm text-slate-500">Quản lý API Key và thông số mô hình AI</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save size={16} className="mr-2" />
            Lưu cấu hình
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 lg:grid-cols-10">
              <div className="lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Key</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{item.key}</p>
              </div>
              <div className="lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                )}
              </div>
              <div className="lg:col-span-4">
                <label className="text-xs uppercase tracking-wide text-slate-400">Value</label>
                {item.is_password ? (
                  <div className="relative mt-1">
                    <Input
                      type={showPassword[item.key] ? 'text' : 'password'}
                      value={item.value ?? ''}
                      onChange={(event) => updateValue(index, event.target.value)}
                      className="pr-10"
                      placeholder="Nhập API Key..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(item.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword[item.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ) : (
                  <Input
                    value={item.value ?? ''}
                    onChange={(event) => updateValue(index, event.target.value)}
                    placeholder={item.key === 'ai_model' ? 'claude-sonnet-4-6' : item.key === 'ai_max_tokens' ? '8000' : ''}
                  />
                )}
              </div>
            </div>
          ))}

          {!items.length && (
            <p className="text-sm text-slate-500">{loading ? 'Đang tải...' : 'Chưa có cấu hình nào.'}</p>
          )}
        </div>
      </Card>
    </>
  )
}
