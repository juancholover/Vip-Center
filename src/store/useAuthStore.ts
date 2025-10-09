import { create } from "zustand";
import { refreshRequest, logoutRequest, LoginResponse } from "../api/authApi";

interface AuthState {
  user: { 
    email: string; 
    nombre: string;
    apellido: string;
    telefono?: string;
    roles: string[];
    debeCambiarPassword: boolean; // ⚠️ Nuevo campo
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  loadSession: () => Promise<void>;
  updateDebeCambiarPassword: (value: boolean) => void; // ⚠️ Nuevo método
  updateUserProfile: (nombre: string, apellido: string, email: string, telefono?: string) => void; // ⚠️ NUEVO: actualizar perfil
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,

  login: (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data));
    set({
      user: {
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        roles: Array.from(data.roles),
        debeCambiarPassword: data.debeCambiarPassword || false, // ⚠️ Guardar flag
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      loading: false,
    });
  },

  logout: async () => {
    try {
      // Intentar invalidar token en backend
      await logoutRequest();
    } catch (error) {
      console.error("Error al hacer logout:", error);
    } finally {
      // Limpiar localStorage siempre
      localStorage.clear();
      set({ user: null, accessToken: null, refreshToken: null, loading: false });
    }
  },

  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return null;
    try {
      const data = await refreshRequest(refreshToken);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data.accessToken;
    } catch {
      get().logout();
      return null;
    }
  },

  // ✅ Cargar sesión guardada (sin refrescar automáticamente)
  loadSession: async () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");

    if (token && refresh && userData) {
      try {
        const parsed = JSON.parse(userData);
        set({
          user: {
            ...parsed,
            debeCambiarPassword: parsed.debeCambiarPassword || false,
          },
          accessToken: token,
          refreshToken: refresh,
          loading: false,
        });
        // ⚠️ NO refrescar automáticamente - solo cuando sea necesario (401)
      } catch {
        get().logout();
      }
    } else {
      set({ loading: false });
    }
  },

  // ⚠️ Actualizar flag de cambio de contraseña
  updateDebeCambiarPassword: (value: boolean) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, debeCambiarPassword: value };
      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  },

  // ⚠️ NUEVO: Actualizar datos del perfil del usuario
  updateUserProfile: (nombre: string, apellido: string, email: string, telefono?: string) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        nombre,
        apellido,
        email,
        telefono 
      };
      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  },
}));
