import { axiosClient } from "./axiosClient";

// ========== INTERFACES ==========

export interface ReporteIngresosDTO {
  anio: number;
  mes: number;
  nombreMes: string;
  totalIngresos: number;
  totalTransacciones: number;
  ingresosPorEstado: {
    approved: number;
    pending: number;
    cancelled: number;
  };
  desglosePorMetodo: Array<{
    metodoPago: string;
    total: number;
    cantidad: number;
  }>;
}

// Interface auxiliar para mantener compatibilidad con el código existente
export interface ReporteIngresosMensualDTO {
  periodo: string;
  totalIngresos: number;
  cantidadPagos: number;
  promedioTicket: number;
  ingresosAprobados: number;
  ingresosPendientes: number;
  ingresosRechazados: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface ReporteAsistenciaClienteDTO {
  clienteId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  totalAsistencias: number;
  primeraAsistencia: string;
  ultimaAsistencia: string;
  promedioAsistenciasMes: number;
  estadoMembresia: string;
  fechaVencimiento: string;
}

export interface ReporteMembresiaDTO {
  membresiaId: number;
  nombreMembresia: string;
  precioBase: number;
  duracionDias: number;
  cantidadVentas: number;
  totalIngresos: number;
  promedioIngresoMensual: number;
  clientesActivos: number;
  clientesVencidos: number;
  tasaRetencion: number;
}

export interface ReporteComparativoDTO {
  metrica: string;
  valorPeriodoActual: number;
  valorPeriodoAnterior: number;
  diferencia: number;
  porcentajeCambio: number;
  tendencia: "alza" | "bajada" | "estable";
  periodo: string;
}

// ========== API ==========

export const ReportesApi = {
  /**
   * GET /reportes/ingresos/mensual
   * Obtiene reporte de ingresos de un mes específico
   */
  obtenerIngresosMensual: async (anio: number, mes: number): Promise<ReporteIngresosDTO> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/mensual`, {
      params: { anio, mes },
    });
    return data;
  },

  /**
   * GET /reportes/ingresos/anual
   * Obtiene reporte de ingresos mes a mes de un año
   */
  obtenerIngresosAnual: async (anio: number): Promise<ReporteIngresosDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/anual`, {
      params: { anio },
    });
    return data;
  },

  /**
   * GET /reportes/asistencias/por-cliente
   * Obtiene reporte de asistencias agrupadas por cliente
   */
  obtenerAsistenciasPorCliente: async (
    inicio: string,
    fin: string
  ): Promise<ReporteAsistenciaClienteDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/por-cliente`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/membresias/mas-vendidas
   * Obtiene ranking de membresías más rentables
   */
  obtenerMembresiasMasVendidas: async (
    inicio: string,
    fin: string
  ): Promise<ReporteMembresiaDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/membresias/mas-vendidas`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/comparativo
   * Obtiene comparativa mes actual vs mes anterior
   */
  obtenerComparativo: async (): Promise<ReporteComparativoDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/comparativo`);
    return data;
  },
};
