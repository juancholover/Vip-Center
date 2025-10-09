import { axiosClient } from "./axiosClient";

// ==================== TIPOS ====================

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  fechaBloqueo?: string;
  roles: Rol[];
  fechaCreacion: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
}

export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  modulo: string; // usuarios, clientes, pagos, reportes, etc.
}

export interface CrearEmpleadoRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
  rolesIds: number[];
}

export interface ActualizarEmpleadoRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  rolesIds?: number[];
  activo?: boolean;
}

export interface CrearRolRequest {
  nombre: string;
  descripcion?: string;
  permisosIds: number[];
}

export interface ActualizarRolRequest {
  nombre?: string;
  descripcion?: string;
  permisosIds?: number[];
}

export interface ActualizarPerfilRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

export interface CambiarPasswordPerfilRequest {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export interface SesionActiva {
  id: number;
  dispositivo: string;
  ip: string;
  fechaInicio: string;
  ultimaActividad: string;
}

export interface HistorialAcceso {
  id: number;
  accion: string;
  fecha: string;
  ip: string;
  dispositivo: string;
  exitoso: boolean;
}

// ==================== EMPLEADOS ====================

export const obtenerEmpleadosRequest = async (): Promise<Empleado[]> => {
  const response = await axiosClient.get("/api/usuarios");
  return response.data;
};

export const obtenerEmpleadoPorIdRequest = async (id: number): Promise<Empleado> => {
  const response = await axiosClient.get(`/api/usuarios/${id}`);
  return response.data;
};

export const crearEmpleadoRequest = async (data: CrearEmpleadoRequest): Promise<Empleado> => {
  const response = await axiosClient.post("/api/usuarios", data);
  return response.data;
};

export const actualizarEmpleadoRequest = async (
  id: number,
  data: ActualizarEmpleadoRequest
): Promise<Empleado> => {
  const response = await axiosClient.put(`/api/usuarios/${id}`, data);
  return response.data;
};

export const eliminarEmpleadoRequest = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/usuarios/${id}`);
};

export const desbloquearEmpleadoRequest = async (id: number): Promise<void> => {
  await axiosClient.post(`/api/usuarios/${id}/desbloquear`);
};

// ==================== ROLES ====================

export const obtenerRolesRequest = async (): Promise<Rol[]> => {
  const response = await axiosClient.get("/api/roles");
  return response.data;
};

export const obtenerRolPorIdRequest = async (id: number): Promise<Rol> => {
  const response = await axiosClient.get(`/api/roles/${id}`);
  return response.data;
};

export const crearRolRequest = async (data: CrearRolRequest): Promise<Rol> => {
  const response = await axiosClient.post("/api/roles", data);
  return response.data;
};

export const actualizarRolRequest = async (
  id: number,
  data: ActualizarRolRequest
): Promise<Rol> => {
  const response = await axiosClient.put(`/api/roles/${id}`, data);
  return response.data;
};

export const eliminarRolRequest = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/roles/${id}`);
};

// ==================== PERMISOS ====================

export const obtenerPermisosRequest = async (): Promise<Permiso[]> => {
  const response = await axiosClient.get("/api/permisos");
  return response.data;
};

// ==================== PERFIL DE USUARIO ====================

export const obtenerMiPerfilRequest = async (): Promise<Empleado> => {
  const response = await axiosClient.get("/api/auth/usuarios/me");
  return response.data;
};

export const actualizarMiPerfilRequest = async (
  data: ActualizarPerfilRequest
): Promise<Empleado> => {
  const response = await axiosClient.put("/api/auth/usuarios/me", data);
  return response.data;
};

export const cambiarMiPasswordRequest = async (
  data: CambiarPasswordPerfilRequest
): Promise<void> => {
  await axiosClient.post("/api/auth/usuarios/me/cambiar-password", data);
};

export const obtenerMisSesionesRequest = async (): Promise<SesionActiva[]> => {
  const response = await axiosClient.get("/api/auth/usuarios/me/sesiones");
  return response.data;
};

export const invalidarSesionRequest = async (sesionId: number): Promise<void> => {
  await axiosClient.delete(`/api/auth/usuarios/me/sesiones/${sesionId}`);
};

export const obtenerMiHistorialRequest = async (): Promise<HistorialAcceso[]> => {
  const response = await axiosClient.get("/api/auth/usuarios/me/historial");
  return response.data;
};
