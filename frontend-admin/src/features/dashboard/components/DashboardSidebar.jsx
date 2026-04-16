import { Briefcase, ChevronDown, KeyRound, LayoutDashboard, LogOut, Settings2, ShieldCheck, Users, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

export function DashboardSidebar({ user, onLogout, onChangePassword }) {
  const location = useLocation()
  const isInSettingsMenu = location.pathname.startsWith('/admin/settings/')
  const isInLogsMenu = location.pathname.startsWith('/admin/logs/')
  const [openMenus, setOpenMenus] = useState({
    settings: isInSettingsMenu,
    logs: isInLogsMenu,
  })
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [accountMessage, setAccountMessage] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)

  const navItems = [
    { to: '/admin/overview', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Quản lý tài khoản', icon: Users },
    { to: '/admin/projects', label: 'Quản lý dự án', icon: Briefcase },
    { to: '/admin/roles', label: 'Vai trò và quyền', icon: ShieldCheck },
  ]
  const settingItems = [
    { to: '/admin/settings/general', label: 'Cấu hình chung', icon: Settings2 },
  ]
  const logItems = [
    { to: '/admin/logs/login', label: 'Nhật ký đăng nhập', icon: ShieldCheck },
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

  const submitPassword = async (event) => {
    event.preventDefault()
    setAccountLoading(true)
    setAccountMessage('')

    try {
      await onChangePassword(passwordForm)
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
      setAccountMessage('Đổi mật khẩu thành công.')
      setIsPasswordModalOpen(false)
    } catch (error) {
      setAccountMessage(error.message)
    } finally {
      setAccountLoading(false)
    }
  }

  return (
    <aside className="h-full">
      <Card className="flex h-full flex-col overflow-hidden border-slate-800/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-0 text-slate-100">
        <div className="border-b border-white/10 p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Hệ thống</p>
          <h2 className="mt-2 text-xl font-semibold tracking-wide text-white">AI BA Admin</h2>
          <p className="mt-1 text-xs text-slate-300">Trung tâm quản trị</p>
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
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tài khoản hiện tại</p>
          <p className="mt-2 truncate text-sm font-medium text-white">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role.id} className="bg-white/15 text-slate-100">
                {role.name}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              title="Đổi mật khẩu"
              onClick={() => {
                setAccountMessage('')
                setIsPasswordModalOpen(true)
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <KeyRound size={15} />
            </button>
            <button
              type="button"
              title="Đăng xuất"
              onClick={onLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-rose-500/70"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </Card>

      {isPasswordModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Đổi mật khẩu</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {accountMessage && (
              <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">{accountMessage}</p>
            )}

            <form className="space-y-3" onSubmit={submitPassword}>
              <Input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={passwordForm.current_password}
                onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordForm.new_password}
                onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordForm.new_password_confirmation}
                onChange={(event) => setPasswordForm({ ...passwordForm, new_password_confirmation: event.target.value })}
                required
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={accountLoading}>
                  {accountLoading ? 'Đang xử lý...' : 'Cập nhật'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </aside>
  )
}

