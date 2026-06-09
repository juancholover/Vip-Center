import { axiosClient } from "./axiosClient";

// ===============================
// Types
// ===============================

export interface DetalleProductoReporte {
  productoId: number;
  productoNombre: string;
  unidadesVendidas: number;
  ingresoTotal: number;
}

export interface ReporteSuplementoDTO {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalUnidadesVendidas: number;
  totalVentas: number;
  productos: DetalleProductoReporte[];
}

export interface TopProductoDTO {
  posicion: number;
  productoId: number;
  productoNombre: string;
  unidadesVendidas: number;
  ingresoTotal: number;
}

// ===============================
// API Methods
// ===============================

export const ReportesSuplementoApi = {
  async reporteSemanal(fechaInicio: string): Promise<ReporteSuplementoDTO> {
    const res = await axiosClient.get("/reportes/semanal", {
      params: { fechaInicio },
    });
    return res.data;
  },

  async reporteMensual(anio: number, mes: number): Promise<ReporteSuplementoDTO> {
    const res = await axiosClient.get("/reportes/mensual", {
      params: { anio, mes },
    });
    return res.data;
  },

  async topProductos(
    fechaInicio: string,
    fechaFin: string,
    limite: number = 10
  ): Promise<TopProductoDTO[]> {
    const res = await axiosClient.get("/reportes/top-productos", {
      params: { fechaInicio, fechaFin, limite },
    });
    return res.data;
  },
};
