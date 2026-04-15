import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import settingDefinitions from '../../../config/general-settings.json'

export function GeneralSettingsPage({ token, error, fetchSettings, updateSettings }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetchSettings(token)
      .then((data) => {
        if (mounted) {
          const byKey = new Map(data.map((item) => [item.key, item]))
          const normalized = settingDefinitions.map((definition, index) => {
            const matched = byKey.get(definition.key)
            return {
              key: definition.key,
              name: definition.name,
              value: matched?.value ?? '',
              type: matched?.type ?? 'string',
              group: matched?.group ?? 'general',
              description: matched?.description ?? null,
              is_public: matched?.is_public ?? false,
              sort_order: matched?.sort_order ?? index + 1,
            }
          })
          setItems(normalized)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [fetchSettings, token])

  const updateValue = (index, value) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, value } : item)))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const payload = items.map((item, index) => ({
        key: item.key,
        name: item.name,
        value: item.value ?? '',
        type: item.type ?? 'string',
        group: item.group ?? 'general',
        description: item.description ?? null,
        is_public: Boolean(item.is_public),
        sort_order: item.sort_order ?? index + 1,
      }))
      await updateSettings(payload, token)
      setMessage('Cập nhật cấu hình thành công.')
    } catch (requestError) {
      setMessage(requestError.message)
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
          <h3 className="text-lg font-semibold text-slate-900">Cấu hình chung</h3>
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
              </div>
              <div className="lg:col-span-4">
                <label className="text-xs uppercase tracking-wide text-slate-400">Value</label>
                <Input
                  value={item.value ?? ''}
                  onChange={(event) => updateValue(index, event.target.value)}
                />
              </div>
            </div>
          ))}

          {!items.length && <p className="text-sm text-slate-500">{loading ? 'Đang tải...' : 'Chưa có cấu hình nào.'}</p>}
        </div>
      </Card>
    </>
  )
}

