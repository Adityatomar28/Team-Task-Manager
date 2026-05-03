const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "https://team-task-manager-production-e9da.up.railway.app/api"
  : "http://localhost:3000/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

function authHeaders(auth) {
  const token = typeof auth === "string" ? auth : auth?.token
  const user = typeof auth === "string" ? null : auth?.user
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
  const name = user?.fullName || user?.username || user?.firstName

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { "X-Clerk-User-Id": user.id } : {}),
    ...(email ? { "X-Clerk-User-Email": email } : {}),
    ...(name ? { "X-Clerk-User-Name": name } : {}),
  }
}

async function request(path, auth, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(auth),
      ...(options.headers || {}),
    },
  })

  const payload = await response.json()
  if (!response.ok) throw new Error(payload.message || "Request failed")
  return payload
}

export function fetchDashboard(token) {
  return request("/dashboard/overview", token)
}

export function fetchProjects(token) {
  return request("/projects", token)
}

export function createProject(token, data) {
  return request("/projects", token, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function fetchProjectTasks(token, projectId) {
  return request(`/projects/${projectId}/tasks`, token)
}

export function fetchProjectDetails(token, projectId) {
  return request(`/projects/${projectId}`, token)
}

export function addProjectMember(token, projectId, data) {
  return request(`/projects/${projectId}/members`, token, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function deleteProject(token, projectId) {
  return request(`/projects/${projectId}`, token, {
    method: "DELETE",
  })
}

export function removeProjectMember(token, projectId, memberId) {
  return request(`/projects/${projectId}/members/${memberId}`, token, {
    method: "DELETE",
  })
}

export function createTask(token, projectId, data) {
  return request(`/projects/${projectId}/tasks`, token, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateTask(token, projectId, taskId, data) {
  return request(`/projects/${projectId}/tasks/${taskId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function sendChatMessage(token, data) {
  return request("/chat", token, {
    method: "POST",
    body: JSON.stringify(data),
  })
}
