import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api/clientes";

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
    return data.map((c: any) => ({
      ...c,
      estado: (c.estado ?? "sin_membresia") as EstadoCliente,
    }));
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
};
