import axiosClient from "./axiosClient";

export interface Descuento {
  id: number;
  nombre: string;
  porcentaje: number;
  orden: number;
  estado: boolean;
}

export interface CrearDescuentoRequest {
  nombre: string;
  porcentaje: number;
  estado?: boolean;
}

export const DescuentosApi = {
  /**
   * Obtener todos los descuentos
   */
  listarTodos: async (): Promise<Descuento[]> => {
    const { data } = await axiosClient.get("/descuentos");
    return data;
  },

  /**
   * Obtener solo descuentos activos
   */
  listarActivos: async (): Promise<Descuento[]> => {
    const { data } = await axiosClient.get("/descuentos/activos");
    return data;
  },

  /**
   * Obtener descuento por ID
   */
  obtenerPorId: async (id: number): Promise<Descuento> => {
    const { data } = await axiosClient.get(`/descuentos/${id}`);
    return data;
  },

  /**
   * Crear nuevo descuento
   */
  crear: async (descuento: CrearDescuentoRequest): Promise<Descuento> => {
    const { data } = await axiosClient.post("/descuentos", descuento);
    return data;
  },

  /**
   * Actualizar descuento
   */
  actualizar: async (id: number, descuento: CrearDescuentoRequest): Promise<Descuento> => {
    const { data } = await axiosClient.put(`/descuentos/${id}`, descuento);
    return data;
  },

  /**
   * Cambiar estado de descuento
   */
  cambiarEstado: async (id: number, estado: boolean): Promise<Descuento> => {
    const { data } = await axiosClient.patch(`/descuentos/${id}/estado`, { estado });
    return data;
  },

  /**
   * Eliminar descuento
   */
  eliminar: async (id: number): Promise<void> => {
    await axiosClient.delete(`/descuentos/${id}`);
  },

  /**
   * Recalcular orden automático
   */
  recalcularOrden: async (): Promise<void> => {
    await axiosClient.post("/descuentos/recalcular-orden");
  },
};
