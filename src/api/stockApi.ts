import { axiosClient } from "./axiosClient";
import { Producto } from "./productosApi";

// ===============================
// Types
// ===============================

export interface CrearEntradaStockRequest {
  productoId: number;
  cantidad: number;
  proveedor: string;
  observaciones?: string;
}

export interface EntradaStockResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  proveedor: string;
  fecha: string;
  observaciones?: string;
}

// ===============================
// API Methods
// ===============================

export const StockApi = {
  async registrarEntrada(data: CrearEntradaStockRequest): Promise<EntradaStockResponse> {
    const res = await axiosClient.post("/stock/entradas", data);
    return res.data;
  },

  async entradasPorProducto(productoId: number): Promise<EntradaStockResponse[]> {
    const res = await axiosClient.get(`/stock/entradas/producto/${productoId}`);
    return res.data;
  },

  async alertas(): Promise<Producto[]> {
    const res = await axiosClient.get("/stock/alertas");
    return res.data;
  },
};
