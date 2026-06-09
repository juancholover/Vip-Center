import { axiosClient } from "./axiosClient";

// ===============================
// Types
// ===============================

export interface DetalleVentaSuplementoRequest {
  productoId: number;
  cantidad: number;
}

export interface CrearVentaSuplementoRequest {
  clienteId?: number;
  metodoPago: string;
  detalles: DetalleVentaSuplementoRequest[];
}

export interface DetalleVentaSuplementoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaSuplementoResponse {
  id: number;
  fecha: string;
  clienteId?: number;
  clienteNombre?: string;
  recepcionistaId: number;
  recepcionistaNombre: string;
  total: number;
  metodoPago: string;
  detalles: DetalleVentaSuplementoResponse[];
}

// ===============================
// API Methods
// ===============================

export const VentasSuplementoApi = {
  async crear(data: CrearVentaSuplementoRequest): Promise<VentaSuplementoResponse> {
    const res = await axiosClient.post("/ventas-suplementos", data);
    return res.data;
  },

  async ventasDelDia(): Promise<VentaSuplementoResponse[]> {
    const res = await axiosClient.get("/ventas-suplementos/diario");
    return res.data;
  },

  async buscarPorId(id: number): Promise<VentaSuplementoResponse> {
    const res = await axiosClient.get(`/ventas-suplementos/${id}`);
    return res.data;
  },
};
