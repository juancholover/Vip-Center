import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8080/api" : "https://vip-center-backend.onrender.com/api");
const BASE_URL = `${API_BASE}/clientes`;

export type EstadoCliente =
  | "activo"
  | "vencido"
  | "qr_deshabilitado";

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string;
  dni?: string;
  email?: string;
  notas?: string;
  estado: EstadoCliente;
  fechaRegistro?: string;          // ✅ agregado
  fechaVencimiento?: string;       // ✅ ya lo tenías
  qrAcceso?: string;
  qrActivo?: boolean;              // ✅ agregado
  registradoPor?: string;
  ultimaAsistencia?: string;       // 🆕 Backend ahora devuelve esto (ISO 8601)
  // Membresía actual
  membresiaActual?: {
    id: number;
    codigo: string;
    nombre: string;
    color?: string;
    duracionDias: number;
  };
}

export interface CrearClienteRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  dni?: string;
  email?: string;
  notas?: string;
}

export interface ClienteInactivoDTO {
  clienteId: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  plan: string;
  fechaVencimiento: string;
  ultimaAsistencia: string;
  diasInactivo: number;
  nivelRiesgo: string;
  colorBadge: string;
}

export interface InactividadResponse {
  totalInactivos: number;
  bajo: number;
  medio: number;
  alto: number;
  critico: number;
  clientes: ClienteInactivoDTO[];
}

export const ClientesApi = {
  // 🔹 Listar todos los clientes
  async listar(): Promise<Cliente[]> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al listar clientes");

    const data = await res.json();

    // ✅ Aseguramos que el tipo `estado` sea siempre válido
    return (data as unknown[]).map((c) => ({
      ...(c as Record<string, unknown>),
      estado: ((c as Record<string, unknown>).estado ?? "vencido") as EstadoCliente,
    })) as unknown as Cliente[];
  },

  // 🔹 Crear cliente
  async crear(data: CrearClienteRequest): Promise<Cliente> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear cliente");
    return res.json();
  },

  // 🔹 Obtener un cliente por ID
  async obtener(id: number): Promise<Cliente> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener cliente");
    const data = await res.json();
    return {
      ...data,
      estado: (data.estado ?? "vencido") as EstadoCliente,
    };
  },

  // 🔹 Actualizar cliente existente
  async actualizar(id: number, data: Partial<Cliente>): Promise<Cliente> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar cliente");
    return res.json();
  },

  // 🔹 Regenerar QR
  async regenerarQr(id: number): Promise<Cliente> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}/regenerar-qr`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Error al regenerar QR");
    return res.json();
  },

  // 🔹 Buscar clientes por texto (nombre, apellido o teléfono)
  async buscar(query: string): Promise<Cliente[]> {
    const token = useAuthStore.getState().accessToken;
    if (!query || query.trim().length < 3) return [];
    
    try {
      const res = await fetch(`${BASE_URL}/buscar?termino=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Si no hay contenido (204), retornar array vacío
      if (res.status === 204) {
        return [];
      }
      
      if (!res.ok) {
        console.error(`Error al buscar clientes: ${res.status} ${res.statusText}`);
        return [];
      }
      
      const data = await res.json();
      return (data as unknown[]).map((c) => ({ 
        ...(c as Record<string, unknown>), 
        estado: ((c as Record<string, unknown>).estado ?? "vencido") as EstadoCliente 
      })) as unknown as Cliente[];
    } catch (err) {
      console.error('Error en ClientesApi.buscar', err);
      return [];
    }
  },

  // 🔹 HU-34: Panel de Alertas de Inactividad
  async obtenerInactividad(diasMinimo: number = 0, nivelRiesgo?: string): Promise<InactividadResponse> {
    const token = useAuthStore.getState().accessToken;
    const url = new URL(`${BASE_URL}/inactividad`);
    url.searchParams.append("diasMinimo", diasMinimo.toString());
    if (nivelRiesgo) url.searchParams.append("nivelRiesgo", nivelRiesgo);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener reporte de inactividad");
    return res.json();
  },

  // 🔹 HU-35: Exportar Base de Inactivos a Excel
  async exportarInactivos(diasMinimo: number = 15): Promise<void> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/exportar-inactivos?diasMinimo=${diasMinimo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al exportar inactivos");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes_inactivos.xlsx";
    a.click();
  },
};
