import { ChevronDown, LayoutDashboard, Settings2, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Card } from '../../../components/ui/card'

export function DashboardSidebar({ user }) {
  const location = useLocation()
  const isInSettingsMenu = location.pathname.startsWith('/admin/settings/')
  const isInLogsMenu = location.pathname.startsWith('/admin/logs/')
  const [openMenus, setOpenMenus] = useState({
    settings: isInSettingsMenu,
    logs: isInLogsMenu,
  })

  const navItems = [
    { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
  ]
  const settingItems = [
    { to: '/admin/settings/general', label: 'Cấu hình chung', icon: Settings2 },
  ]
  const logItems = [
    { to: '/admin/logs/access', label: 'Nhật ký truy cập', icon: ShieldCheck },
    { to: '/admin/logs/actions', label: 'Nhật ký hành động', icon: ShieldCheck },
    { to: '/admin/logs/errors', label: 'Nhật ký lỗi', icon: ShieldCheck },
  ]

  const renderNavItem = ({ to, label, icon }) => {
    const IconComponent = icon

    return (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          [
            'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all',
            isActive
              ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
              : 'text-slate-300 hover:bg-white/10 hover:text-white',
          ].join(' ')
        }
      >
        <IconComponent size={16} />
        {label}
      </NavLink>
    )
  }

  return (
    <aside className="h-full">
      <Card className="flex h-full flex-col overflow-hidden border-slate-800/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-0 text-slate-100">
        <div className="border-b border-white/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <h2 className="mt-2 text-xl font-semibold tracking-wide text-white">BA AI Admin</h2>
          <p className="mt-1 text-xs text-slate-300">Control center</p>
        </div>

        <div className="flex-1 space-y-2 p-3">
          {navItems.map(renderNavItem)}

          <button
            type="button"
            onClick={() => setOpenMenus((prev) => ({ ...prev, settings: !prev.settings }))}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
              isInSettingsMenu ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings2 size={16} />
              Cấu hình
            </span>
            <ChevronDown size={16} className={`transition-transform ${openMenus.settings ? '' : '-rotate-90'}`} />
          </button>
          {openMenus.settings && <div className="space-y-1 pl-2">{settingItems.map(renderNavItem)}</div>}

          <button
            type="button"
            onClick={() => setOpenMenus((prev) => ({ ...prev, logs: !prev.logs }))}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
              isInLogsMenu ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Nhật ký
            </span>
            <ChevronDown size={16} className={`transition-transform ${openMenus.logs ? '' : '-rotate-90'}`} />
          </button>
          {openMenus.logs && <div className="space-y-1 pl-2">{logItems.map(renderNavItem)}</div>}
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current account</p>
          <p className="mt-2 truncate text-sm font-medium text-white">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
          {user.roles.map((role) => (
              <Badge key={role.id} className="bg-white/15 text-slate-100">
                {role.name}
              </Badge>
          ))}
          </div>
        </div>
      </Card>
    </aside>
  )
}

