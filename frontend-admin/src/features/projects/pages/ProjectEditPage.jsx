import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProjectFormCard } from '../components/ProjectFormCard'

export function ProjectEditPage({
  loading,
  can,
  users,
  projects,
  projectForm,
  setProjectForm,
  onSubmitProject,
  onResetProjectForm,
  onEditProject,
  fieldErrors,
  error,
}) {
  const navigate = useNavigate()
  const { projectId } = useParams()

  useEffect(() => {
    const project = projects.find((item) => String(item.id) === String(projectId))
    if (!project) {
      navigate('/admin/projects', { replace: true })
      return
    }
    onEditProject(project)
  }, [navigate, onEditProject, projectId, projects])

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

