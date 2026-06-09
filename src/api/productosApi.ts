import { axiosClient } from "./axiosClient";

// ===============================
// Types
// ===============================

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  stockBajo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface CrearProductoRequest {
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stockActual?: number;
  stockMinimo?: number;
}

export interface ActualizarProductoRequest {
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
}

// ===============================
// API Methods
// ===============================

export const ProductosApi = {
  async listar(): Promise<Producto[]> {
    const res = await axiosClient.get("/productos");
    return res.data;
  },

  async buscarPorId(id: number): Promise<Producto> {
    const res = await axiosClient.get(`/productos/${id}`);
    return res.data;
  },

  async crear(data: CrearProductoRequest): Promise<Producto> {
    const res = await axiosClient.post("/productos", data);
    return res.data;
  },

  async actualizar(id: number, data: ActualizarProductoRequest): Promise<Producto> {
    const res = await axiosClient.put(`/productos/${id}`, data);
    return res.data;
  },

  async desactivar(id: number): Promise<Producto> {
    const res = await axiosClient.patch(`/productos/${id}/desactivar`);
    return res.data;
  },

  async buscar(termino: string): Promise<Producto[]> {
    const res = await axiosClient.get("/productos/buscar", { params: { termino } });
    return res.data;
  },

  async buscarPorCategoria(categoria: string): Promise<Producto[]> {
    const res = await axiosClient.get(`/productos/categoria/${categoria}`);
    return res.data;
  },

  async productosConStockBajo(): Promise<Producto[]> {
    const res = await axiosClient.get("/productos/stock-bajo");
    return res.data;
  },
};
