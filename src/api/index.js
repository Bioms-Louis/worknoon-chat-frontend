import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  signup:         (data) => api.post("/auth/signup", data),
  login:          (data) => api.post("/auth/login", data),
  getMe:          ()     => api.get("/auth/me"),
  updatePassword: (data) => api.patch("/auth/update-password", data),
};

export const userAPI = {
  getMe:        ()       => api.get("/users/me"),
  updateMe:     (data)   => api.patch("/users/me", data),
  uploadAvatar: (form)   => api.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getAgents:    (role)   => api.get("/users/agents", { params: { role } }),
  getAllUsers:  (params)  => api.get("/users", { params }),
  getUserById:  (id)     => api.get(`/users/${id}`),
  updateUser:  (id, d)   => api.patch(`/users/${id}`, d),
  deleteUser:  (id)      => api.delete(`/users/${id}`),
};

export const conversationAPI = {
  getAll:   (params) => api.get("/conversations", { params }),
  create:   (data)   => api.post("/conversations", data),
  getOne:   (id)     => api.get(`/conversations/${id}`),
  update:   (id, d)  => api.patch(`/conversations/${id}`, d),
  remove:   (id)     => api.delete(`/conversations/${id}`),
  getStats: ()       => api.get("/conversations/stats"),
};

export const messageAPI = {
  getMessages: (convId, params) =>
    api.get(`/conversations/${convId}/messages`, { params }),
  send: (convId, data) =>
    api.post(`/conversations/${convId}/messages`, data),
  sendFile: (convId, form) =>
    api.post(`/conversations/${convId}/messages`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  markRead:    (id)     => api.patch(`/messages/${id}/read`),
  markAllRead: (convId) => api.patch(`/conversations/${convId}/read-all`),
  deleteMsg:   (id)     => api.delete(`/messages/${id}`),
};

export const notificationAPI = {
  getAll:      (params) => api.get("/notifications", { params }),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()       => api.patch("/notifications/read-all"),
  deleteOne:   (id)     => api.delete(`/notifications/${id}`),
};