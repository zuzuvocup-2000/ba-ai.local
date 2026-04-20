import { useState, useEffect, useMemo } from 'react'
import { Shield, FileText, Layers, GitBranch, ListChecks, BookOpen, Save, Zap } from 'lucide-react'
import api, { getSession } from '../../api'
import { Button } from '../../components/ui/button'
import { Spinner } from '../../components/ui/spinner'
import { Tabs } from '../../components/ui/tabs'
import { PermissionsTab } from './tabs/PermissionsTab'
import { ContentTab } from './tabs/ContentTab'
import { PlatformsTab } from './tabs/PlatformsTab'
import { MainFlowTab } from './tabs/MainFlowTab'
import { FunctionsByPlatformTab } from './tabs/FunctionsByPlatformTab'
import { DocsTab } from './tabs/DocsTab'

const TAB_DEFS = [
  { value: 'permissions', label: 'Quyền', icon: Shield },
  { value: 'content', label: 'Nội dung (5W–1H)', icon: FileText },
  { value: 'platforms', label: 'Nền tảng', icon: Layers },
  { value: 'flow', label: 'Flow chính', icon: GitBranch },
  { value: 'functions', label: 'Chức năng theo nền tảng', icon: ListChecks },
  { value: 'docs', label: 'Tài liệu khác', icon: BookOpen },
]

const emptyState = () => ({
  roles: [],
  commonInfo: {
    content_5w1h: {},
    platforms: [],
    main_flow: '',
    functions_by_platform: {},
    docs: { categories: [], articles: [] },
  },
})

export function ProjectOverview({ project, onSaved, onDocGenerated }) {
  const session = getSession()
  const [tab, setTab] = useState('permissions')
  const [state, setState] = useState(emptyState)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [genError, setGenError] = useState('')

  useEffect(() => {
    if (!project) return
    const ci = project.common_info && typeof project.common_info === 'object' ? project.common_info : {}
    setState({
      roles: Array.isArray(project.roles) ? project.roles : [],
      commonInfo: {
        ...ci,
        content_5w1h: ci.content_5w1h ?? {},
        platforms: Array.isArray(ci.platforms) ? ci.platforms : [],
        main_flow: ci.main_flow ?? '',
        functions_by_platform: ci.functions_by_platform ?? {},
        docs: ci.docs ?? { categories: [], articles: [] },
      },
    })
  }, [project?.id])

  const patch = (path, v) => setState((s) => ({
    ...s,
    commonInfo: { ...s.commonInfo, [path]: v },
  }))

  const handleSave = async () => {
    if (!project?.id || !session?.token) return
    setSaving(true)
    setSaveMsg('')
    try {
      await api.updateProjectCommonInfo(session.token, project.id, {
        roles: state.roles,
        common_info: state.commonInfo,
      })
      setSaveMsg('Đã lưu thành công.')
      onSaved?.()
    } catch (err) {
      setSaveMsg(`Lỗi: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    if (!project?.id || !session?.token) return
    setGenerating(true)
    setGenError('')
    try {
      const doc = await api.generateCommonDoc(session.token, project.id)
      onDocGenerated?.(doc)
    } catch (err) {
      setGenError(err.message ?? 'Sinh tài liệu thất bại')
    } finally {
      setGenerating(false)
    }
  }

  const panel = useMemo(() => {
    switch (tab) {
      case 'permissions':
        return (
          <PermissionsTab
            roles={state.roles}
            onChange={(roles) => setState((s) => ({ ...s, roles }))}
          />
        )
      case 'content':
        return (
          <ContentTab
            value={state.commonInfo.content_5w1h}
            onChange={(v) => patch('content_5w1h', v)}
          />
        )
      case 'platforms':
        return (
          <PlatformsTab
            platforms={state.commonInfo.platforms}
            onChange={(v) => patch('platforms', v)}
          />
        )
      case 'flow':
        return (
          <MainFlowTab
            value={state.commonInfo.main_flow}
            onChange={(v) => patch('main_flow', v)}
          />
        )
      case 'functions':
        return (
          <FunctionsByPlatformTab
            platforms={state.commonInfo.platforms}
            functions={state.commonInfo.functions_by_platform}
            onChange={(v) => patch('functions_by_platform', v)}
          />
        )
      case 'docs':
        return (
          <DocsTab
            value={state.commonInfo.docs}
            onChange={(v) => patch('docs', v)}
          />
        )
      default:
        return null
    }
  }, [tab, state])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {project?.name ?? 'Tổng quan dự án'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Thông tin tổng quan dự án — quyền, nội dung, nền tảng, flow, chức năng và tài liệu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saveMsg && (
            <span
              className={`text-xs ${saveMsg.startsWith('Lỗi') ? 'text-rose-600' : 'text-emerald-600'}`}
            >
              {saveMsg}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Spinner size="sm" /> : <Zap size={13} />}
            {generating ? 'Đang sinh...' : 'Sinh tài liệu AI'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save size={13} />}
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </div>

      {genError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {genError}
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={TAB_DEFS} value={tab} onChange={setTab} />

      {/* Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {panel}
      </div>
    </div>
  )
}
