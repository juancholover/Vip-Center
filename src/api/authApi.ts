import { axiosClient } from "../api/axiosClient";

// ===============================
// 📘 Tipos para TypeScript
// ===============================
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  userId?: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
  permisos?: Array<{ codigo: string; nombre: string }>;
  debeCambiarPassword: boolean;
}

export interface CambiarPasswordRequest {
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface ActualizarPasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

// ===============================
// 🔐 LOGIN
// ===============================
export async function loginRequest(credentials: { email: string; password: string }): Promise<LoginResponse> {
  try {
    const res = await axiosClient.post<LoginResponse>("/auth/login", credentials);
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("❌ Error en login:", msg);
    throw err;
  }
}

// ===============================
// 🔁 REFRESH TOKEN
// ===============================
export async function refreshRequest(refreshToken: string): Promise<LoginResponse> {
  try {
    const res = await axiosClient.post<LoginResponse>("/auth/refresh", { refreshToken });
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("⚠️ Error al refrescar token:", msg);
    throw err;
  }
}

// ===============================
// 🔑 CAMBIO DE CONTRASEÑA OBLIGATORIO
// ===============================
export async function cambiarPasswordRequest(data: CambiarPasswordRequest) {
  try {
    const res = await axiosClient.post("/auth/change-password", data);
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("❌ Error al cambiar contraseña:", msg);
    throw err;
  }
}

// ===============================
// 🔒 ACTUALIZAR CONTRASEÑA MANUAL (perfil)
// ===============================
export async function actualizarPasswordRequest(data: ActualizarPasswordRequest) {
  try {
    const res = await axiosClient.post("/auth/update-password", data);
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("❌ Error al actualizar contraseña:", msg);
    throw err;
  }
}

// ===============================
// 🚪 LOGOUT (invalida refresh token en backend)
// ===============================
export async function logoutRequest() {
  try {
    const res = await axiosClient.post("/auth/logout");
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("⚠️ Error al cerrar sesión:", msg);
    throw err;
  }
}

// ===============================
// 🙋 PERFIL ACTUAL (me)
// ===============================
export async function getMeRequest() {
  try {
    const res = await axiosClient.get("/auth/me");
    return res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("⚠️ Error al obtener perfil:", msg);
    throw err;
  }
}
