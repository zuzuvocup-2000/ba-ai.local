import { LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Card } from '../../../components/ui/card'

export function DashboardSidebar({ user }) {
  const navItems = [
    { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
  ]

  return (
    <aside className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white">
          <h2 className="mb-1 text-lg font-semibold tracking-wide">BA AI</h2>
          <p className="text-xs text-slate-300">Admin Navigation</p>
        </div>
        <div className="space-y-2 p-3">
          {navItems.map(({ to, label, icon }) => {
            const IconComponent = icon

            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <IconComponent size={16} />
                {label}
              </NavLink>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Session</p>
        <p className="mt-2 truncate text-sm font-medium text-slate-700">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <Badge key={role.id} className="bg-indigo-50 text-indigo-700">{role.name}</Badge>
          ))}
        </div>
      </Card>
    </aside>
  )
}

