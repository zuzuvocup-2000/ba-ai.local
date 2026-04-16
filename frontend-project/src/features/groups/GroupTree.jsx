import { useState } from 'react'
import { ChevronRight, ChevronDown, MoreHorizontal, GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

function GroupItem({ group, children, level = 0, selectedId, onSelect, onEdit, onDelete, onAddChild }) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasChildren = children && children.length > 0
  const isSelected = selectedId === group.id

  const progress = group.total_items > 0
    ? Math.round((group.verified_items / group.total_items) * 100)
    : 0

  return (
    <div>
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
          isSelected
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-700 hover:bg-slate-100',
          level > 0 && 'ml-4',
        )}
        onClick={() => onSelect?.(group)}
      >
        {/* Drag handle (visual only) */}
        <GripVertical
          size={12}
          className="shrink-0 text-slate-300 opacity-0 group-hover:opacity-100"
        />

        {/* Expand/collapse */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p) }}
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          {hasChildren
            ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
            : <span className="inline-block w-3.5" />}
        </button>

        {/* Color dot */}
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: group.color ?? '#94a3b8' }}
        />

        {/* Name */}
        <span className="flex-1 truncate font-medium">{group.name}</span>

        {/* Prefix badge */}
        {group.prefix && (
          <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-500">
            {group.prefix}
          </span>
        )}

        {/* Progress */}
        {group.total_items > 0 && (
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 text-right text-[10px] text-slate-400">{progress}%</span>
          </div>
        )}

        {/* Context menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p) }}
            className="rounded p-0.5 text-slate-400 opacity-0 hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {level === 0 && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAddChild?.(group) }}
                  >
                    <Plus size={12} /> Thêm nhóm con
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(group) }}
                >
                  <Pencil size={12} /> Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(group) }}
                >
                  <Trash2 size={12} /> Xóa nhóm
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {children.map((child) => (
            <GroupItem
              key={child.id}
              group={child}
              children={[]}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function GroupTree({ groups = [], selectedId, onSelect, onEdit, onDelete, onAdd }) {
  // Build tree: root groups + their children
  const roots = groups.filter((g) => !g.parent_id)
  const childrenOf = (parentId) => groups.filter((g) => g.parent_id === parentId)

  return (
    <div className="space-y-0.5 py-1">
      {roots.map((group) => (
        <GroupItem
          key={group.id}
          group={group}
          children={childrenOf(group.id)}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={(parent) => onAdd?.(parent)}
        />
      ))}
    </div>
  )
}
