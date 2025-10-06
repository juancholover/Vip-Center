import { create } from "zustand";
import { refreshRequest } from "../api/authApi";

interface AuthState {
  user: { email: string; nombreCompleto: string; roles: string[] } | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
  refreshSession: () => Promise<string | null>;
  loadSession: () => Promise<void>;
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
        nombreCompleto: data.nombreCompleto,
        roles: Array.from(data.roles),
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      loading: false,
    });
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null, loading: false });
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

  // ✅ Cargar sesión guardada y validar token
  loadSession: async () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");

    if (token && refresh && userData) {
      try {
        const parsed = JSON.parse(userData);
        set({
          user: parsed,
          accessToken: token,
          refreshToken: refresh,
          loading: false,
        });
        // Intentar refrescar el token al cargar
        await get().refreshSession();
      } catch {
        get().logout();
      }
    } else {
      set({ loading: false });
    }
  },
}));
