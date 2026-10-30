import axios from "axios";
import { useAuth } from "~/zustand/store";

const backendUrl = import.meta.env.VITE_BACKEND_APP_URL;

let refreshPromise: Promise<boolean> | null = null;

const PROTECTED_PREFIXES = ["/dashboard"];

export const forceLogout = () => {
  useAuth.getState().logout();
  useAuth.getState().setUser(null);

  const path = window.location.pathname;
  const isProtectedRoute = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (isProtectedRoute && path !== "/auth") {
    window.location.href = "/auth";
  }
};

// dedupe concurrent 401s into a single in-flight refresh call
const refreshAccessToken = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${backendUrl}/api/v1/auth/refresh-token`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// fetch wrapper: on 401, refresh once and retry the request once
export const apiFetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
  const res = await fetch(input, { credentials: "include", ...init });
  if (res.status !== 401) return res;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    forceLogout();
    return res;
  }

  const retried = await fetch(input, { credentials: "include", ...init });
  if (retried.status === 401) forceLogout();
  return retried;
};

export const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status !== 401 || !originalRequest || originalRequest._retried) {
      return Promise.reject(error);
    }
    originalRequest._retried = true;

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      forceLogout();
      return Promise.reject(error);
    }

    return axiosInstance(originalRequest);
  },
);
