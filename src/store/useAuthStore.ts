import { create } from "zustand";
import { refreshRequest, logoutRequest, LoginResponse, getMeRequest } from "../api/authApi";
import { axiosClient } from "../api/axiosClient";

interface PermisoDetalle {
  codigo: string;
  nombre: string;
}

interface UserData {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
  permisos: PermisoDetalle[];
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
  syncUserFromServer: () => Promise<void>;
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
      permisos: (data.permisos || []).map(p =>
        typeof p === "string" ? { codigo: p, nombre: p } : p
      ),
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
        permisos: (res.permisos || []).map(p =>
          typeof p === "string" ? { codigo: p, nombre: p } : p
        ),
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
          user: {
            ...parsed,
            permisos: parsed.permisos || [],
          },
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
  // 🔄 SINCRONIZAR USUARIO DESDE EL SERVIDOR
  // ===============================
  syncUserFromServer: async () => {
    const { accessToken, user } = get();
    if (!accessToken || !user) return;

    try {
      const meData = await getMeRequest();

      const updatedUser: UserData = {
        email: meData.email || user.email,
        nombre: meData.nombre || user.nombre,
        apellido: meData.apellido || user.apellido,
        telefono: meData.telefono || user.telefono,
        roles: Array.from(meData.roles || user.roles),
        permisos: (meData.permisos || []).map((p: { codigo: string; nombre: string } | string) =>
          typeof p === "string" ? { codigo: p, nombre: p } : p
        ),
        debeCambiarPassword: meData.debeCambiarPassword ?? user.debeCambiarPassword,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err: unknown) {
      // Silently ignore — don't break the UX if sync fails
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("⚠️ Error al sincronizar usuario:", msg);
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
