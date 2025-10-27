import axios from "axios";

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
