import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8080/api" : "https://vip-center-backend.onrender.com/api");
const BASE_URL = `${API_BASE}/pagos`;

export interface CrearPreferenciaPayload {
  clienteId: number;
  planNombre: string;
  planDias: number;
  monto: number;
  emailCliente: string;
  membresiaId?: number;
}

export interface CrearPreferenciaResponse {
  initPoint: string;
  preferenceId: string;
}

export type MetodoPagoManual = "Yape" | "Plin" | "Efectivo" | "Transferencia";

export interface RegistrarPagoManualPayload {
  membresiaId: number;
  planDias: number;
  monto: number;
  planNombre: string;
  metodoPago: MetodoPagoManual;
}

export async function crearPreferencia(data: CrearPreferenciaPayload) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE_URL}/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err && err.message) || "No se pudo crear la preferencia de pago");
  }
  return res.json() as Promise<CrearPreferenciaResponse>;
}

export async function registrarPagoManual(
  clienteId: number,
  data: RegistrarPagoManualPayload
) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE_URL}/${clienteId}/registrar-manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err && (err.message || err.error)) || "No se pudo registrar el pago manual");
  }
  return res.json() as Promise<{ message?: string; clienteId?: number; preferenceId?: string; [k: string]: unknown }>;
}

export async function descargarComprobante(pagoId: string | number) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE_URL}/${pagoId}/comprobante`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("No se pudo obtener el comprobante de pago");
  }
  return res.blob();
}
