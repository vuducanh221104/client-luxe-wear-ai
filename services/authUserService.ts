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
      role?: string;
    };
    accessToken?: string;
    refreshToken?: string;
    requiresEmailConfirmation?: boolean;
  };
  errors?: Array<{ msg: string; param?: string }>;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/login`, {
    email,
    password,
  });

  // Normalize server payload { token, refreshToken } -> { accessToken, refreshToken }
  const payload = res.data as {
    success: boolean;
    message: string;
    data?: any;
  };

  if (payload?.data) {
    const { token, refreshToken, user, ...rest } = payload.data;
    return {
      ...payload,
      data: {
        ...rest,
        user,
        accessToken: token,
        refreshToken,
      },
    } as AuthResponse;
  }

  return payload as AuthResponse;
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/register`, {
    email,
    password,
    name,
  });

  const payload = res.data as { success: boolean; message: string; data?: any };
  if (payload?.data) {
    const { token, refreshToken, user, ...rest } = payload.data;
    return {
      ...payload,
      data: {
        ...rest,
        user,
        accessToken: token,
        refreshToken,
      },
    } as AuthResponse;
  }
  return payload as AuthResponse;
}

export function getOAuthUrl(provider: "google" | "github"): string {
  return `${API_BASE_URL}${API_PREFIX}/auth/${provider}`;
}

export async function getMe(): Promise<{
  success: boolean;
  message: string;
  data?: { user?: any; memberships?: any[] };
}> {
  const token = getAccessToken();
  const res = await axios.get(`${API_BASE_URL}${API_PREFIX}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function refreshToken(refreshToken: string): Promise<{ success: boolean; message: string; data?: { accessToken?: string } }> {
  const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
    refreshToken,
  });
  // server returns { token } -> normalize to accessToken
  const payload = res.data as { success: boolean; message: string; data?: any };
  if (payload?.data && "token" in payload.data) {
    return {
      ...payload,
      data: { accessToken: payload.data.token },
    };
  }
  return payload as any;
}

export async function forgotPassword(email: string) {
  const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/forgot-password`, { email });
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const token = getAccessToken();
  const res = await axios.post(
    `${API_BASE_URL}${API_PREFIX}/auth/change-password`,
    { currentPassword, newPassword },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  );
  return res.data;
}

export async function verifyTokenApi(token: string) {
  const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/verify-token`, { token });
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

export async function logout(): Promise<void> {
  try {
    const token = getAccessToken();
    if (token) {
      await axios.post(
        `${API_BASE_URL}${API_PREFIX}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch {
    // ignore API errors on client logout
  } finally {
    clearTokens();
  }
}


