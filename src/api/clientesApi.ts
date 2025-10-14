import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api/clientes"; // Full URL (no usa axiosClient)

export type EstadoCliente =
  | "activo"
  | "vencido"
  | "sin_membresia"
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
      estado: ((c as Record<string, unknown>).estado ?? "sin_membresia") as EstadoCliente,
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

  // 🔹 Buscar clientes por texto (dni, teléfono, nombre)
  // Nota: se asume que el backend expone un endpoint GET /api/clientes/search?q=...
  async buscar(query: string): Promise<Cliente[]> {
    const token = useAuthStore.getState().accessToken;
    if (!query || query.trim().length < 2) return [];
    // Primero intentamos el endpoint /search (común en implementaciones)
    try {
      let res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // si no existe, intentamos fallback a /api/clientes?q=
        res = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (!res.ok) return [];
  const data = await res.json();
  return (data as unknown[]).map((c) => ({ ...(c as Record<string, unknown>), estado: ((c as Record<string, unknown>).estado ?? "sin_membresia") as EstadoCliente })) as unknown as Cliente[];
    } catch (err) {
      console.error('Error en ClientesApi.buscar', err);
      return [];
    }
  },
};
