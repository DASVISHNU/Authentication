const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const TOKEN_KEY = "auth_access_token";
const USER_KEY = "auth_user";

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  return {
    token,
    user: rawUser ? JSON.parse(rawUser) : null,
  };
}

export function storeSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export const authApi = {
  login: (body) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const projectApi = {
  list: () => apiRequest("/projects"),
  create: (body) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  get: (projectId) => apiRequest(`/projects/${projectId}`),
  update: (projectId, body) =>
    apiRequest(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (projectId) =>
    apiRequest(`/projects/${projectId}`, {
      method: "DELETE",
    }),
  members: (projectId) => apiRequest(`/projects/${projectId}/members`),
  addMember: (projectId, body) =>
    apiRequest(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateMember: (projectId, userId, body) =>
    apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  removeMember: (projectId, userId) =>
    apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
};
