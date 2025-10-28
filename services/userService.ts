import axios from "axios";
import api from "./http";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
const API_PREFIX = "/api";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      name?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    requiresEmailConfirmation?: boolean;
  };
  errors?: Array<{ msg: string; param?: string }>; // from express-validator
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_BASE_URL}${API_PREFIX}/auth/login`, {
    email,
    password
  });
  return res.data;
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_BASE_URL}${API_PREFIX}/auth/register`, {
    email,
    password,
    name
  });
  return res.data;
}

export function saveTokens(accessToken?: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

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
