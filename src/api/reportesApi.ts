import { axiosClient } from "./axiosClient";

// ========== INTERFACES ==========

export interface ReporteIngresosDTO {
  periodo: string;
  totalIngresos: number;
  cantidadPagos: number;
  promedioTicket: number;
  ingresosAprobados: number;
  ingresosPendientes: number;
  ingresosRechazados: number;
  fechaInicio: string;
  fechaFin: string;
  // Propiedades adicionales para reporte anual detallado
  mes?: number;
  anio?: number;
  nombreMes?: string;
  totalTransacciones?: number;
  ingresosPorEstado?: {
    approved: number;
    pending: number;
    cancelled: number;
  };
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
  tendencia: "subida" | "bajada" | "estable";
  periodo: string;
}

export interface ReporteTendenciaDTO {
  fecha: string;
  valor?: number;
  monto?: number;
}

export interface ReporteHoraPicoDTO {
  hora: string;
  intensidad: number;
}

export interface ReporteClienteAusenteDTO {
  clienteId: number;
  nombreCompleto: string;
  avatar: string;
  diasAusente: number;
  ultimaVisita: string;
  estadoMembresia: string;
}

export interface ReporteDistribucionDTO {
  name: string;
  value: number;
  color: string;
}

export interface ReporteClienteProximoVencerDTO {
  clienteId: number;
  nombreCompleto: string;
  avatar: string;
  plan: string;
  diasRestantes: number;
  estado: string;
}

export interface ReporteAsistenciaRecienteDTO {
  asistenciaId: number;
  nombreCompleto: string;
  avatar: string;
  hora: string;
  membresia: string;
  estado: string;
}

export interface ReportePagoHistorialDTO {
  pagoId: number;
  fecha: string;
  hora: string;
  cliente: string;
  plan: string;
  metodo: string;
  monto: number;
  estado: string;
}

export interface MetricaComparativaDTO {
  nombre: string;
  valorActual: string;
  valorAnterior: string;
  porcentajeCambio: number;
  tendencia: "up" | "down" | "neutral";
  icono: string;
  categoria: "asistencia" | "suscripcion" | "ingreso";
}

export interface ReporteMetodoPagoDTO {
  metodo: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export interface ReportePlanDTO {
  plan: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export interface ReporteRenovacionCancelacionDTO {
  mes: string;
  renovaciones: number;
  cancelaciones: number;
  anio: number;
  mesNumero: number;
}

export interface ReporteRetencionMensualDTO {
  mes: string;
  renovaciones: number;
  cancelaciones: number;
  nuevos: number;
  retencion: number;
  tasaRetencion: number;
}

export interface SuscripcionPaginadaDTO {
  clienteId: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  plan: string;
  fechaVencimiento: string;
  estado: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

// ========== API ==========

export const ReportesApi = {
  /**
   * GET /reportes/suscripciones
   * HU-28: Listado Paginado de Suscripciones
   */
  obtenerSuscripcionesPaginadas: async (page: number, size: number, estado?: string): Promise<PageResponse<SuscripcionPaginadaDTO>> => {
    const { data } = await axiosClient.get(`/reportes/suscripciones`, { params: { page, size, estado } });
    return data;
  },

  /**
   * GET /reportes/suscripciones/exportar
   * HU-28: Exportar Suscripciones a Excel
   */
  exportarSuscripciones: async (estado?: string): Promise<Blob> => {
    const { data } = await axiosClient.get(`/reportes/suscripciones/exportar`, { params: { estado }, responseType: 'blob' });
    return data;
  },

  /**
   * GET /reportes/pagos/historial
   * HU-30: Historial de Pagos con Buscador
   */
  obtenerHistorialPagosConBusqueda: async (busqueda: string): Promise<ReportePagoHistorialDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/pagos/historial`, { params: { busqueda } });
    return data;
  },

  /**
   * GET /reportes/pagos/historial/exportar
   * HU-30: Exportar Historial de Pagos a Excel
   */
  exportarHistorialPagos: async (busqueda: string): Promise<Blob> => {
    const { data } = await axiosClient.get(`/reportes/pagos/historial/exportar`, { params: { busqueda }, responseType: 'blob' });
    return data;
  },

  /**
   * GET /reportes/ingresos/por-metodo
   * HU-29: Ingresos por Método de Pago
   */
  obtenerIngresosPorMetodo: async (fechaInicio?: string, fechaFin?: string): Promise<ReporteMetodoPagoDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/por-metodo`, { params: { fechaInicio, fechaFin } });
    return data;
  },

  /**
   * GET /reportes/ingresos/por-plan
   * HU-29: Ingresos por Plan de Membresía
   */
  obtenerIngresosPorPlan: async (fechaInicio?: string, fechaFin?: string): Promise<ReportePlanDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/por-plan`, { params: { fechaInicio, fechaFin } });
    return data;
  },

  /**
   * GET /reportes/retencion
   * HU-30: Retención Mensual
   */
  obtenerRetencionMensual: async (): Promise<ReporteRetencionMensualDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/retencion`);
    return data;
  },

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

  /**
   * GET /reportes/asistencias/tendencia
   * Tendencia de asistencias día a día
   */
  obtenerTendenciaAsistencias: async (inicio: string, fin: string): Promise<ReporteTendenciaDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/tendencia`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/asistencias/horas-pico
   * Horas del día con más asistencias
   */
  obtenerHorasPico: async (inicio: string, fin: string): Promise<ReporteHoraPicoDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/horas-pico`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/asistencias/clientes-ausentes
   * Clientes que no han asistido recientemente
   */
  obtenerClientesAusentes: async (diasAusencia: number = 7): Promise<ReporteClienteAusenteDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/clientes-ausentes`, {
      params: { diasAusencia },
    });
    return data;
  },

  /**
   * GET /reportes/asistencias/top-clientes
   * Top clientes por asistencia
   */
  obtenerTopClientes: async (inicio: string, fin: string, limite: number = 10): Promise<ReporteAsistenciaClienteDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/top-clientes`, {
      params: { inicio, fin, limite },
    });
    return data;
  },

  /**
   * GET /reportes/asistencias/recientes
   * Últimas asistencias registradas
   */
  obtenerAsistenciasRecientes: async (limite: number = 10): Promise<ReporteAsistenciaRecienteDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/asistencias/recientes`, {
      params: { limite },
    });
    return data;
  },

  /**
   * GET /reportes/suscripciones/distribucion-estado
   * Distribución de clientes por estado de suscripción
   */
  obtenerDistribucionPorEstado: async (): Promise<ReporteDistribucionDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/suscripciones/distribucion-estado`);
    return data;
  },

  /**
   * GET /reportes/suscripciones/distribucion-membresia
   * Distribución de clientes por tipo de membresía
   */
  obtenerDistribucionPorMembresia: async (): Promise<ReporteDistribucionDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/suscripciones/distribucion-membresia`);
    return data;
  },

  /**
   * GET /reportes/suscripciones/proximos-vencer
   * Clientes cuya membresía está próxima a vencer
   */
  obtenerClientesProximosVencer: async (diasAnticipacion: number = 15): Promise<ReporteClienteProximoVencerDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/suscripciones/proximos-vencer`, {
      params: { diasAnticipacion },
    });
    return data;
  },

  /**
   * GET /reportes/ingresos/tendencia
   * Tendencia de ingresos día a día
   */
  obtenerTendenciaIngresos: async (inicio: string, fin: string): Promise<ReporteTendenciaDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/tendencia`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/ingresos/historial-pagos
   * Historial de pagos recientes
   */
  obtenerHistorialPagos: async (limite: number = 20): Promise<ReportePagoHistorialDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/historial-pagos`, {
      params: { limite },
    });
    return data;
  },

  /**
   * GET /reportes/ingresos/distribucion-plan
   * Distribución de ingresos por tipo de plan
   */
  obtenerDistribucionIngresosPorPlan: async (inicio: string, fin: string): Promise<ReporteDistribucionDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/distribucion-plan`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/metricas-comparativas
   * Métricas comparativas del dashboard con comparación vs periodo anterior
   * Acepta parámetros opcionales de rango para filtrar según Día/Semana/Mes/Año
   */
  obtenerMetricasComparativas: async (inicio?: string, fin?: string): Promise<MetricaComparativaDTO[]> => {
    const params = inicio && fin ? { inicio, fin } : {};
    const { data } = await axiosClient.get(`/reportes/metricas-comparativas`, { params });
    return data;
  },

  /**
   * GET /reportes/ingresos/metodos-pago
   * Distribución de ingresos por método de pago
   */
  obtenerDistribucionMetodosPago: async (inicio: string, fin: string): Promise<ReporteMetodoPagoDTO[]> => {
    const { data } = await axiosClient.get(`/reportes/ingresos/metodos-pago`, {
      params: { inicio, fin },
    });
    return data;
  },

  /**
   * GET /reportes/suscripciones/renovaciones-cancelaciones
   * Histórico de renovaciones y cancelaciones
   * @param inicio Fecha de inicio opcional (formato YYYY-MM-DD)
   * @param fin Fecha de fin opcional (formato YYYY-MM-DD)
   */
  obtenerRenovacionesCancelaciones: async (inicio?: string, fin?: string): Promise<ReporteRenovacionCancelacionDTO[]> => {
    const params = inicio && fin ? { inicio, fin } : {};
    const { data } = await axiosClient.get(`/reportes/suscripciones/renovaciones-cancelaciones`, { params });
    return data;
  },
};
