import { axiosClient } from "./axiosClient";

// ========== INTERFACES ==========

export interface ClienteInactivoDTO {
  clienteId: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  plan: string;
  fechaVencimiento: string;
  ultimaAsistencia: string | null;
  diasInactivo: number;
  nivelRiesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  colorBadge: string;
}

export interface InactividadResponse {
  totalInactivos: number;
  bajo: number;
  medio: number;
  alto: number;
  critico: number;
  clientes: ClienteInactivoDTO[];
}

// ========== API ==========

export const InactividadApi = {
  /**
   * GET /clientes/inactividad
   * Obtiene panel de alertas de inactividad (HU-34)
   */
  obtenerClientesInactivos: async (
    diasMinimo: number = 0,
    nivelRiesgo?: string
  ): Promise<InactividadResponse> => {
    const { data } = await axiosClient.get("/clientes/inactividad", {
      params: { diasMinimo, nivelRiesgo },
    });
    return data;
  },

  /**
   * GET /clientes/exportar-inactivos
   * Exportar base de inactivos a Excel (HU-35) — Solo ADMIN
   */
  exportarClientesInactivos: async (diasMinimo: number = 15): Promise<Blob> => {
    const { data } = await axiosClient.get("/clientes/exportar-inactivos", {
      params: { diasMinimo },
      responseType: "blob",
    });
    return data;
  },
};
