import { useNavigate } from 'react-router-dom'
import { LogOut, BrainCircuit } from 'lucide-react'
import { getSession, clearSession } from '../api'
import api from '../api'
import { Button } from '../components/ui/button'

export function AppLayout({ children, breadcrumbs = [] }) {
  const navigate = useNavigate()
  const session = getSession()
  const user = session?.user

  const handleLogout = async () => {
    if (session?.token) {
      await api.logout(session.token).catch(() => null)
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <BrainCircuit size={20} className="text-blue-600" />
          <span className="font-bold text-slate-900">BA Assistant</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.name ?? user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut size={14} />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="border-b border-slate-100 bg-white px-4 py-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <button
                    onClick={() => navigate(crumb.href)}
                    className="text-blue-600 hover:underline"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-medium text-slate-700">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
