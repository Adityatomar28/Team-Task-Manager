const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
