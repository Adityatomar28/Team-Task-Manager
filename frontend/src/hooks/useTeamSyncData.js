/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react"
import { createProject, createTask, fetchDashboard, fetchProjects, fetchProjectTasks, updateTask } from "../api"

export function useTeamSyncData(getToken, isSignedIn) {
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || null, [projects, activeProjectId])

  const loadAll = useCallback(async () => {
    if (!isSignedIn) return
    setLoading(true)
    setError("")
    try {
      const token = await getToken()
      if (!token) return
      const [dashboardRes, projectsRes] = await Promise.all([fetchDashboard(token), fetchProjects(token)])
      setDashboard(dashboardRes.data)
      setProjects(projectsRes.data || [])
      const defaultProjectId = activeProjectId || projectsRes.data?.[0]?.id
      setActiveProjectId(defaultProjectId || null)
      if (defaultProjectId) {
        const tasksRes = await fetchProjectTasks(token, defaultProjectId)
        setTasks(tasksRes.data || [])
      } else {
        setTasks([])
      }
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [activeProjectId, getToken, isSignedIn])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const createTeam = useCallback(async ({ name, description }) => {
    setCreating(true)
    try {
      const token = await getToken()
      if (!token) return
      await createProject(token, { name, description })
      await loadAll()
    } finally {
      setCreating(false)
    }
  }, [getToken, loadAll])

  const moveTask = useCallback(async (taskId, status) => {
    if (!activeProjectId) return
    const original = tasks
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)))
    try {
      const token = await getToken()
      if (!token) return
      await updateTask(token, activeProjectId, taskId, { status })
    } catch (moveError) {
      setTasks(original)
      setError(moveError.message)
    }
  }, [activeProjectId, getToken, tasks])

  const addSampleTask = useCallback(async () => {
    if (!activeProjectId) return
    try {
      const token = await getToken()
      if (!token) return
      await createTask(token, activeProjectId, {
        title: "New Task",
        priority: "MEDIUM",
        status: "TODO",
      })
      const tasksRes = await fetchProjectTasks(token, activeProjectId)
      setTasks(tasksRes.data || [])
    } catch (taskError) {
      setError(taskError.message)
    }
  }, [activeProjectId, getToken])

  const selectProject = useCallback(async (projectId) => {
    setActiveProjectId(projectId)
    try {
      const token = await getToken()
      if (!token) return
      const tasksRes = await fetchProjectTasks(token, projectId)
      setTasks(tasksRes.data || [])
    } catch (taskError) {
      setError(taskError.message)
    }
  }, [getToken])

  return {
    dashboard,
    projects,
    tasks,
    activeProject,
    activeProjectId,
    loading,
    creating,
    error,
    createTeam,
    moveTask,
    addSampleTask,
    selectProject,
    refresh: loadAll,
  }
}
