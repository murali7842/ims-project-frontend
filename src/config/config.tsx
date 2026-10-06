import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { clearAuth, getRefreshToken, getToken, setTokens } from "../apps/utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Public endpoints (login, register, forgot/reset password)
export const axiosLoginInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authenticated endpoints: adds the bearer token and refreshes it on 401
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared so parallel 401s only trigger one refresh call
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axiosLoginInstance.post("auth/refresh-token", {
    refresh_token: refreshToken,
  });
  const tokens = response.data.body;
  setTokens(tokens.access_token, tokens.refresh_token);
  return tokens.access_token as string;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch {
        clearAuth();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);
