// Declaración de tipos para jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BarChart3, 
  ScrollText, 
  Wallet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  UserCheck,
  UserX,
  Award,
  RefreshCw,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { ReportesApi } from "../../api/reportesApi";
import type {
  ReporteTendenciaDTO,
  ReporteHoraPicoDTO,
  ReporteClienteAusenteDTO,
  ReporteAsistenciaRecienteDTO,
  ReporteAsistenciaClienteDTO,
  ReporteDistribucionDTO,
  ReporteClienteProximoVencerDTO,
  ReportePagoHistorialDTO,
  ReporteRenovacionCancelacionDTO,
  MetricaComparativaDTO
} from "../../api/reportesApi";

// ==================== TIPOS ====================

type VistaReporte = "asistencia" | "suscripciones" | "ingresos";
type RangoTemporal = "dia" | "semana" | "mes" | "anio";

// ==================== COMPONENTE CUSTOM TOOLTIP ====================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
    payload?: {
      name?: string;
      value?: number;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#0F1318",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ color: "#fff", fontSize: "14px" }}>
            <span style={{ fontWeight: "bold" }}>
              {entry.payload?.name || entry.name}:
            </span>{" "}
            <span>{entry.payload?.value || entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ==================== COMPONENTE PRINCIPAL ====================

// Helper: calcular rango de fechas según el filtro temporal
const calcularRangoFechas = (rango: RangoTemporal): { inicio: string; fin: string } => {
  const hoy = new Date();
  let inicio: Date;
  let fin: Date = new Date(hoy);

  switch (rango) {
    case "dia":
      // Mismo día: de 00:00 a 23:59
      inicio = new Date(hoy);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case "semana":
      // Últimos 7 días
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 6); // 7 días incluyendo hoy
      inicio.setHours(0, 0, 0, 0);
      break;
    case "mes":
      // Mes actual completo: del día 1 hasta el último día del mes
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0); // Último día del mes
      fin.setHours(23, 59, 59, 999);
      break;
    case "anio":
      // Año actual completo: del 1 de enero hasta el 31 de diciembre
      inicio = new Date(hoy.getFullYear(), 0, 1); // 1 de enero
      fin = new Date(hoy.getFullYear(), 11, 31); // 31 de diciembre
      fin.setHours(23, 59, 59, 999);
      break;
  }

  // Formatear fechas manualmente para evitar problemas de zona horaria
  const formatFecha = (fecha: Date): string => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    inicio: formatFecha(inicio),
    fin: formatFecha(fin),
  };
};

export default function ReportesCompleto() {
  const [vistaActiva, setVistaActiva] = useState<VistaReporte>("asistencia");
  const [rangoTemporal, setRangoTemporal] = useState<RangoTemporal>("anio");
  const [loading, setLoading] = useState(false);

  // Estados para Reportes de Asistencia
  const [tendenciaAsistencias, setTendenciaAsistencias] = useState<ReporteTendenciaDTO[]>([]);
  const [horasPico, setHorasPico] = useState<ReporteHoraPicoDTO[]>([]);
  const [topClientes, setTopClientes] = useState<ReporteAsistenciaClienteDTO[]>([]);
  const [clientesAusentes, setClientesAusentes] = useState<ReporteClienteAusenteDTO[]>([]);
  const [asistenciasRecientes, setAsistenciasRecientes] = useState<ReporteAsistenciaRecienteDTO[]>([]);
  const [metricasAsistencia, setMetricasAsistencia] = useState<MetricaComparativaDTO[]>([]);

  // Estados para Reportes de Suscripciones
  const [distribucionEstado, setDistribucionEstado] = useState<ReporteDistribucionDTO[]>([]);
  const [distribucionMembresia, setDistribucionMembresia] = useState<ReporteDistribucionDTO[]>([]);
  const [proximosVencer, setProximosVencer] = useState<ReporteClienteProximoVencerDTO[]>([]);
  const [renovacionesCancelaciones, setRenovacionesCancelaciones] = useState<ReporteRenovacionCancelacionDTO[]>([]);
  const [metricasSuscripciones, setMetricasSuscripciones] = useState<MetricaComparativaDTO[]>([]);
  // const [membresiasMasVendidas, setMembresiasMasVendidas] = useState<ReporteMembresiaDTO[]>([]);

  // Estados para Reportes de Ingresos
  const [tendenciaIngresos, setTendenciaIngresos] = useState<ReporteTendenciaDTO[]>([]);
  const [distribucionIngresosPlan, setDistribucionIngresosPlan] = useState<ReporteDistribucionDTO[]>([]);
  const [historialPagos, setHistorialPagos] = useState<ReportePagoHistorialDTO[]>([]);
  const [metricasIngresos, setMetricasIngresos] = useState<MetricaComparativaDTO[]>([]);
  // const [ingresosResumen, setIngresosResumen] = useState<ReporteIngresosDTO | null>(null);

  // Cargar datos según la vista activa y rango temporal
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { inicio, fin } = calcularRangoFechas(rangoTemporal);

      if (vistaActiva === "asistencia") {
        const [tendencia, horas, top, ausentes, recientes, metricas] = await Promise.all([
          ReportesApi.obtenerTendenciaAsistencias(inicio, fin),
          ReportesApi.obtenerHorasPico(inicio, fin),
          ReportesApi.obtenerTopClientes(inicio, fin, 10),
          ReportesApi.obtenerClientesAusentes(7),
          ReportesApi.obtenerAsistenciasRecientes(10),
          ReportesApi.obtenerMetricasComparativas(inicio, fin),
        ]);
        setTendenciaAsistencias(tendencia);
        setHorasPico(horas);
        setTopClientes(top);
        setClientesAusentes(ausentes);
        setAsistenciasRecientes(recientes);
        setMetricasAsistencia(metricas.filter(m => m.categoria === "asistencia"));
      } else if (vistaActiva === "suscripciones") {
        const [distEstado, distMembresia, proximos, renovaciones, metricas] = await Promise.all([
          ReportesApi.obtenerDistribucionPorEstado(),
          ReportesApi.obtenerDistribucionPorMembresia(),
          ReportesApi.obtenerClientesProximosVencer(7), // 🔥 Cambiado de 15 a 7 días
          ReportesApi.obtenerRenovacionesCancelaciones(inicio, fin), // 🔥 Ahora con filtro de fechas
          ReportesApi.obtenerMetricasComparativas(inicio, fin), // Pasamos el rango de fechas
          // ReportesApi.obtenerMembresiasMasVendidas(inicio, fin),
        ]);
        setDistribucionEstado(distEstado);
        setDistribucionMembresia(distMembresia);
        setProximosVencer(proximos);
        setRenovacionesCancelaciones(renovaciones);
        setMetricasSuscripciones(metricas);
        // setMembresiasMasVendidas(masVendidas);
      } else if (vistaActiva === "ingresos") {
        const [tendencia, distPlan, historial, metricas] = await Promise.all([
          ReportesApi.obtenerTendenciaIngresos(inicio, fin),
          ReportesApi.obtenerDistribucionIngresosPorPlan(inicio, fin),
          ReportesApi.obtenerHistorialPagos(10),
          ReportesApi.obtenerMetricasComparativas(inicio, fin),
        ]);
        setTendenciaIngresos(tendencia);
        setDistribucionIngresosPlan(distPlan);
        setHistorialPagos(historial);
        setMetricasIngresos(metricas.filter(m => m.categoria === "ingreso"));

        // Obtener resumen de ingresos del mes actual
        // const hoy = new Date();
        // const resumen = await ReportesApi.obtenerIngresosMensual(hoy.getFullYear(), hoy.getMonth() + 1);
        // setIngresosResumen(resumen);
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  // Recargar datos cuando cambie la vista o el rango temporal
  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaActiva, rangoTemporal]);

  return (
    <motion.div 
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Sistema de Reportes</h1>
          <p className="text-slate-400 text-sm">Análisis integral del negocio</p>
        </div>

        {/* Filtros Temporales + Botón Refrescar */}
        <div className="flex gap-2 items-center">
          {(["dia", "semana", "mes", "anio"] as RangoTemporal[]).map((rango) => (
            <button
              key={rango}
              onClick={() => setRangoTemporal(rango)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                rangoTemporal === rango
                  ? "bg-blue-600/30 border-blue-500 text-blue-300"
                  : "bg-[#0F1318] border-white/10 text-slate-400 hover:bg-white/5"
              }`}
            >
              {rango === "dia" && "Día"}
              {rango === "semana" && "Semana"}
              {rango === "mes" && "Mes"}
              {rango === "anio" && "Año"}
            </button>
          ))}
          
          {/* Botón Refrescar */}
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      {/* Navegación de Vistas */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => setVistaActiva("asistencia")}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            vistaActiva === "asistencia"
              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
              : "bg-[#1A1F25] border-white/10 text-slate-400 hover:bg-white/5"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Asistencia</span>
        </motion.button>

        <motion.button
          onClick={() => setVistaActiva("suscripciones")}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            vistaActiva === "suscripciones"
              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
              : "bg-[#1A1F25] border-white/10 text-slate-400 hover:bg-white/5"
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Suscripciones</span>
        </motion.button>

        <motion.button
          onClick={() => setVistaActiva("ingresos")}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            vistaActiva === "ingresos"
              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
              : "bg-[#1A1F25] border-white/10 text-slate-400 hover:bg-white/5"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Ingresos</span>
        </motion.button>
      </div>

      {/* Contenido Dinámico de Vistas */}
      <AnimatePresence mode="wait">
        {vistaActiva === "asistencia" && (
          <VistaAsistencia 
            key="asistencia"
            tendenciaAsistencias={tendenciaAsistencias}
            horasPico={horasPico}
            topClientes={topClientes}
            clientesAusentes={clientesAusentes}
            asistenciasRecientes={asistenciasRecientes}
            metricasAsistencia={metricasAsistencia}
          />
        )}
        {vistaActiva === "suscripciones" && (
          <VistaSuscripciones 
            key="suscripciones"
            distribucionEstado={distribucionEstado}
            distribucionMembresia={distribucionMembresia}
            proximosVencer={proximosVencer}
            renovacionesCancelaciones={renovacionesCancelaciones}
            metricas={metricasSuscripciones}
          />
        )}
        {vistaActiva === "ingresos" && (
          <VistaIngresos 
            key="ingresos"
            tendenciaIngresos={tendenciaIngresos}
            distribucionIngresosPlan={distribucionIngresosPlan}
            historialPagos={historialPagos}
            metricasIngresos={metricasIngresos}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== VISTA 1: ASISTENCIA ====================

interface VistaAsistenciaProps {
  tendenciaAsistencias: ReporteTendenciaDTO[];
  horasPico: ReporteHoraPicoDTO[];
  topClientes: ReporteAsistenciaClienteDTO[];
  clientesAusentes: ReporteClienteAusenteDTO[];
  asistenciasRecientes: ReporteAsistenciaRecienteDTO[];
  metricasAsistencia: MetricaComparativaDTO[];
}

function VistaAsistencia({ 
  tendenciaAsistencias, 
  horasPico, 
  topClientes, 
  clientesAusentes, 
  asistenciasRecientes,
  metricasAsistencia
}: VistaAsistenciaProps) {
  // Buscar métricas específicas
  const metricaTotalAsistencias = metricasAsistencia.find(m => m.nombre === "Total Asistencias");
  const metricaNuevosClientes = metricasAsistencia.find(m => m.nombre === "Nuevos Clientes");
  const metricaClientesAusentes = metricasAsistencia.find(m => m.nombre === "Clientes Ausentes (7+ días)");
  const metricaTasaRetencion = metricasAsistencia.find(m => m.nombre === "Tasa de Retención");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          numero={metricaTotalAsistencias?.valorActual || "0"}
          label="TOTAL ASISTENCIAS"
          tendencia={metricaTotalAsistencias?.tendencia === "up" ? "positiva" : metricaTotalAsistencias?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaTotalAsistencias?.porcentajeCambio ? `${metricaTotalAsistencias.porcentajeCambio > 0 ? '+' : ''}${metricaTotalAsistencias.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<Users className="w-5 h-5" />}
          colorFondo="bg-emerald-500/10"
          colorBorde="border-emerald-500/30"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero={metricaNuevosClientes?.valorActual || "0"}
          label="NUEVOS CLIENTES"
          tendencia={metricaNuevosClientes?.tendencia === "up" ? "positiva" : metricaNuevosClientes?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaNuevosClientes?.porcentajeCambio ? `${metricaNuevosClientes.porcentajeCambio > 0 ? '+' : ''}${metricaNuevosClientes.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<UserCheck className="w-5 h-5" />}
          colorFondo="bg-blue-500/10"
          colorBorde="border-blue-500/30"
          colorTexto="text-blue-400"
        />
        <MetricCard
          numero={metricaClientesAusentes?.valorActual || "0"}
          label="CLIENTES AUSENTES (7+ DÍAS)"
          tendencia={metricaClientesAusentes?.tendencia === "down" ? "positiva" : metricaClientesAusentes?.tendencia === "up" ? "negativa" : undefined}
          indicador={metricaClientesAusentes?.porcentajeCambio ? `${metricaClientesAusentes.porcentajeCambio > 0 ? '+' : ''}${metricaClientesAusentes.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<UserX className="w-5 h-5" />}
          colorFondo="bg-orange-500/10"
          colorBorde="border-orange-500/30"
          colorTexto="text-orange-400"
        />
        <MetricCard
          numero={metricaTasaRetencion?.valorActual || "0%"}
          label="TASA DE RETENCIÓN"
          tendencia={metricaTasaRetencion?.tendencia === "up" ? "positiva" : metricaTasaRetencion?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaTasaRetencion?.porcentajeCambio ? `${metricaTasaRetencion.porcentajeCambio > 0 ? '+' : ''}${metricaTasaRetencion.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<Award className="w-5 h-5" />}
          colorFondo="bg-purple-500/10"
          colorBorde="border-purple-500/30"
          colorTexto="text-purple-400"
        />
      </div>

      {/* Sección Media: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Gráfico de Tendencia */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
            Tendencia de Asistencia Diaria
          </h3>
          {tendenciaAsistencias.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-slate-400 text-sm">No hay datos de tendencia disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tendenciaAsistencias.map(t => ({ dia: t.fecha, asistencias: t.valor || 0 }))}>
                <defs>
                  <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="dia" 
                  stroke="#94a3b8" 
                  style={{ fontSize: "11px" }}
                  angle={tendenciaAsistencias.length > 15 ? -45 : 0}
                  textAnchor={tendenciaAsistencias.length > 15 ? "end" : "middle"}
                  height={tendenciaAsistencias.length > 15 ? 60 : 30}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="asistencias"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorAsistencias)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 10 Clientes Más Constantes */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
            Top 10 Clientes Más Constantes
          </h3>
          {topClientes.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-slate-400 text-sm">No hay datos de clientes disponibles</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {topClientes.map((cliente, index) => (
                <div
                  key={cliente.clienteId}
                  className="flex items-center gap-3 bg-transparent p-3 rounded-lg hover:bg-[#1e293b] transition-colors border border-emerald-500/10"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-sm">
                    {cliente.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{cliente.nombreCompleto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-[#374151] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((cliente.totalAsistencias / (topClientes[0]?.totalAsistencias || 30)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-emerald-400 font-bold text-xs whitespace-nowrap">
                        {cliente.totalAsistencias}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Mapa de Calor de Horarios */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">
              Horas Pico del Gimnasio
            </h3>
            <p className="text-xs text-slate-400">Intensidad de asistencia por hora del día</p>
          </div>
          {horasPico.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-slate-400 text-sm">No hay datos de horas pico disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={horasPico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hora" stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="intensidad" radius={[8, 8, 0, 0]}>
                  {horasPico.map((entry, index) => {
                    let color = "#374151"; // Bajo
                    if (entry.intensidad > 80) color = "#fb923c"; // Alto
                    else if (entry.intensidad > 50) color = "#10b981"; // Medio
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tablas Paralelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Clientes Ausentes */}
          <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Clientes Ausentes
            </h3>
            {clientesAusentes.length === 0 ? (
              <div className="flex items-center justify-center h-[220px]">
                <p className="text-slate-400 text-xs text-center">
                  ✅ No hay clientes ausentes<br/>por más de 7 días
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {clientesAusentes.map((cliente) => (
                  <div
                    key={cliente.clienteId}
                    className="bg-[#1f2937] p-3 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-semibold text-xs">
                        {cliente.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-white font-medium text-xs flex-1 truncate">{cliente.nombreCompleto}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Última visita:</span>
                      <span className="text-slate-300">{cliente.ultimaVisita || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-red-400 font-bold">{cliente.diasAusente} días ausente</span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-semibold">
                        {cliente.estadoMembresia}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Asistencias Recientes */}
          <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Asistencias Recientes
            </h3>
            {asistenciasRecientes.length === 0 ? (
              <div className="flex items-center justify-center h-[220px]">
                <p className="text-slate-400 text-xs text-center">
                  No hay asistencias recientes<br/>registradas
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {asistenciasRecientes.map((asistencia) => (
                  <div
                    key={asistencia.asistenciaId}
                    className="bg-[#1f2937] p-3 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
                        {asistencia.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-white font-medium text-xs flex-1 truncate">{asistencia.nombreCompleto}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Hora:</span>
                      <span className="text-emerald-400 font-semibold">{asistencia.hora}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[9px] ${getBadgeMembresia(asistencia.membresia)}`}>
                        {asistencia.membresia}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-semibold">
                        {asistencia.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== VISTA 2: SUSCRIPCIONES ====================

interface VistaSuscripcionesProps {
  distribucionEstado: ReporteDistribucionDTO[];
  distribucionMembresia: ReporteDistribucionDTO[];
  proximosVencer: ReporteClienteProximoVencerDTO[];
  renovacionesCancelaciones: ReporteRenovacionCancelacionDTO[];
  metricas: MetricaComparativaDTO[];
}

function VistaSuscripciones({
  distribucionEstado,
  distribucionMembresia,
  proximosVencer,
  renovacionesCancelaciones,
  metricas
}: VistaSuscripcionesProps) {
  
  // Helper para encontrar métrica por nombre
  const getMetrica = (nombre: string) => {
    return metricas.find(m => m.nombre === nombre);
  };

  // Helper para convertir tendencia del backend a formato del frontend
  const convertirTendencia = (tendencia?: "up" | "down" | "neutral"): "positiva" | "negativa" => {
    if (tendencia === "up") return "positiva";
    if (tendencia === "down") return "negativa";
    return "positiva"; // neutral se considera positiva
  };

  // Métricas específicas
  const metricaActivas = getMetrica("Suscripciones Activas");
  const metricaVencidas = getMetrica("Suscripciones Vencidas");
  const metricaProximas = getMetrica("Próximas a Vencer");
  const metricaRenovaciones = getMetrica("Renovaciones");
  // NOTA: NO hay cancelaciones según el flujo de negocio

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave - 4 Cards (sin cancelaciones según flujo de negocio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          numero={metricaActivas?.valorActual.toLocaleString() || "0"}
          label="SUSCRIPCIONES ACTIVAS"
          tendencia={convertirTendencia(metricaActivas?.tendencia)}
          icono={<CheckCircle2 className="w-8 h-8" />}
          colorFondo="bg-emerald-500/10"
          colorBorde="border-emerald-500/30"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero={metricaVencidas?.valorActual.toLocaleString() || "0"}
          label="SUSCRIPCIONES VENCIDAS"
          tendencia={metricaVencidas?.porcentajeCambio !== undefined && metricaVencidas.porcentajeCambio < 0 ? "positiva" : "negativa"}
          icono={<AlertTriangle className="w-8 h-8" />}
          colorFondo="from-red-500/20 to-red-600/10"
          colorBorde="border-red-500/50"
          colorTexto="text-red-400"
        />
        <MetricCard
          numero={metricaProximas?.valorActual.toLocaleString() || "0"}
          label="PRÓXIMAS A VENCER"
          tendencia={metricaProximas?.porcentajeCambio !== undefined && metricaProximas.porcentajeCambio < 0 ? "positiva" : "negativa"}
          icono={<Clock className="w-8 h-8" />}
          colorFondo="bg-orange-500/10"
          colorBorde="border-orange-500/30"
          colorTexto="text-orange-400"
        />
        <MetricCard
          numero={metricaRenovaciones?.valorActual.toLocaleString() || "0"}
          label="RENOVACIONES"
          tendencia={convertirTendencia(metricaRenovaciones?.tendencia)}
          icono={<RefreshCw className="w-8 h-8" />}
          colorFondo="bg-blue-500/10"
          colorBorde="border-blue-500/30"
          colorTexto="text-blue-400"
        />
      </div>

      {/* Sección Superior: Renovaciones (más estrecho) + Distribución por Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Renovaciones - Gráfico dinámico según filtro seleccionado */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Renovaciones {renovacionesCancelaciones.length > 0 && `(${renovacionesCancelaciones.length} períodos)`}
          </h3>
          {renovacionesCancelaciones.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay datos de renovaciones en el período seleccionado</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={renovacionesCancelaciones}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#94a3b8" 
                  style={{ fontSize: "11px" }}
                  angle={renovacionesCancelaciones.length > 15 ? -45 : 0}
                  textAnchor={renovacionesCancelaciones.length > 15 ? "end" : "middle"}
                  height={renovacionesCancelaciones.length > 15 ? 60 : 30}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  style={{ fontSize: "11px" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1318",
                    border: "1px solid #ffffff20",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="renovaciones"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Renovaciones"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribución por Estado - Movido al lado de Renovaciones */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">
            Distribución por Estado de Suscripción
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distribucionEstado as unknown as Array<Record<string, string | number>>}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => {
                  // entry: PieLabelRenderProps
                  const e = entry as { name: string; percent?: number };
                  return `${e.name} ${e.percent !== undefined ? (e.percent * 100).toFixed(0) : "0"}%`;
                }}
                labelLine={false}
              >
                {distribucionEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-4">
            {distribucionEstado.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección Inferior: Próximas a Vencer (izquierda) + Distribución Membresías (derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Próximas a Vencer */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Próximas a Vencer (7 días)
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {proximosVencer.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">
                  ✅ No hay suscripciones próximas a vencer en los próximos 7 días
                </p>
              </div>
            ) : (
              proximosVencer.map((cliente) => (
                <div
                  key={cliente.clienteId}
                  className="flex items-center justify-between bg-transparent p-4 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center text-white font-semibold">
                      {cliente.nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{cliente.nombreCompleto}</p>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getBadgeMembresia(cliente.plan)}`}>
                        {cliente.plan}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-lg">{cliente.diasRestantes} días</p>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">
                      {cliente.estado}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Distribución de Tipos de Membresía - Movido al lado derecho */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">
            Distribución de Tipos de Membresía
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distribucionMembresia as unknown as Array<Record<string, string | number>>}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => {
                  const e = entry as { name: string; percent?: number };
                  return `${e.name} ${e.percent !== undefined ? (e.percent * 100).toFixed(0) : "0"}%`;
                }}
                labelLine={false}
              >
                {distribucionMembresia.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-4">
            {distribucionMembresia.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== VISTA 3: INGRESOS ====================

interface VistaIngresosProps {
  tendenciaIngresos: ReporteTendenciaDTO[];
  distribucionIngresosPlan: ReporteDistribucionDTO[];
  historialPagos: ReportePagoHistorialDTO[];
  metricasIngresos: MetricaComparativaDTO[];
}

function VistaIngresos({
  tendenciaIngresos,
  distribucionIngresosPlan,
  historialPagos,
  metricasIngresos
}: VistaIngresosProps) {
  // Buscar métricas específicas
  const metricaIngresosTotales = metricasIngresos.find(m => m.nombre === "Ingresos Totales");
  const metricaIngresosSemana = metricasIngresos.find(m => m.nombre === "Ingresos Esta Semana");
  const metricaIngresosHoy = metricasIngresos.find(m => m.nombre === "Ingresos Hoy");
  const metricaPagosRealizados = metricasIngresos.find(m => m.nombre === "Pagos Realizados");

  // Función para exportar a Excel con formato bonito
  const exportarExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Preparar datos con formato
      const datosExcel = [
        ["REPORTE DE INGRESOS - VIP CENTER FIT"],
        [`Generado: ${new Date().toLocaleString("es-ES")}`],
        [],
        ["Fecha", "Hora", "Cliente", "Plan", "Método", "Monto", "Estado"],
        ...historialPagos.map(pago => [
          pago.fecha,
          pago.hora,
          pago.cliente,
          pago.plan,
          pago.metodo,
          typeof pago.monto === 'number' ? pago.monto.toFixed(2) : pago.monto,
          pago.estado
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(datosExcel);

      // Aplicar estilos y anchos de columna
      ws['!cols'] = [
        { wch: 12 }, // Fecha
        { wch: 8 },  // Hora
        { wch: 25 }, // Cliente
        { wch: 20 }, // Plan
        { wch: 15 }, // Método
        { wch: 12 }, // Monto
        { wch: 12 }  // Estado
      ];

      // Mergear título
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Título
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }  // Fecha generación
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Historial Pagos");
      
      const nombreArchivo = `Reporte_Ingresos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
      
      toast.success("Excel exportado correctamente");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      toast.error("Error al exportar Excel");
    }
  };

  // Función para exportar a PDF con formato bonito
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configuración de colores
      const colorPrimario = [16, 185, 129]; // emerald-500
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.text("REPORTE DE INGRESOS", 105, 20, { align: "center" });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("VIP CENTER FIT", 105, 28, { align: "center" });
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, 105, 35, { align: "center" });
      
      // Línea decorativa
      doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Tabla con estilos
      autoTable(doc, {
        startY: 45,
        head: [["Fecha", "Hora", "Cliente", "Plan", "Método", "Monto", "Estado"]],
        body: historialPagos.map(pago => [
          pago.fecha,
          pago.hora,
          pago.cliente,
          pago.plan,
          pago.metodo,
          `$${typeof pago.monto === 'number' ? pago.monto.toFixed(2) : pago.monto}`,
          pago.estado
        ]),
        headStyles: {
          fillColor: colorPrimario as [number, number, number],
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [50, 50, 50] as [number, number, number]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250] as [number, number, number]
        },
        columnStyles: {
          0: { cellWidth: 22 }, // Fecha
          1: { cellWidth: 15 }, // Hora
          2: { cellWidth: 40 }, // Cliente
          3: { cellWidth: 30 }, // Plan
          4: { cellWidth: 25 }, // Método
          5: { cellWidth: 20, halign: 'right' }, // Monto
          6: { cellWidth: 20, halign: 'center' }  // Estado
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didParseCell: function(data: Record<string, any>) {
          // Colorear estado según valor
          if (data.column.index === 6 && data.section === 'body') {
            const estado = String(data.cell.raw);
            if (estado === "Confirmado" || estado === "Aprobado") {
              data.cell.styles.textColor = [16, 185, 129] as [number, number, number]; // verde
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === "Pendiente") {
              data.cell.styles.textColor = [234, 179, 8] as [number, number, number]; // amarillo
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [239, 68, 68] as [number, number, number]; // rojo
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        margin: { top: 45, left: 14, right: 14 },
        theme: 'striped'
      });
      
      // Footer
      const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }
      
      const nombreArchivo = `Reporte_Ingresos_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);
      
      toast.success("PDF exportado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al exportar PDF");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          numero={metricaIngresosTotales?.valorActual || "$0"}
          label="INGRESOS TOTALES"
          tendencia={metricaIngresosTotales?.tendencia === "up" ? "positiva" : metricaIngresosTotales?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaIngresosTotales?.porcentajeCambio ? `${metricaIngresosTotales.porcentajeCambio > 0 ? '+' : ''}${metricaIngresosTotales.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<DollarSign className="w-8 h-8" />}
          colorFondo="bg-emerald-500/10"
          colorBorde="border-emerald-500/30"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero={metricaIngresosSemana?.valorActual || "$0"}
          label="INGRESOS ESTA SEMANA"
          tendencia={metricaIngresosSemana?.tendencia === "up" ? "positiva" : metricaIngresosSemana?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaIngresosSemana?.porcentajeCambio ? `${metricaIngresosSemana.porcentajeCambio > 0 ? '+' : ''}${metricaIngresosSemana.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<Calendar className="w-8 h-8" />}
          colorFondo="bg-blue-500/10"
          colorBorde="border-blue-500/30"
          colorTexto="text-blue-400"
        />
        <MetricCard
          numero={metricaIngresosHoy?.valorActual || "$0"}
          label="INGRESOS HOY"
          tendencia={metricaIngresosHoy?.tendencia === "up" ? "positiva" : metricaIngresosHoy?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaIngresosHoy?.porcentajeCambio ? `${metricaIngresosHoy.porcentajeCambio > 0 ? '+' : ''}${metricaIngresosHoy.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<TrendingUp className="w-8 h-8" />}
          colorFondo="bg-purple-500/10"
          colorBorde="border-purple-500/30"
          colorTexto="text-cyan-400"
        />
        <MetricCard
          numero={metricaPagosRealizados?.valorActual || "0"}
          label="PAGOS REALIZADOS"
          tendencia={metricaPagosRealizados?.tendencia === "up" ? "positiva" : metricaPagosRealizados?.tendencia === "down" ? "negativa" : undefined}
          indicador={metricaPagosRealizados?.porcentajeCambio ? `${metricaPagosRealizados.porcentajeCambio > 0 ? '+' : ''}${metricaPagosRealizados.porcentajeCambio.toFixed(1)}%` : undefined}
          icono={<CheckCircle2 className="w-8 h-8" />}
          colorFondo="bg-green-500/10"
          colorBorde="border-green-500/30"
          colorTexto="text-green-400"
        />
      </div>

      {/* Sección Media: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Tendencia de Ingresos */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
            Tendencia de Ingresos
          </h3>
          {tendenciaIngresos.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-slate-400 text-sm">No hay datos de ingresos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tendenciaIngresos.map(t => ({ dia: t.fecha, monto: t.monto || 0 }))}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="dia" 
                  stroke="#94a3b8" 
                  style={{ fontSize: "11px" }}
                  angle={tendenciaIngresos.length > 15 ? -45 : 0}
                  textAnchor={tendenciaIngresos.length > 15 ? "end" : "middle"}
                  height={tendenciaIngresos.length > 15 ? 60 : 30}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMonto)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ingresos por Tipo de Plan */}
        <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
            Ingresos por Tipo de Plan
          </h3>
          {distribucionIngresosPlan.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-slate-400 text-sm">No hay datos de distribución disponibles</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={distribucionIngresosPlan as unknown as Array<Record<string, string | number>>}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => {
                      const e = entry as { name: string; value?: number };
                      return `$${e.value !== undefined ? e.value.toLocaleString() : "0"}`;
                    }}
                    labelLine={false}
                  >
                    {distribucionIngresosPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {distribucionIngresosPlan.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabla de Historial de Pagos */}
      <div className="bg-[#1A1F25] rounded-lg p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Historial de Pagos Recientes
            </h3>
            <p className="text-xs text-slate-400 mt-1">Últimos 10 pagos registrados</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportarExcel}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/30"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button 
              onClick={exportarPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-red-500/30"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {historialPagos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No hay pagos registrados en este período</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0f1318] border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Fecha
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Plan
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Método
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Monto
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {historialPagos.map((pago, index) => (
                  <tr
                    key={pago.pagoId}
                    className={`border-b border-white/5 hover:bg-[#1e293b] transition-colors ${
                      index % 2 === 0 ? "bg-[#141b24]" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="text-white font-medium">{pago.fecha}</div>
                      <div className="text-slate-400 text-xs">{pago.hora}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{pago.cliente}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeMembresia(pago.plan)}`}>
                        {pago.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-semibold border border-blue-500/20">
                        {pago.metodo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="text-emerald-400 font-bold">${typeof pago.monto === 'number' ? pago.monto.toFixed(2) : pago.monto}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          pago.estado === "Confirmado" || pago.estado === "Aprobado" || pago.estado === "approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : pago.estado === "Pendiente" || pago.estado === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

interface MetricCardProps {
  numero: string;
  label: string;
  indicador?: string;
  tendencia?: "positiva" | "negativa";
  icono: React.ReactNode;
  colorFondo: string;
  colorBorde: string;
  colorTexto: string;
}

function MetricCard({
  numero,
  label,
  indicador,
  tendencia,
  icono,
  colorFondo,
  colorBorde,
  colorTexto
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-[#1A1F25] rounded-lg p-3 border ${colorBorde} hover:border-opacity-50 transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorFondo}`}>
          <div className={colorTexto}>{icono}</div>
        </div>
      </div>
      <div className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-2xl font-bold ${colorTexto} mb-1`}>{numero}</div>
      {indicador && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            tendencia === "positiva" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {tendencia === "positiva" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{indicador}</span>
        </div>
      )}
    </motion.div>
  );
}

// Función auxiliar para obtener clases de badge de membresía
function getBadgeMembresia(tipo: string): string {
  const badges: Record<string, string> = {
    VIP: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Premium: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Anual: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Mensual: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Clases: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    Básica: "bg-slate-500/20 text-slate-400 border border-slate-500/30"
  };
  return badges[tipo] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
}
