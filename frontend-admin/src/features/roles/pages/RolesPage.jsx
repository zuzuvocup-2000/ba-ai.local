import { ShieldCheck } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Card } from '../../../components/ui/card'

export function RolesPage({ roles, error }) {
  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600">
                <ShieldCheck size={16} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{role.name}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">{role.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} className="bg-slate-100 text-slate-700">
                  {permission}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

