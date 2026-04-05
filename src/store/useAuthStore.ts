import { create } from "zustand";
import { refreshRequest, logoutRequest, LoginResponse } from "../api/authApi";
import { axiosClient } from "../api/axiosClient";

interface UserData {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
  debeCambiarPassword: boolean;
}

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  loadSession: () => Promise<void>;
  updateDebeCambiarPassword: (value: boolean) => void;
  updateUserProfile: (nombre: string, apellido: string, email: string, telefono?: string) => void;
}

let isLoggingOut = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,

  // ===============================
  // 🔐 LOGIN PRINCIPAL
  // ===============================
  login: (data) => {
    const userInfo = {
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      roles: Array.from(data.roles || []),
      debeCambiarPassword: data.debeCambiarPassword || false,
    };

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userInfo));

    // Actualizar axios inmediatamente
    axiosClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

    set({
      user: userInfo,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      loading: false,
    });
  },

  // ===============================
  // 🚪 LOGOUT GLOBAL SEGURO
  // ===============================
  logout: async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
      await logoutRequest();
    } catch (error) {
      console.error("Error al hacer logout:", error);
    } finally {
      localStorage.clear();
      axiosClient.defaults.headers.Authorization = "";
      set({ user: null, accessToken: null, refreshToken: null, loading: false });
      isLoggingOut = false;
    }
  },

  // ===============================
  // ♻️ REFRESH DE SESIÓN AUTOMÁTICO
  // ===============================
  refreshSession: async () => {
    const { refreshToken, logout } = get();
    if (!refreshToken) return null;

    try {
      const res = await refreshRequest(refreshToken);

      if (!res?.accessToken) {
        console.warn("⚠️ Respuesta inválida del backend, cerrando sesión.");
        await logout();
        return null;
      }

      // ✅ Actualizar tokens y usuario
      const userInfo = {
        email: res.email,
        nombre: res.nombre,
        apellido: res.apellido,
        telefono: res.telefono,
        roles: Array.from(res.roles || []),
        debeCambiarPassword: res.debeCambiarPassword || false,
      };

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Actualizar axios con el nuevo token
      axiosClient.defaults.headers.Authorization = `Bearer ${res.accessToken}`;

      set({
        user: userInfo,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

      console.info("✅ Sesión renovada automáticamente");
      return res.accessToken;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ Error al refrescar sesión:", msg);
      await logout();
      return null;
    }
  },

  // ===============================
  // 🧠 CARGAR SESIÓN DESDE LOCALSTORAGE
  // ===============================
  loadSession: async () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");

    if (token && refresh && userData) {
      try {
        const parsed = JSON.parse(userData);

        // Configurar axios con token
        axiosClient.defaults.headers.Authorization = `Bearer ${token}`;

        set({
          user: parsed,
          accessToken: token,
          refreshToken: refresh,
          loading: false,
        });
      } catch {
        console.warn("⚠️ Datos corruptos en localStorage, cerrando sesión.");
        await get().logout();
      }
    } else {
      set({ loading: false });
    }
  },

  // ===============================
  // 🔄 ACTUALIZAR FLAG debeCambiarPassword
  // ===============================
  updateDebeCambiarPassword: (value: boolean) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, debeCambiarPassword: value };
      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  },

  // ===============================
  // 🧍 ACTUALIZAR PERFIL DE USUARIO
  // ===============================
  updateUserProfile: (nombre, apellido, email, telefono) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, nombre, apellido, email, telefono };
      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  },
}));
