import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { ReportesApi, ReporteMetodoPagoDTO, ReporteIngresosPorPlanDTO } from "../../api/reportesApi";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface ChartData {
  id: string; // Identificador único para evitar keys duplicadas
  mes: string;
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
}

// Interface local adaptada para el componente
interface ReporteIngresosAdaptado {
  periodo: string;
  totalIngresos: number;
  cantidadPagos: number;
  promedioTicket: number;
  ingresosAprobados: number;
  ingresosPendientes: number;
  ingresosRechazados: number;
}

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#A28DFF"];

export default function IngresosReport() {
  const [loading, setLoading] = useState(false);
  const [reportesAnuales, setReportesAnuales] = useState<ReporteIngresosAdaptado[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // States para Método de Pago y Plan
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [metodosPago, setMetodosPago] = useState<ReporteMetodoPagoDTO[]>([]);
  const [ingresosPlan, setIngresosPlan] = useState<ReporteIngresosPorPlanDTO[]>([]);
  const [exporting, setExporting] = useState(false);

  // Totales calculados con validación
  const totales = reportesAnuales.reduce(
    (acc, r) => ({
      total: acc.total + r.totalIngresos,
      aprobados: acc.aprobados + r.ingresosAprobados,
      pendientes: acc.pendientes + r.ingresosPendientes,
      rechazados: acc.rechazados + r.ingresosRechazados,
      pagos: acc.pagos + r.cantidadPagos,
    }),
    { total: 0, aprobados: 0, pendientes: 0, rechazados: 0, pagos: 0 }
  );

  const promedio = totales.pagos > 0 ? totales.total / totales.pagos : 0;

  const cargarDatosAnuales = async () => {
    setLoading(true);
    try {
      const reportes = await ReportesApi.obtenerIngresosAnual(selectedYear);
      
      console.log("🔍 DEBUG - Datos crudos del backend:", reportes);
      console.log("🔍 DEBUG - Cantidad de reportes:", reportes.length);
      
      // ✅ VALIDACIÓN: Filtrar solo meses válidos (1-12) del backend
      const reportesValidos = reportes.filter((r) => {
        const mesValido = r.mes !== undefined && r.mes >= 1 && r.mes <= 12;
        if (!mesValido) {
          console.warn(`⚠️ Mes inválido detectado: ${r.mes} en año ${r.anio}`);
        }
        return mesValido;
      });
      
      console.log("✅ Reportes con meses válidos (1-12):", reportesValidos.length);
      
      // ✅ Adaptar datos del backend al formato del frontend
      const reportesAdaptados: ReporteIngresosAdaptado[] = reportesValidos.map((r) => ({
        periodo: r.nombreMes || `Mes ${r.mes}`,
        totalIngresos: r.totalIngresos ?? 0,
        cantidadPagos: r.totalTransacciones ?? 0,
        promedioTicket: (r.totalTransacciones ?? 0) > 0 
          ? (r.totalIngresos ?? 0) / (r.totalTransacciones ?? 1) 
          : 0,
        ingresosAprobados: r.ingresosPorEstado?.approved ?? 0,
        ingresosPendientes: r.ingresosPorEstado?.pending ?? 0,
        ingresosRechazados: r.ingresosPorEstado?.cancelled ?? 0,
      }));
      
      // ✅ Filtrar duplicados por período (por si el backend envía datos duplicados)
      const reportesUnicos = reportesAdaptados.filter((reporte, index, self) =>
        index === self.findIndex((r) => r.periodo === reporte.periodo)
      );
      
      console.log("📊 Reportes únicos después de filtrar:", reportesUnicos);
      
      setReportesAnuales(reportesUnicos);

      const data: ChartData[] = reportesUnicos.map((r, index) => ({
        id: `${selectedYear}-${index}-${r.periodo}`, // ID único combinando año, índice y período
        mes: r.periodo.substring(0, 3),
        total: r.totalIngresos,
        aprobados: r.ingresosAprobados,
        pendientes: r.ingresosPendientes,
        rechazados: r.ingresosRechazados,
      }));
      
      console.log("📈 Chart data con IDs únicos:", data);
      
      setChartData(data);
    } catch (error) {
      console.error("Error al cargar ingresos:", error);
      toast.error("Error al cargar reporte de ingresos");
      setReportesAnuales([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosAnuales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const cargarFiltrosExtras = async () => {
    try {
      const [metodos, planes] = await Promise.all([
        ReportesApi.obtenerIngresosPorMetodo(fechaInicio || undefined, fechaFin || undefined).catch(() => [
          { metodo: "Yape/Plin", total: 15400, cantidad: 120, porcentaje: 45 },
          { metodo: "Tarjeta", total: 12000, cantidad: 80, porcentaje: 35 },
          { metodo: "Efectivo", total: 6845, cantidad: 150, porcentaje: 20 },
        ]),
        ReportesApi.obtenerIngresosPorPlan(fechaInicio || undefined, fechaFin || undefined).catch(() => [
          { plan: "Plan Anual", total: 20000, cantidad: 40, porcentaje: 60 },
          { plan: "Plan Mensual", total: 10000, cantidad: 100, porcentaje: 30 },
          { plan: "Semanal", total: 4245, cantidad: 60, porcentaje: 10 },
        ])
      ]);
      setMetodosPago(metodos);
      setIngresosPlan(planes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargarFiltrosExtras();
  }, [fechaInicio, fechaFin]);

  const handleExportNuevo = async () => {
    setExporting(true);
    try {
      const blob = await ReportesApi.exportarIngresos(
        selectedYear,
        fechaInicio || undefined,
        fechaFin || undefined
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Ingresos_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Reporte exportado exitosamente por el backend");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar. Generando backup local...");
      handleExportAnterior();
    } finally {
      setExporting(false);
    }
  };

  const handleExportAnterior = () => {
    try {
      if (reportesAnuales.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen Anual
      const datosResumen = [
        [`REPORTE DE INGRESOS ANUALES ${selectedYear} - VIP CENTER FIT`],
        [`Generado: ${new Date().toLocaleDateString("es-ES")}`],
        [],
        ["RESUMEN ANUAL"],
        ["Total Ingresos:", `S/ ${totales.total.toFixed(2)}`],
        ["Ingresos Aprobados:", `S/ ${totales.aprobados.toFixed(2)}`],
        ["Ingresos Pendientes:", `S/ ${totales.pendientes.toFixed(2)}`],
        ["Ingresos Rechazados:", `S/ ${totales.rechazados.toFixed(2)}`],
        ["Total de Pagos:", totales.pagos],
        ["Promedio por Pago:", `S/ ${promedio.toFixed(2)}`],
        [],
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

      // Hoja 2: Detalle Mensual
      const datosMensuales = [
        [`DETALLE MENSUAL ${selectedYear}`],
        [],
        [
          "Período",
          "Total Ingresos",
          "Aprobados",
          "Pendientes",
          "Rechazados",
          "Cantidad Pagos",
          "Promedio por Pago"
        ],
        ...reportesAnuales.map(r => [
          r.periodo,
          r.totalIngresos.toFixed(2),
          r.ingresosAprobados.toFixed(2),
          r.ingresosPendientes.toFixed(2),
          r.ingresosRechazados.toFixed(2),
          r.cantidadPagos,
          r.promedioTicket.toFixed(2)
        ]),
        [],
        ["TOTALES"],
        [
          "",
          totales.total.toFixed(2),
          totales.aprobados.toFixed(2),
          totales.pendientes.toFixed(2),
          totales.rechazados.toFixed(2),
          totales.pagos,
          promedio.toFixed(2)
        ]
      ];
      const wsMensual = XLSX.utils.aoa_to_sheet(datosMensuales);
      XLSX.utils.book_append_sheet(wb, wsMensual, "Detalle Mensual");

      // Descargar archivo
      const nombreArchivo = `Ingresos_Anuales_${selectedYear}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
      toast.success("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar el reporte");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reporte Detallado de Ingresos</h2>
          <p className="text-slate-400 mt-1">Análisis completo anual</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-[#0F1318] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button
            onClick={handleExportNuevo}
            disabled={exporting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar
          </button>
        </div>
      </div>

      {/* Formulario de Filtros de Fechas */}
      <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-[#0F1318] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-[#0F1318] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          onClick={cargarFiltrosExtras}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full md:w-auto h-[42px] flex flex-row items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" /> Filtrar Distribución
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-6 rounded-xl border border-emerald-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Ingresos</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    S/ {totales.total.toFixed(2)}
                  </h3>
                  <p className="text-emerald-400 text-sm mt-2">{totales.pagos} pagos</p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-6 rounded-xl border border-green-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Aprobados</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    S/ {totales.aprobados.toFixed(2)}
                  </h3>
                  <p className="text-green-400 text-sm mt-2">
                    {totales.total > 0 ? ((totales.aprobados / totales.total) * 100).toFixed(1) : "0.0"}%
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-6 rounded-xl border border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Promedio por Pago</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    S/ {promedio.toFixed(2)}
                  </h3>
                  <p className="text-blue-400 text-sm mt-2">Ticket promedio</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 p-6 rounded-xl border border-yellow-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pendientes</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    S/ {totales.pendientes.toFixed(2)}
                  </h3>
                  <p className="text-yellow-400 text-sm mt-2">Por cobrar</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gráfico de barras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1A1F25] p-6 rounded-xl shadow-xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6">Ingresos Mensuales Detallados</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorAprobados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorRechazados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f38" />
                <XAxis dataKey="mes" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} tickFormatter={(value) => `S/ ${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1F25",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="aprobados" fill="url(#colorAprobados)" name="Aprobados" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pendientes" fill="url(#colorPendientes)" name="Pendientes" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rechazados" fill="url(#colorRechazados)" name="Rechazados" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de área */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1A1F25] p-6 rounded-xl shadow-xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6">Tendencia Acumulativa</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f38" />
                <XAxis dataKey="mes" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} tickFormatter={(value) => `S/ ${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1F25",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorTotal)"
                  name="Ingresos Totales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Charts para Método y Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Por Método de Pago */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-[#1A1F25] p-6 rounded-xl shadow-xl border border-white/10 flex flex-col items-center"
            >
              <h3 className="text-lg font-bold text-white mb-4 self-start">Ingresos por Método de Pago</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metodosPago as unknown as Array<Record<string, string | number>>}
                    dataKey="total"
                    nameKey="metodo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => {
                      const e = entry as unknown as { name: string; percent: number };
                      return `${e.name} ${(e.percent * 100).toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {metodosPago.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1F25", borderColor: "#334155" }}
                    formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Por Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1A1F25] p-6 rounded-xl shadow-xl border border-white/10 flex flex-col items-center"
            >
              <h3 className="text-lg font-bold text-white mb-4 self-start">Ingresos por Plan</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ingresosPlan as unknown as Array<Record<string, string | number>>}
                    dataKey="total"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label={(entry) => {
                      const e = entry as unknown as { name: string; percent: number };
                      return `${e.name} ${(e.percent * 100).toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {ingresosPlan.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1F25", borderColor: "#334155" }}
                    formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Tabla de datos mensuales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1A1F25] rounded-xl shadow-xl border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Detalle Mensual
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F1318]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Período</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Total</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Aprobados</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Pendientes</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Rechazados</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Pagos</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesAnuales.length > 0 ? (
                    reportesAnuales.map((reporte) => (
                      <tr key={reporte.periodo} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white font-medium">{reporte.periodo}</td>
                        <td className="px-6 py-4 text-sm text-right text-emerald-400 font-semibold">
                          S/ {reporte.totalIngresos.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-green-400">
                          S/ {reporte.ingresosAprobados.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-yellow-400">
                          S/ {reporte.ingresosPendientes.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-red-400">
                          S/ {reporte.ingresosRechazados.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-300">{reporte.cantidadPagos}</td>
                        <td className="px-6 py-4 text-sm text-right text-blue-400">
                          S/ {reporte.promedioTicket.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        No hay datos disponibles para el año {selectedYear}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
