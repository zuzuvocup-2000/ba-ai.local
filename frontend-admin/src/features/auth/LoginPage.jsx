import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

export function LoginPage({ loginForm, setLoginForm, onSubmit, error, fieldErrors, loading }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm text-slate-500">AI Business Analyst Assistant</p>
          <h1 className="text-2xl font-semibold text-slate-900">Trang quản trị</h1>
          <p className="text-sm text-slate-500">Đăng nhập để quản trị người dùng và phân quyền.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
            {fieldErrors?.email && <p className="text-xs text-rose-600">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
            {fieldErrors?.password && <p className="text-xs text-rose-600">{fieldErrors.password}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </main>
  )
}

