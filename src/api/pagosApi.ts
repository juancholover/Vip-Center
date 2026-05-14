import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_URL || "https://vip-center-backend.onrender.com/api";
const BASE = `${API_BASE}/pagos`;

export interface CrearPreferenciaPayload {
  clienteId: number;
  planNombre: string;
  planDias: number;
  monto: number; // total
  emailCliente: string;
  metodoPagoPreferido?: 'yape' | 'tarjeta' | 'todos'; // nuevo campo opcional
  membresiaId?: number; // ID de la membresía seleccionada
}

export async function crearPreferencia(data: CrearPreferenciaPayload) {
  const token = useAuthStore.getState().accessToken;
  // El backend expone POST /api/pagos/crear (ver PagoController)
  const res = await fetch(`${BASE}/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear la preferencia de pago");
  return res.json() as Promise<{ initPoint: string; preferenceId: string }>;
}

// Nueva función específica para pagos con Yape prioritario
export async function crearPreferenciaConYape(data: Omit<CrearPreferenciaPayload, 'metodoPagoPreferido'>) {
  return crearPreferencia({
    ...data,
    metodoPagoPreferido: 'yape'
  });
}

export interface CrearPagoConYapePayload {
  token: string;
  clienteId: number;
  planNombre: string;
  planDias: number;
  monto: number;
  emailCliente: string;
  membresiaId?: number; // ID de la membresía seleccionada
}

export async function crearPagoConYape(data: CrearPagoConYapePayload) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE}/crear-con-yape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  // devolver el json tal cual el backend lo envía (status, message, preferenceId, etc.)
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err && err.message) || "Error al procesar pago con Yape");
  }
  return res.json();
}
