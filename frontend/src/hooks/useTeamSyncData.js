/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addProjectMember,
  createProject,
  createTask,
  fetchDashboard,
  fetchProjectDetails,
  fetchProjects,
  fetchProjectTasks,
  deleteProject,
  removeProjectMember,
  updateTask,
} from "../api"

export function useTeamSyncData(getToken, isSignedIn, user) {
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [taskComposerOpen, setTaskComposerOpen] = useState(false)
  const [error, setError] = useState("")

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || null, [projects, activeProjectId])

  const getAuth = useCallback(async () => {
    const token = await getToken()
    return token || user ? { token, user } : null
  }, [getToken, user])

  const loadAll = useCallback(async () => {
    if (!isSignedIn) return
    setLoading(true)
    setError("")
    try {
      const auth = await getAuth()
      if (!auth) return
      const [dashboardRes, projectsRes] = await Promise.all([fetchDashboard(auth), fetchProjects(auth)])
      setDashboard(dashboardRes.data)
      setProjects(projectsRes.data || [])
      const nextProjects = projectsRes.data || []
      const activeProjectStillExists = nextProjects.some((project) => project.id === activeProjectId)
      const defaultProjectId = activeProjectStillExists ? activeProjectId : nextProjects[0]?.id
      setActiveProjectId(defaultProjectId || null)
      if (defaultProjectId) {
        const [tasksRes, projectDetailsRes] = await Promise.all([
          fetchProjectTasks(auth, defaultProjectId),
          fetchProjectDetails(auth, defaultProjectId),
        ])
        setTasks(tasksRes.data || [])
        const normalizedMembers = (projectDetailsRes.data?.members || []).map((member) => ({
          id: member.id,
          userId: member.userId,
          name: member.user?.name || "Unknown",
          email: member.user?.email || "",
          role: member.role,
          team: projectDetailsRes.data?.name || "Team",
          status: "Active",
        }))
        setMembers(normalizedMembers)
      } else {
        setTasks([])
        setMembers([])
      }
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [activeProjectId, getAuth, isSignedIn])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const createTeam = useCallback(async ({ name, description }) => {
    setCreating(true)
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await createProject(auth, { name, description })
      await loadAll()
    } catch (createError) {
      setError(createError.message)
      throw createError
    } finally {
      setCreating(false)
    }
  }, [getAuth, loadAll])

  const moveTask = useCallback(async (taskId, status) => {
    if (!activeProjectId) return
    const original = tasks
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)))
    try {
      const auth = await getAuth()
      if (!auth) return
      await updateTask(auth, activeProjectId, taskId, { status })
    } catch (moveError) {
      setTasks(original)
      setError(moveError.message)
    }
  }, [activeProjectId, getAuth, tasks])

  const createTaskForProject = useCallback(async (taskData) => {
    if (!activeProjectId) {
      setError("Create/select a team first to add tasks")
      return
    }
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await createTask(auth, activeProjectId, taskData)
      await loadAll()
      setTaskComposerOpen(false)
    } catch (taskError) {
      setError(taskError.message)
      throw taskError
    }
  }, [activeProjectId, getAuth, loadAll])

  const updateTaskDetails = useCallback(async (taskId, data) => {
    if (!activeProjectId) return
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await updateTask(auth, activeProjectId, taskId, data)
      await loadAll()
    } catch (taskError) {
      setError(taskError.message)
      throw taskError
    }
  }, [activeProjectId, getAuth, loadAll])

  const selectProject = useCallback(async (projectId) => {
    setActiveProjectId(projectId)
    try {
      const auth = await getAuth()
      if (!auth) return
      const [tasksRes, projectDetailsRes] = await Promise.all([
        fetchProjectTasks(auth, projectId),
        fetchProjectDetails(auth, projectId),
      ])
      setTasks(tasksRes.data || [])
      const normalizedMembers = (projectDetailsRes.data?.members || []).map((member) => ({
        id: member.id,
        userId: member.userId,
        name: member.user?.name || "Unknown",
        email: member.user?.email || "",
        role: member.role,
        team: projectDetailsRes.data?.name || "Team",
        status: "Active",
      }))
      setMembers(normalizedMembers)
    } catch (taskError) {
      setError(taskError.message)
    }
  }, [getAuth])

  const addMember = useCallback(async ({ email, role = "MEMBER" }) => {
    if (!activeProjectId) return
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await addProjectMember(auth, activeProjectId, { email, role })
      await loadAll()
    } catch (memberError) {
      setError(memberError.message)
      throw memberError
    }
  }, [activeProjectId, getAuth, loadAll])

  const deleteTeam = useCallback(async (projectId) => {
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await deleteProject(auth, projectId)
      setActiveProjectId((current) => (current === projectId ? null : current))
      await loadAll()
    } catch (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
  }, [getAuth, loadAll])

  const deleteMember = useCallback(async (memberId) => {
    if (!activeProjectId) return
    try {
      const auth = await getAuth()
      if (!auth) {
        throw new Error("You must be signed in")
      }
      await removeProjectMember(auth, activeProjectId, memberId)
      await loadAll()
    } catch (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
  }, [activeProjectId, getAuth, loadAll])

  return {
    dashboard,
    projects,
    tasks,
    members,
    activeProject,
    activeProjectId,
    loading,
    creating,
    taskComposerOpen,
    error,
    createTeam,
    moveTask,
    createTask: createTaskForProject,
    updateTaskDetails,
    setTaskComposerOpen,
    addMember,
    deleteTeam,
    deleteMember,
    selectProject,
    getAuth,
    refresh: loadAll,
  }
}
