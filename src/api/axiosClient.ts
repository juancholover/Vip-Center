import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = "http://localhost:8080"; // Cambia si es otro puerto

export const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para inyectar el JWT
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para manejar expiración del token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró y no hemos reintentado aún
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useAuthStore.getState().refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await useAuthStore.getState().refreshSession();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (err) {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
