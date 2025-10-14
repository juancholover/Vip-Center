import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api/membresias";

export interface Membresia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio: number;
  precioDescuento?: number;
  precioEfectivo: number;
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  activa: boolean;
  color?: string;
  orden: number;
  beneficios?: string | string[]; // 🔧 Puede venir como string o array desde el backend
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface CrearMembresiaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio: number;
  precioDescuento?: number;
  activa: boolean;
  color?: string;
  orden: number;
  beneficios: string; // Separado por comas
}

export const MembresiasApi = {
  // 🔓 Público - Listar membresías activas (para página de ventas/suscripción)
  async listarActivas(): Promise<Membresia[]> {
    const res = await fetch(`${BASE_URL}/activas`);
    if (!res.ok) throw new Error("Error al listar membresías activas");
    return res.json();
  },

  // 🔓 Público - Obtener membresía por código
  async obtenerPorCodigo(codigo: string): Promise<Membresia> {
    const res = await fetch(`${BASE_URL}/codigo/${codigo}`);
    if (!res.ok) throw new Error("Membresía no encontrada");
    return res.json();
  },

  // 🔒 Protegido - Listar todas las membresías (incluye inactivas)
  async listar(): Promise<Membresia[]> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al listar membresías");
    return res.json();
  },

  // 🔒 Protegido - Obtener membresía por ID
  async obtenerPorId(id: number): Promise<Membresia> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Membresía no encontrada");
    return res.json();
  },

  // 🔒 Protegido - Crear membresía (Solo ADMIN)
  async crear(data: CrearMembresiaRequest): Promise<Membresia> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al crear membresía");
    }
    return res.json();
  },

  // 🔒 Protegido - Actualizar membresía (Solo ADMIN)
  async actualizar(id: number, data: CrearMembresiaRequest): Promise<Membresia> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al actualizar membresía");
    }
    return res.json();
  },

  // 🔒 Protegido - Cambiar estado (activar/desactivar) (Solo ADMIN)
  async cambiarEstado(id: number, activa: boolean): Promise<Membresia> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}/estado?activa=${activa}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al cambiar estado de membresía");
    }
    return res.json();
  },

  // 🔒 Protegido - Eliminar membresía (soft delete) (Solo ADMIN)
  async eliminar(id: number): Promise<void> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al eliminar membresía");
    }
  },
};
