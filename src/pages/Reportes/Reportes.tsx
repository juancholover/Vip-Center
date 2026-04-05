import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart
} from "lucide-react";
import { ReportesApi, ReporteComparativoDTO } from "../../api/reportesApi";
import toast from "react-hot-toast";
import IngresosReport from "./IngresosReport";
import * as XLSX from "xlsx";
// ❌ Imports temporalmente deshabilitados (tienen datos falsos):
// import SuscripcionesReport from "../Suscripcion/SuscripcionesReport";
// import AsistenciaReport from "../Asistencia/AsistenciaReport";

type TabType = "overview" | "ingresos" | "suscripciones" | "asistencia";

// ✅ Interfaz para datos adaptados (mismo formato que el backend devuelve después de la transformación)
interface ReporteOverviewAdaptado {
  totalIngresos: number;
  cantidadPagos: number;
  promedioTicket: number;
  ingresosAprobados: number;
  ingresosPendientes: number;
  ingresosRechazados: number;
}

export default function Reportes() {
  const [tab, setTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [reporteMensual, setReporteMensual] = useState<ReporteOverviewAdaptado | null>(null);
  const [comparativa, setComparativa] = useState<ReporteComparativoDTO[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (tab === "overview") {
      cargarDatosOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedMonth, selectedYear]);

  const cargarDatosOverview = async () => {
    setLoading(true);
    try {
      const [mensual, comparativo] = await Promise.all([
        ReportesApi.obtenerIngresosMensual(selectedYear, selectedMonth),
        ReportesApi.obtenerComparativo(),
      ]);

      // ✅ Adaptar datos del backend al formato esperado por el frontend
      const reporteAdaptado: ReporteOverviewAdaptado = {
        totalIngresos: mensual?.totalIngresos ?? 0,
        cantidadPagos: mensual?.totalTransacciones ?? 0,
        promedioTicket: (mensual?.totalTransacciones ?? 0) > 0 
          ? (mensual?.totalIngresos ?? 0) / (mensual?.totalTransacciones ?? 1)
          : 0,
        ingresosAprobados: mensual?.ingresosPorEstado?.approved ?? 0,
        ingresosPendientes: mensual?.ingresosPorEstado?.pending ?? 0,
        ingresosRechazados: mensual?.ingresosPorEstado?.cancelled ?? 0,
      };

      setReporteMensual(reporteAdaptado);
      
      // ✅ Validar que comparativo sea array con datos
      if (Array.isArray(comparativo) && comparativo.length > 0) {
        setComparativa(comparativo);
      } else {
        console.warn("⚠️ No hay datos comparativos disponibles");
        setComparativa([]);
      }
    } catch (error: unknown) {
      console.error("❌ Error al cargar datos:", error);
      
      // ✅ Mensaje de error específico
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        toast.error("Sesión expirada. Inicia sesión nuevamente.");
      } else if (err?.response?.status === 403) {
        toast.error("No tienes permisos para ver estos reportes.");
      } else {
        toast.error("Error al cargar reportes. Intenta nuevamente.");
      }
      
      // ✅ Resetear estados para evitar errores
      setComparativa([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para exportar el reporte a Excel
  const handleExportOverview = () => {
    try {
      if (!reporteMensual || comparativa.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen Mensual
      const datosResumen = [
        ["REPORTE DE INGRESOS - VIP CENTER FIT"],
        [`Período: ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`],
        [],
        ["Métrica", "Valor"],
        ["Ingresos Totales", `S/ ${reporteMensual.totalIngresos.toFixed(2)}`],
        ["Cantidad de Pagos", reporteMensual.cantidadPagos],
        ["Promedio por Pago", `S/ ${reporteMensual.promedioTicket.toFixed(2)}`],
        ["Ingresos Aprobados", `S/ ${reporteMensual.ingresosAprobados.toFixed(2)}`],
        ["Ingresos Pendientes", `S/ ${reporteMensual.ingresosPendientes.toFixed(2)}`],
        ["Ingresos Rechazados", `S/ ${reporteMensual.ingresosRechazados.toFixed(2)}`],
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Mensual");

      // Hoja 2: Comparativa
      const datosComparativa = [
        ["COMPARATIVA CON MES ANTERIOR"],
        [],
        ["Métrica", "Valor Actual", "Valor Anterior", "Diferencia", "% Cambio", "Tendencia"],
        ...comparativa.map(c => [
          c.metrica,
          c.valorPeriodoActual,
          c.valorPeriodoAnterior,
          c.diferencia,
          `${c.porcentajeCambio.toFixed(2)}%`,
          c.tendencia
        ])
      ];
      const wsComparativa = XLSX.utils.aoa_to_sheet(datosComparativa);
      XLSX.utils.book_append_sheet(wb, wsComparativa, "Comparativa");

      // Descargar archivo
      const nombreArchivo = `Reporte_${selectedYear}_${String(selectedMonth).padStart(2, '0')}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
      toast.success("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar el reporte");
    }
  };

  // ✅ Solo tabs con datos reales (sin datos inventados)
  const tabs = [
    { id: "overview", label: "Resumen", icon: BarChart3 },
    { id: "ingresos", label: "Ingresos Detallados", icon: DollarSign },
    // ❌ Ocultados temporalmente (tienen datos falsos):
    // { id: "suscripciones", label: "Membresías", icon: CreditCard },
    // { id: "asistencia", label: "Asistencias", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E12] p-6 space-y-6">
      {/* Header compacto */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">📊 Reportes</h1>
            <p className="text-emerald-100 text-sm">Análisis de rendimiento</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarDatosOverview}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button 
              onClick={handleExportOverview}
              disabled={loading || !reporteMensual}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all disabled:opacity-50 text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs compactos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#1A1F25] rounded-lg p-1.5 shadow-lg border border-white/10"
      >
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  tab === t.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Contenido dinámico */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Selector de Período compacto */}
            <div className="bg-[#1A1F25] rounded-lg p-3 shadow-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-white font-medium text-sm">Período:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[#0F1318] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={`month-${i + 1}`} value={i + 1}>
                      {new Date(2000, i, 1).toLocaleDateString("es-ES", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[#0F1318] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={`year-${year}`} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <>
                {/* Cards de Métricas compactas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <MetricCard
                    title="Ingresos Totales"
                    value={`S/ ${reporteMensual ? reporteMensual.totalIngresos.toFixed(2) : "0.00"}`}
                    icon={DollarSign}
                    color="emerald"
                    subtitle={`${reporteMensual ? reporteMensual.cantidadPagos : 0} pagos`}
                  />
                  <MetricCard
                    title="Ingresos Aprobados"
                    value={`S/ ${reporteMensual ? reporteMensual.ingresosAprobados.toFixed(2) : "0.00"}`}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Confirmados"
                  />
                  <MetricCard
                    title="Promedio por Pago"
                    value={`S/ ${reporteMensual ? reporteMensual.promedioTicket.toFixed(2) : "0.00"}`}
                    icon={CreditCard}
                    color="blue"
                    subtitle="Ticket promedio"
                  />
                  <MetricCard
                    title="Pendientes"
                    value={`S/ ${reporteMensual ? reporteMensual.ingresosPendientes.toFixed(2) : "0.00"}`}
                    icon={TrendingDown}
                    color="yellow"
                    subtitle="En proceso"
                  />
                </div>

                {/* Comparativa con Período Anterior */}
                {comparativa.length > 0 && (
                  <div className="bg-[#1A1F25] rounded-xl p-6 shadow-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <PieChart className="w-6 h-6 text-emerald-500" />
                      Comparativa con Mes Anterior
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {comparativa.map((comp) => (
                        <ComparativaCard key={comp.metrica} data={comp} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Desglose por Estado */}
                <div className="bg-[#1A1F25] rounded-xl p-6 shadow-xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Desglose de Ingresos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border border-green-500/30">
                      <div className="text-green-400 text-sm mb-1">✅ Aprobados</div>
                      <div className="text-2xl font-bold text-white">
                        S/ {reporteMensual ? reporteMensual.ingresosAprobados.toFixed(2) : "0.00"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
                      <div className="text-yellow-400 text-sm mb-1">⏳ Pendientes</div>
                      <div className="text-2xl font-bold text-white">
                        S/ {reporteMensual ? reporteMensual.ingresosPendientes.toFixed(2) : "0.00"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg p-4 border border-red-500/30">
                      <div className="text-red-400 text-sm mb-1">❌ Rechazados</div>
                      <div className="text-2xl font-bold text-white">
                        S/ {reporteMensual ? reporteMensual.ingresosRechazados.toFixed(2) : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "ingresos" && <IngresosReport />}
        {/* ❌ Tabs con datos falsos - Ocultados temporalmente:
        {tab === "suscripciones" && <SuscripcionesReport />}
        {tab === "asistencia" && <AsistenciaReport />}
        */}
      </motion.div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "emerald" | "green" | "blue" | "yellow";
  subtitle: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 shadow-lg border`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-sm text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </motion.div>
  );
}

interface ComparativaCardProps {
  data: ReporteComparativoDTO;
}

function ComparativaCard({ data }: ComparativaCardProps) {
  // ✅ Valores con validación y defaults (usando nombres correctos del backend)
  const valorActual = data?.valorPeriodoActual ?? 0;
  const porcentajeCambio = data?.porcentajeCambio ?? 0;
  const metrica = data?.metrica ?? "Sin datos";
  
  const isPositive = porcentajeCambio > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-400" : "text-red-400";
  const bgClass = isPositive
    ? "bg-green-500/10 border-green-500/30"
    : "bg-red-500/10 border-red-500/30";

  return (
    <div className={`${bgClass} rounded-lg p-4 border`}>
      <div className="text-slate-400 text-sm mb-2">{metrica}</div>
      <div className="text-xl font-bold text-white mb-2">
        {valorActual.toLocaleString("es-PE")}
      </div>
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(porcentajeCambio).toFixed(1)}%</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">vs. período anterior</div>
    </div>
  );
}
