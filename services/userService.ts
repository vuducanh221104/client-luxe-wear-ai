import api from "./http";

export async function getProfile() {
  const res = await api.get(`/users/profile`);
  return res.data;
}

export async function updateProfile(payload: { name?: string; phone?: string; website?: string }) {
  const res = await api.put(`/users/profile`, payload);
  return res.data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await api.post(`/users/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteAvatar() {
  const res = await api.delete(`/users/avatar`);
  return res.data;
}

// Admin APIs
export async function adminListUsers(params?: { page?: number; perPage?: number; q?: string }) {
  const res = await api.get(`/users`, { params });
  return res.data;
}

export async function adminUpdateUser(userId: string, payload: { role?: string; is_active?: boolean; name?: string; email?: string }) {
  const res = await api.put(`/users/${userId}`, payload);
  return res.data;
}

export async function adminDeleteUser(userId: string) {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
}

export async function adminResetPassword(userId: string, newPassword?: string) {
  const res = await api.put(`/users/${userId}/password`, { newPassword: newPassword || "Temp#" + Math.random().toString(36).slice(2, 8) });
  return res.data;
}
