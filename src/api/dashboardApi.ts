import { axiosClient } from "./axiosClient";

export interface DashboardStats {
  clientesActivos: number;
  ingresosMes: number;
  asistenciasHoy: number;
  membresiasPorVencer: number;
  promedioDiario: number;
}

export interface IngresosDia {
  fecha: string;
  ingresos: number;
}

export interface AsistenciasPorHora {
  hora: string;
  cantidad: number;
}

export interface AsistenciaTendencia {
  fecha: string;
  cantidad: number;
}

export interface TopCliente {
  id: number;
  nombre: string;
  asistencias: number;
}

export interface ActividadReciente {
  id: number;
  tipo: "pago" | "registro" | "asistencia";
  mensaje: string;
  tiempo: string;
  icono: string;
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
   * GET /dashboard/asistencias-tendencia
   * Obtiene la tendencia de asistencias de los últimos días
   */
  obtenerAsistenciasTendencia: async (dias: number = 7): Promise<AsistenciaTendencia[]> => {
    const { data } = await axiosClient.get("/dashboard/asistencias-tendencia", {
      params: { dias },
    });
    return data;
  },

  /**
   * GET /dashboard/top-clientes
   * Obtiene los clientes con mayor cantidad de asistencias
   */
  obtenerTopClientes: async (limite: number = 10): Promise<TopCliente[]> => {
    const { data } = await axiosClient.get("/dashboard/top-clientes", {
      params: { limite },
    });
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
};
