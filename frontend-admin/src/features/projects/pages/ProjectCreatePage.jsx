import { useEffect } from 'react'
import { ProjectFormCard } from '../components/ProjectFormCard'

export function ProjectCreatePage({ loading, can, projectForm, setProjectForm, onSubmitProject, onResetProjectForm, fieldErrors, error }) {
  useEffect(() => {
    onResetProjectForm()
  }, [onResetProjectForm])

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <ProjectFormCard
        loading={loading}
        can={can}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        onSubmitProject={onSubmitProject}
        onResetProjectForm={onResetProjectForm}
        fieldErrors={fieldErrors}
      />
    </>
  )
}

