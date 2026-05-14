import { axiosClient } from "./axiosClient";

// ========== INTERFACES ==========

export interface ClientePorVencerDTO {
  clienteId: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  plan: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estadoSeguimiento: "PENDIENTE" | "LLAMADO" | "PROMESA";
  avatar: string;
}

export interface ActualizarSeguimientoResponse {
  clienteId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  mensaje: string;
}

// ========== API ==========

export const RecepcionApi = {
  /**
   * GET /recepcion/por-vencer
   * Obtiene la lista de clientes por vencer ordenada por prioridad
   */
  obtenerClientesPorVencer: async (dias: number = 15): Promise<ClientePorVencerDTO[]> => {
    const { data } = await axiosClient.get("/recepcion/por-vencer", {
      params: { dias },
    });
    return data;
  },

  /**
   * PATCH /recepcion/clientes/{id}/seguimiento
   * Actualiza el estado de seguimiento de un cliente
   */
  actualizarEstadoSeguimiento: async (
    clienteId: number,
    estadoSeguimiento: "PENDIENTE" | "LLAMADO" | "PROMESA"
  ): Promise<ActualizarSeguimientoResponse> => {
    const { data } = await axiosClient.patch(
      `/recepcion/clientes/${clienteId}/seguimiento`,
      { estadoSeguimiento }
    );
    return data;
  },
};
