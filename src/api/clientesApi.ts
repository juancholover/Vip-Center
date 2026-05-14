import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api/clientes"; // Full URL (no usa axiosClient)

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
};
