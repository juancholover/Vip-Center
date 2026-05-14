import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

const API_BASE = "http://localhost:8080/api";

export const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// 🧠 1️⃣ Interceptor de REQUEST → adjunta el token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧠 2️⃣ Interceptor de RESPONSE → maneja expiración y refresh automático
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, refreshSession, logout } = useAuthStore.getState();
    const notify = useNotificationStore.getState().show;

    // Evita reintentos si estamos en una ruta de auth (/login, /refresh, /logout)
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // Si no hay refresh token o no fue 401 → devolver error normal
    if (error.response?.status !== 401 || !refreshToken) {
      return Promise.reject(error);
    }

    // Evita reintentos infinitos
    if (originalRequest._retry) {
      await logout();
      notify("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.", "error");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 🔄 Intenta refrescar sesión
      const newAccessToken = await refreshSession();
      if (!newAccessToken) throw new Error("No se pudo renovar token");

      // ✅ Actualiza token en cabecera y repite solicitud original
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      notify("🔄 Sesión renovada automáticamente", "info");
      return axiosClient(originalRequest);
    } catch (refreshError) {
      console.error("Error en refresh token:", refreshError);
      await logout();
      notify("🔒 Tu sesión ha caducado. Inicia sesión otra vez.", "error");
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
