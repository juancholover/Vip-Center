import { axiosClient } from "./axiosClient";

// 🔐 Tipos para TypeScript
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
  permisos: string[];
  debeCambiarPassword: boolean; // ⚠️ FLAG CRÍTICO
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

// 🔹 Login
export async function loginRequest(credentials: { email: string; password: string }): Promise<LoginResponse> {
  const res = await axiosClient.post<LoginResponse>("/api/auth/login", credentials);
  return res.data;
}

// 🔹 Refresh Token
export async function refreshRequest(refreshToken: string): Promise<LoginResponse> {
  const res = await axiosClient.post<LoginResponse>("/api/auth/refresh", { refreshToken });
  return res.data;
}

// 🔹 Cambiar contraseña obligatoria (primer login)
export async function cambiarPasswordRequest(data: CambiarPasswordRequest) {
  const res = await axiosClient.post("/api/auth/change-password", data);
  return res.data;
}

// 🔹 Actualizar contraseña personal
export async function actualizarPasswordRequest(data: ActualizarPasswordRequest) {
  const res = await axiosClient.post("/api/auth/update-password", data);
  return res.data;
}

// 🔹 Logout
export async function logoutRequest() {
  const res = await axiosClient.post("/api/auth/logout");
  return res.data;
}

// 🔹 Obtener perfil actual
export async function getMeRequest() {
  const res = await axiosClient.get("/api/auth/me");
  return res.data;
}
