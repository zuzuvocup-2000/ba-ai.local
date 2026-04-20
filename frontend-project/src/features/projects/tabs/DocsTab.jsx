import { useState, useMemo } from 'react'
import { Plus, Trash2, FolderOpen, FileText, Edit2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { RichEditor } from '../../../components/ui/rich-editor'
import { cn } from '../../../lib/utils'

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function DocsTab({ value = { categories: [], articles: [] }, onChange }) {
  const { categories = [], articles = [] } = value
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? null)
  const [selectedArt, setSelectedArt] = useState(null)
  const [renamingCat, setRenamingCat] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')

  const patch = (next) => onChange({ categories, articles, ...next })

  // ── Category actions ─────────────────────────────────────────────
  const addCategory = () => {
    const cat = { id: newId('cat'), name: 'Danh mục mới' }
    patch({ categories: [...categories, cat] })
    setSelectedCat(cat.id)
    setRenamingCat(cat.id)
    setRenameDraft(cat.name)
  }

  const commitRename = () => {
    if (!renamingCat) return
    patch({
      categories: categories.map((c) =>
        c.id === renamingCat ? { ...c, name: renameDraft.trim() || c.name } : c,
      ),
    })
    setRenamingCat(null)
    setRenameDraft('')
  }

  const removeCategory = (id) => {
    if (!window.confirm('Xóa danh mục này và toàn bộ bài viết bên trong?')) return
    patch({
      categories: categories.filter((c) => c.id !== id),
      articles: articles.filter((a) => a.categoryId !== id),
    })
    if (selectedCat === id) setSelectedCat(null)
    if (selectedArt?.categoryId === id) setSelectedArt(null)
  }

  // ── Article actions ──────────────────────────────────────────────
  const addArticle = () => {
    if (!selectedCat) return
    const art = {
      id: newId('art'),
      categoryId: selectedCat,
      title: 'Bài viết mới',
      content: '',
      updatedAt: new Date().toISOString(),
    }
    patch({ articles: [...articles, art] })
    setSelectedArt(art)
  }

  const updateArticle = (id, p) => {
    const next = articles.map((a) =>
      a.id === id ? { ...a, ...p, updatedAt: new Date().toISOString() } : a,
    )
    patch({ articles: next })
    if (selectedArt?.id === id) {
      setSelectedArt(next.find((a) => a.id === id))
    }
  }

  const removeArticle = (id) => {
    if (!window.confirm('Xóa bài viết này?')) return
    patch({ articles: articles.filter((a) => a.id !== id) })
    if (selectedArt?.id === id) setSelectedArt(null)
  }

  const articlesInCat = useMemo(
    () => articles.filter((a) => a.categoryId === selectedCat),
    [articles, selectedCat],
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Tài liệu khác</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Tổ chức tài liệu theo danh mục và bài viết. Nội dung bài viết dùng trình soạn thảo giàu định dạng.
        </p>
      </div>

      <div className="flex min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* ── Categories sidebar ── */}
        <div className="w-56 shrink-0 border-r border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Danh mục
            </span>
            <Button size="sm" variant="ghost" onClick={addCategory} title="Thêm danh mục">
              <Plus size={13} />
            </Button>
          </div>

          {categories.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Chưa có danh mục.
            </p>
          ) : (
            <ul className="py-1">
              {categories.map((c) => {
                const active = c.id === selectedCat
                const editing = renamingCat === c.id
                return (
                  <li key={c.id}>
                    <div
                      className={cn(
                        'group flex items-center gap-1.5 px-2 py-1.5 text-sm',
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCat(c.id)}
                        className="flex flex-1 items-center gap-1.5 truncate text-left"
                      >
                        <FolderOpen size={13} className="shrink-0" />
                        {editing ? (
                          <input
                            autoFocus
                            className="flex-1 rounded border border-blue-300 bg-white px-1 py-0.5 text-sm outline-none"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename()
                              if (e.key === 'Escape') { setRenamingCat(null); setRenameDraft('') }
                            }}
                          />
                        ) : (
                          <span className="truncate">{c.name}</span>
                        )}
                      </button>
                      {!editing && (
                        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenamingCat(c.id)
                              setRenameDraft(c.name)
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeCategory(c.id) }}
                            className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Articles list ── */}
        <div className="w-60 shrink-0 border-r border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bài viết
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={addArticle}
              disabled={!selectedCat}
              title={selectedCat ? 'Thêm bài viết' : 'Chọn danh mục trước'}
            >
              <Plus size={13} />
            </Button>
          </div>

          {!selectedCat ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Chọn một danh mục.
            </p>
          ) : articlesInCat.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Danh mục trống.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {articlesInCat.map((a) => {
                const active = a.id === selectedArt?.id
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedArt(a)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left',
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <FileText size={13} className="shrink-0" />
                      <span className="flex-1 truncate text-sm">{a.title || 'Không tiêu đề'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Article editor ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!selectedArt ? (
            <EmptyState
              icon={FileText}
              title="Chưa chọn bài viết"
              description="Chọn một bài viết ở cột giữa hoặc tạo mới."
            />
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">
                <input
                  className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-semibold text-slate-800 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white"
                  value={selectedArt.title}
                  onChange={(e) => updateArticle(selectedArt.id, { title: e.target.value })}
                  placeholder="Tiêu đề bài viết"
                />
                <button
                  type="button"
                  onClick={() => removeArticle(selectedArt.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Xóa bài viết"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <RichEditor
                  key={selectedArt.id}
                  value={selectedArt.content ?? ''}
                  onChange={(html) => updateArticle(selectedArt.id, { content: html })}
                  placeholder="Nội dung bài viết..."
                  minHeight={360}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
