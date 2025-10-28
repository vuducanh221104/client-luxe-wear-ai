import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
export const API_PREFIX = "/api";

const api = axios.create({ baseURL: `${API_BASE_URL}${API_PREFIX}` });

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  // Attach tenant header if available
  if (typeof window !== "undefined") {
    const tenantId = localStorage.getItem("currentTenant");
    if (tenantId) {
      config.headers = config.headers ?? {};
      (config.headers as any)["X-Tenant-Id"] = tenantId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      const doRefresh = async () => {
        const rToken = getRefreshToken();
        if (!rToken) throw error;
        const { data } = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
          refreshToken: rToken,
        });
        const newToken = data?.data?.token || data?.data?.accessToken;
        if (!newToken) throw error;
        setAccessToken(newToken);
        return newToken as string;
      };

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(error);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      try {
        isRefreshing = true;
        const token = await doRefresh();
        pendingQueue.forEach((cb) => cb(token));
        pendingQueue = [];
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (e) {
        pendingQueue.forEach((cb) => cb(null));
        pendingQueue = [];
        clearTokens();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export default api;


