import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectFormCard } from '../components/ProjectFormCard'

export function ProjectCreatePage({ loading, can, users, projectForm, setProjectForm, onSubmitProject, onResetProjectForm, fieldErrors, error }) {
  const navigate = useNavigate()

  useEffect(() => {
    onResetProjectForm()
  }, [onResetProjectForm])

  const handleSubmit = async (event) => {
    await onSubmitProject(event)
    navigate('/admin/projects')
  }

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <ProjectFormCard
        loading={loading}
        can={can}
        users={users}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        onSubmitProject={handleSubmit}
        onResetProjectForm={onResetProjectForm}
        fieldErrors={fieldErrors}
      />
    </>
  )
}

