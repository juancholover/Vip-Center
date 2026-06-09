import { axiosClient } from "./axiosClient";

export interface DashboardStats {
  clientesActivos: number;
  ingresosMes: number;
  asistenciasHoy: number;
  membresiasPorVencer: number;
  promedioDiario: number;
  ingresosSuplementosMes: number;
  ingresosTotalesMes: number;
}

export interface IngresosDia {
  fecha: string;
  ingresos: number;
}

export interface AsistenciasPorHora {
  hora: string;
  cantidad: number;
}

export interface ActividadReciente {
  id: number;
  tipo: "pago" | "registro" | "asistencia";
  mensaje: string;
  tiempo: string;
  icono: string;
}

export interface TendenciaAsistencia {
  fecha: string;
  cantidad: number;
}

export interface TopCliente {
  id: number;
  nombre: string;
  asistencias: number;
}

export const DashboardApi = {
  /**
   * GET /dashboard/stats
   * Obtiene las estadísticas principales del dashboard
   */
  obtenerEstadisticas: async (): Promise<DashboardStats> => {
    const { data } = await axiosClient.get("/dashboard/stats");
    return data;
  },

  /**
   * GET /dashboard/ingresos-semana
   * Obtiene los ingresos de los últimos 7 días
   */
  obtenerIngresosSemana: async (): Promise<IngresosDia[]> => {
    const { data } = await axiosClient.get("/dashboard/ingresos-semana");
    return data;
  },

  /**
   * GET /dashboard/asistencias-por-hora
   * Obtiene las asistencias agrupadas por hora del día actual
   */
  obtenerAsistenciasPorHora: async (): Promise<AsistenciasPorHora[]> => {
    const { data } = await axiosClient.get("/dashboard/asistencias-por-hora");
    return data;
  },

  /**
   * GET /dashboard/actividad-reciente
   * Obtiene las últimas 10 actividades recientes
   */
  obtenerActividadReciente: async (): Promise<ActividadReciente[]> => {
    const { data } = await axiosClient.get("/dashboard/actividad-reciente");
    return data;
  },

  /**
   * GET /dashboard/asistencias-tendencia
   * HU-26: Obtiene tendencia de asistencias
   */
  obtenerAsistenciasTendencia: async (dias: number = 7): Promise<TendenciaAsistencia[]> => {
    const { data } = await axiosClient.get("/dashboard/asistencias-tendencia", { params: { dias } });
    return data;
  },

  /**
   * GET /dashboard/top-clientes
   * HU-26: Obtiene los clientes con más asistencias
   */
  obtenerTopClientes: async (limite: number = 10): Promise<TopCliente[]> => {
    const { data } = await axiosClient.get("/dashboard/top-clientes", { params: { limite } });
    return data;
  },
};
