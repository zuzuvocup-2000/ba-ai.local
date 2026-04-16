import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import api, { setSession } from '../../api'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

export function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', system: 'project' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const data = await api.login(form)
      setSession(data.token, data.user)
      navigate('/projects', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Không thể đăng nhập. Vui lòng thử lại.')
      if (err.errors && typeof err.errors === 'object') {
        const normalized = Object.entries(err.errors).reduce((acc, [k, v]) => {
          if (Array.isArray(v) && v.length > 0) acc[k] = String(v[0])
          return acc
        }, {})
        setFieldErrors(normalized)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <LogIn size={26} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            AI Business Analyst
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">BA Assistant — Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập để truy cập không gian làm việc dự án.
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {error}
              </p>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="ten@cong-ty.vn"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              error={fieldErrors.email}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              error={fieldErrors.password}
              required
            />

            <Button type="submit" disabled={loading} className="mt-2 w-full" size="lg">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
