import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity
} from "lucide-react";
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

// ==================== TIPOS ====================

type VistaReporte = "asistencia" | "suscripciones" | "ingresos";
type RangoTemporal = "dia" | "semana" | "mes" | "anio";

// ==================== DATOS MOCK ====================

// Datos para Reportes de Asistencia
const mockAsistenciasTendencia = [
  { dia: "1 Sep", asistencias: 145 },
  { dia: "5 Sep", asistencias: 189 },
  { dia: "10 Sep", asistencias: 167 },
  { dia: "15 Sep", asistencias: 203 },
  { dia: "20 Sep", asistencias: 178 },
  { dia: "25 Sep", asistencias: 195 },
  { dia: "30 Sep", asistencias: 212 }
];

const mockTopClientes = [
  { id: 1, nombre: "Carlos Mendoza", dias: 26, avatar: "CM" },
  { id: 2, nombre: "María González", dias: 26, avatar: "MG" },
  { id: 3, nombre: "Roberto Silva", dias: 24, avatar: "RS" },
  { id: 4, nombre: "Ana Rodríguez", dias: 22, avatar: "AR" },
  { id: 5, nombre: "Diego Morales", dias: 20, avatar: "DM" },
  { id: 6, nombre: "Laura Vega", dias: 19, avatar: "LV" },
  { id: 7, nombre: "Pedro Sánchez", dias: 18, avatar: "PS" },
  { id: 8, nombre: "Carmen López", dias: 17, avatar: "CL" },
  { id: 9, nombre: "Jorge Ramírez", dias: 16, avatar: "JR" },
  { id: 10, nombre: "Patricia Torres", dias: 15, avatar: "PT" }
];

const mockHorasPico = [
  { hora: "00:00", intensidad: 5 },
  { hora: "06:00", intensidad: 85 },
  { hora: "07:00", intensidad: 95 },
  { hora: "08:00", intensidad: 92 },
  { hora: "12:00", intensidad: 65 },
  { hora: "18:00", intensidad: 88 },
  { hora: "19:00", intensidad: 98 },
  { hora: "20:00", intensidad: 90 },
  { hora: "23:59", intensidad: 12 }
];

const mockClientesAusentes = [
  { id: 1, nombre: "Fernando Ortiz", avatar: "FO", diasAusente: 12, ultimaVisita: "2024-09-06", estado: "Ausente" },
  { id: 2, nombre: "Claudia Reyes", avatar: "CR", diasAusente: 9, ultimaVisita: "2024-09-09", estado: "Ausente" },
  { id: 3, nombre: "Ricardo Paz", avatar: "RP", diasAusente: 8, ultimaVisita: "2024-09-10", estado: "Ausente" },
  { id: 4, nombre: "Sofía Núñez", avatar: "SN", diasAusente: 7, ultimaVisita: "2024-09-11", estado: "Ausente" }
];

const mockAsistenciasRecientes = [
  { id: 1, nombre: "Luis Herrera", avatar: "LH", hora: "18:45", membresia: "VIP", estado: "Activo" },
  { id: 2, nombre: "Rosa Campos", avatar: "RC", hora: "18:30", membresia: "Mensual", estado: "Activo" },
  { id: 3, nombre: "Miguel Castro", avatar: "MC", hora: "18:15", membresia: "Anual", estado: "Activo" },
  { id: 4, nombre: "Elena Vargas", avatar: "EV", hora: "18:00", membresia: "Premium", estado: "Activo" }
];

// Datos para Reportes de Suscripciones
const mockRenovacionesCancelaciones = [
  { mes: "Ene", renovaciones: 180, cancelaciones: 25 },
  { mes: "Feb", renovaciones: 165, cancelaciones: 30 },
  { mes: "Mar", renovaciones: 195, cancelaciones: 22 },
  { mes: "Abr", renovaciones: 210, cancelaciones: 28 },
  { mes: "May", renovaciones: 198, cancelaciones: 35 },
  { mes: "Jun", renovaciones: 220, cancelaciones: 20 },
  { mes: "Jul", renovaciones: 205, cancelaciones: 32 },
  { mes: "Ago", renovaciones: 215, cancelaciones: 26 },
  { mes: "Sep", renovaciones: 203, cancelaciones: 34 },
  { mes: "Oct", renovaciones: 0, cancelaciones: 0 },
  { mes: "Nov", renovaciones: 0, cancelaciones: 0 },
  { mes: "Dic", renovaciones: 0, cancelaciones: 0 }
];

const mockDistribucionEstado = [
  { name: "Activas", value: 1247, color: "#10b981" },
  { name: "Vencidas", value: 89, color: "#ef4444" },
  { name: "Por Vencer", value: 156, color: "#f59e0b" }
];

const mockDistribucionMembresias = [
  { name: "Mensual", value: 450, color: "#60a5fa" },
  { name: "Anual", value: 380, color: "#10b981" },
  { name: "VIP", value: 280, color: "#fb923c" },
  { name: "Clases", value: 226, color: "#a78bfa" }
];

const mockProximasVencer = [
  { id: 1, nombre: "María Rodríguez", avatar: "MR", plan: "VIP", diasRestantes: 5, estado: "POR VENCER" },
  { id: 2, nombre: "Juan López", avatar: "JL", plan: "Mensual", diasRestantes: 8, estado: "POR VENCER" },
  { id: 3, nombre: "Ana Sánchez", avatar: "AS", plan: "Anual", diasRestantes: 12, estado: "POR VENCER" },
  { id: 4, nombre: "Carlos Martín", avatar: "CM", plan: "Clases", diasRestantes: 14, estado: "POR VENCER" }
];

// Datos para Reportes de Ingresos
const mockIngresosTendencia = [
  { dia: "1 Sep", monto: 1850 },
  { dia: "5 Sep", monto: 2200 },
  { dia: "10 Sep", monto: 1950 },
  { dia: "15 Sep", monto: 2450 },
  { dia: "20 Sep", monto: 2100 },
  { dia: "25 Sep", monto: 2350 },
  { dia: "30 Sep", monto: 2680 }
];

const mockIngresosPorPlan = [
  { name: "Plan VIP", value: 16000, color: "#fbbf24" },
  { name: "Plan Anual", value: 18270, color: "#10b981" },
  { name: "Plan Mensual", value: 11410, color: "#60a5fa" }
];

const mockHistorialPagos = [
  { id: 1, fecha: "18/09/2024", hora: "10:30", cliente: "María García", plan: "VIP", metodo: "Tarjeta", monto: 180, estado: "Confirmado" },
  { id: 2, fecha: "18/09/2024", hora: "09:15", cliente: "Carlos Mendoza", plan: "Anual", metodo: "Transferencia", monto: 1200, estado: "Confirmado" },
  { id: 3, fecha: "17/09/2024", hora: "16:45", cliente: "Ana Rodríguez", plan: "Mensual", metodo: "Efectivo", monto: 80, estado: "Confirmado" },
  { id: 4, fecha: "17/09/2024", hora: "14:30", cliente: "Luis Herrera", plan: "VIP", metodo: "Tarjeta", monto: 180, estado: "Confirmado" },
  { id: 5, fecha: "16/09/2024", hora: "11:30", cliente: "Carmen López", plan: "Mensual", metodo: "Efectivo", monto: 80, estado: "Confirmado" },
  { id: 6, fecha: "16/09/2024", hora: "08:45", cliente: "Roberto Silva", plan: "Anual", metodo: "Yape", monto: 1200, estado: "Pendiente" },
  { id: 7, fecha: "15/09/2024", hora: "19:15", cliente: "Patricia Vega", plan: "VIP", metodo: "Tarjeta", monto: 180, estado: "Confirmado" },
  { id: 8, fecha: "15/09/2024", hora: "17:30", cliente: "Jorge Ramírez", plan: "Mensual", metodo: "Efectivo", monto: 80, estado: "Confirmado" }
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function ReportesCompleto() {
  const [vistaActiva, setVistaActiva] = useState<VistaReporte>("asistencia");
  const [rangoTemporal, setRangoTemporal] = useState<RangoTemporal>("mes");

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      {/* Sistema de Navegación Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Sistema de Reportes</h1>
            <p className="text-slate-400">Analítica completa del gimnasio</p>
          </div>

          {/* Filtros Temporales Globales */}
          <div className="flex gap-2">
            {(["dia", "semana", "mes", "anio"] as RangoTemporal[]).map((rango) => (
              <button
                key={rango}
                onClick={() => setRangoTemporal(rango)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  rangoTemporal === rango
                    ? "bg-[#10b981] text-white shadow-lg shadow-emerald-500/30"
                    : "bg-[#374151] text-slate-300 hover:bg-[#4b5563]"
                }`}
              >
                {rango === "dia" && "Día"}
                {rango === "semana" && "Semana"}
                {rango === "mes" && "Mes"}
                {rango === "anio" && "Año"}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Navegación Entre Vistas */}
        <div className="flex gap-3">
          <button
            onClick={() => setVistaActiva("asistencia")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base transition-all ${
              vistaActiva === "asistencia"
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-xl shadow-emerald-500/30 scale-105"
                : "bg-[#1e293b] text-slate-400 hover:bg-[#334155] hover:text-white"
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span>Reportes de Asistencia</span>
          </button>

          <button
            onClick={() => setVistaActiva("suscripciones")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base transition-all ${
              vistaActiva === "suscripciones"
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-xl shadow-emerald-500/30 scale-105"
                : "bg-[#1e293b] text-slate-400 hover:bg-[#334155] hover:text-white"
            }`}
          >
            <ScrollText className="w-6 h-6" />
            <span>Reportes de Suscripciones</span>
          </button>

          <button
            onClick={() => setVistaActiva("ingresos")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base transition-all ${
              vistaActiva === "ingresos"
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-xl shadow-emerald-500/30 scale-105"
                : "bg-[#1e293b] text-slate-400 hover:bg-[#334155] hover:text-white"
            }`}
          >
            <Wallet className="w-6 h-6" />
            <span>Reportes de Ingresos</span>
          </button>
        </div>
      </motion.div>

      {/* Contenido Dinámico de Vistas */}
      <AnimatePresence mode="wait">
        {vistaActiva === "asistencia" && (
          <VistaAsistencia key="asistencia" />
        )}
        {vistaActiva === "suscripciones" && (
          <VistaSuscripciones key="suscripciones" />
        )}
        {vistaActiva === "ingresos" && (
          <VistaIngresos key="ingresos" />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== VISTA 1: ASISTENCIA ====================

function VistaAsistencia() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          numero="8,750"
          label="TOTAL ASISTENCIAS"
          indicador="↑ +12.6% vs mes anterior"
          tendencia="positiva"
          icono={<Users className="w-8 h-8" />}
          colorFondo="from-emerald-500/20 to-emerald-600/10"
          colorBorde="border-emerald-500/50"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero="145"
          label="NUEVOS CLIENTES"
          indicador="↑ +4.2% vs mes anterior"
          tendencia="positiva"
          icono={<UserCheck className="w-8 h-8" />}
          colorFondo="from-blue-500/20 to-blue-600/10"
          colorBorde="border-blue-500/50"
          colorTexto="text-blue-400"
        />
        <MetricCard
          numero="89"
          label="CLIENTES AUSENTES (7+ DÍAS)"
          indicador="↓ -3.1% vs mes anterior"
          tendencia="positiva"
          icono={<UserX className="w-8 h-8" />}
          colorFondo="from-orange-500/20 to-orange-600/10"
          colorBorde="border-orange-500/50"
          colorTexto="text-orange-400"
        />
        <MetricCard
          numero="92%"
          label="TASA DE RETENCIÓN"
          indicador="↑ +2.8% vs mes anterior"
          tendencia="positiva"
          icono={<Award className="w-8 h-8" />}
          colorFondo="from-cyan-500/20 to-cyan-600/10"
          colorBorde="border-cyan-500/50"
          colorTexto="text-cyan-400"
        />
      </div>

      {/* Sección Media: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendencia */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Tendencia de Asistencia Diaria (Últimos 30 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAsistenciasTendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="dia" stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
              <Line
                type="monotone"
                dataKey="asistencias"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Clientes Más Constantes */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top 10 Clientes Más Constantes
          </h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {mockTopClientes.map((cliente, index) => (
              <div
                key={cliente.id}
                className="flex items-center gap-3 bg-[#0f172a] p-3 rounded-lg hover:bg-[#1e293b] transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                  {cliente.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{cliente.nombre}</p>
                  <div className="w-full bg-[#374151] rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${(cliente.dias / 30) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-emerald-400 font-bold text-sm whitespace-nowrap">
                  {cliente.dias} días
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa de Calor de Horarios */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Horas Pico del Gimnasio - Mapa de Calor
            </h3>
            <p className="text-sm text-slate-400">Intensidad de asistencia por hora del día</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockHorasPico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hora" stroke="#9ca3af" style={{ fontSize: "11px" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
              <Bar dataKey="intensidad" radius={[8, 8, 0, 0]}>
                {mockHorasPico.map((entry, index) => {
                  let color = "#374151"; // Bajo
                  if (entry.intensidad > 80) color = "#fb923c"; // Alto
                  else if (entry.intensidad > 50) color = "#10b981"; // Medio
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tablas Paralelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clientes Ausentes */}
          <div className="bg-[#1f2937] rounded-xl p-5 border border-white/10 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Clientes Ausentes
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
              {mockClientesAusentes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="bg-[#0f172a] p-3 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-semibold text-xs">
                      {cliente.avatar}
                    </div>
                    <p className="text-white font-medium text-xs flex-1">{cliente.nombre}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Última visita:</span>
                    <span className="text-slate-300">{cliente.ultimaVisita}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-red-400 font-bold">{cliente.diasAusente} días ausente</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                      {cliente.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asistencias Recientes */}
          <div className="bg-[#1f2937] rounded-xl p-5 border border-white/10 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Asistencias Recientes
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
              {mockAsistenciasRecientes.map((asistencia) => (
                <div
                  key={asistencia.id}
                  className="bg-[#0f172a] p-3 rounded-lg border border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
                      {asistencia.avatar}
                    </div>
                    <p className="text-white font-medium text-xs flex-1">{asistencia.nombre}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Hora:</span>
                    <span className="text-emerald-400 font-semibold">{asistencia.hora}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded font-semibold ${getBadgeMembresia(asistencia.membresia)}`}>
                      {asistencia.membresia}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-semibold">
                      {asistencia.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== VISTA 2: SUSCRIPCIONES ====================

function VistaSuscripciones() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          numero="1,247"
          label="SUSCRIPCIONES ACTIVAS"
          indicador="↑ +8.3% vs mes anterior"
          tendencia="positiva"
          icono={<CheckCircle2 className="w-8 h-8" />}
          colorFondo="from-emerald-500/20 to-emerald-600/10"
          colorBorde="border-emerald-500/50"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero="89"
          label="SUSCRIPCIONES VENCIDAS"
          indicador="↓ -12.5% vs mes anterior"
          tendencia="positiva"
          icono={<AlertTriangle className="w-8 h-8" />}
          colorFondo="from-red-500/20 to-red-600/10"
          colorBorde="border-red-500/50"
          colorTexto="text-red-400"
        />
        <MetricCard
          numero="156"
          label="PRÓXIMAS A VENCER"
          indicador="↓ -5.2% vs mes anterior"
          tendencia="positiva"
          icono={<Clock className="w-8 h-8" />}
          colorFondo="from-orange-500/20 to-orange-600/10"
          colorBorde="border-orange-500/50"
          colorTexto="text-orange-400"
        />
        <MetricCard
          numero="203"
          label="RENOVACIONES DEL MES"
          indicador="↑ +15.7% vs mes anterior"
          tendencia="positiva"
          icono={<Activity className="w-8 h-8" />}
          colorFondo="from-blue-500/20 to-blue-600/10"
          colorBorde="border-blue-500/50"
          colorTexto="text-blue-400"
        />
        <MetricCard
          numero="34"
          label="CANCELACIONES"
          indicador="↑ +3.9% vs mes anterior"
          tendencia="negativa"
          icono={<UserX className="w-8 h-8" />}
          colorFondo="from-purple-500/20 to-purple-600/10"
          colorBorde="border-purple-500/50"
          colorTexto="text-purple-400"
        />
      </div>

      {/* Sección Media: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renovaciones y Cancelaciones */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            Renovaciones y Cancelaciones (Últimos 12 Meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRenovacionesCancelaciones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
              <Legend />
              <Bar dataKey="renovaciones" fill="#10b981" radius={[8, 8, 0, 0]} name="Renovaciones" />
              <Bar dataKey="cancelaciones" fill="#ef4444" radius={[8, 8, 0, 0]} name="Cancelaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            Distribución por Estado de Suscripción
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockDistribucionEstado}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => {
                  // entry: PieLabelRenderProps
                  const e = entry as { name: string; percent?: number };
                  return `${e.name} ${e.percent !== undefined ? (e.percent * 100).toFixed(0) : "0"}%`;
                }}
                labelLine={false}
              >
                {mockDistribucionEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {mockDistribucionEstado.map((item) => (
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

      {/* Sección Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas a Vencer */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Próximas a Vencer (7-15 días)
          </h3>
          <div className="space-y-3">
            {mockProximasVencer.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center text-white font-semibold">
                    {cliente.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{cliente.nombre}</p>
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
            ))}
          </div>
        </div>

        {/* Distribución de Tipos de Membresía */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">
            Distribución de Tipos de Membresía
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={mockDistribucionMembresias}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={(entry) => {
                  const e = entry as { name: string; percent?: number };
                  return `${e.name} ${e.percent !== undefined ? (e.percent * 100).toFixed(0) : "0"}%`;
                }}
              >
                {mockDistribucionMembresias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {mockDistribucionMembresias.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== VISTA 3: INGRESOS ====================

function VistaIngresos() {
  const [fechaInicio, setFechaInicio] = useState("2024-09-01");
  const [fechaFin, setFechaFin] = useState("2024-09-18");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          numero="$45,680"
          label="INGRESOS TOTALES"
          indicador="↑ +18% vs mes anterior"
          tendencia="positiva"
          icono={<DollarSign className="w-8 h-8" />}
          colorFondo="from-emerald-500/20 to-emerald-600/10"
          colorBorde="border-emerald-500/50"
          colorTexto="text-emerald-400"
        />
        <MetricCard
          numero="$15,240"
          label="INGRESOS ESTA SEMANA"
          indicador="↑ +8% vs semana anterior"
          tendencia="positiva"
          icono={<Calendar className="w-8 h-8" />}
          colorFondo="from-blue-500/20 to-blue-600/10"
          colorBorde="border-blue-500/50"
          colorTexto="text-blue-400"
        />
        <MetricCard
          numero="$2,180"
          label="INGRESOS HOY"
          indicador="↑ +5% vs ayer"
          tendencia="positiva"
          icono={<TrendingUp className="w-8 h-8" />}
          colorFondo="from-cyan-500/20 to-cyan-600/10"
          colorBorde="border-cyan-500/50"
          colorTexto="text-cyan-400"
        />
        <MetricCard
          numero="324"
          label="PAGOS REALIZADOS"
          indicador="↑ 16 este mes"
          tendencia="positiva"
          icono={<CheckCircle2 className="w-8 h-8" />}
          colorFondo="from-green-500/20 to-green-600/10"
          colorBorde="border-green-500/50"
          colorTexto="text-green-400"
        />
      </div>

      {/* Sección Media: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ingresos */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">
            Tendencia de Ingresos (Últimos 30 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockIngresosTendencia}>
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="dia" stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                formatter={(value) => [`$${value}`, "Monto"]}
              />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMonto)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por Tipo de Plan */}
        <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">
            Ingresos por Tipo de Plan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockIngresosPorPlan}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => {
                  const e = entry as { name: string; value?: number };
                  return `${e.name}: $${e.value !== undefined ? e.value.toLocaleString() : "0"}`;
                }}
              >
                {mockIngresosPorPlan.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                formatter={(value) => `$${value}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {mockIngresosPorPlan.map((item) => (
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

      {/* Tabla de Historial de Pagos */}
      <div className="bg-[#1f2937] rounded-xl p-6 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            Historial de Pagos
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-emerald-500/30">
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-[#0f172a] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-[#0f172a] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tipo de Plan</label>
            <select className="w-full bg-[#0f172a] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none text-sm">
              <option>Todos los planes</option>
              <option>VIP</option>
              <option>Anual</option>
              <option>Mensual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Método de Pago</label>
            <select className="w-full bg-[#0f172a] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none text-sm">
              <option>Todos los métodos</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Yape</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0f172a] border-b border-white/10">
                <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                  Fecha
                </th>
                <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                  Cliente
                </th>
                <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                  Tipo de Plan
                </th>
                <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                  Método de Pago
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
              {mockHistorialPagos.map((pago, index) => (
                <tr
                  key={pago.id}
                  className={`border-b border-white/5 hover:bg-[#0f172a] transition-colors ${
                    index % 2 === 0 ? "bg-[#1a2332]" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="text-white font-medium">{pago.fecha}</div>
                    <div className="text-slate-400 text-xs">{pago.hora}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{pago.cliente}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeMembresia(pago.plan)}`}>
                      {pago.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeMetodoPago(pago.metodo)}`}>
                      {pago.metodo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">
                    ${pago.monto}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        pago.estado === "Confirmado"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {pago.estado === "Confirmado" ? "✓" : "⏳"} {pago.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Métodos de Pago */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-6 border border-emerald-500/30 shadow-xl">
          <div className="text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-wide">
            Total Efectivo
          </div>
          <div className="text-3xl font-bold text-white mb-1">$8,240</div>
          <div className="text-sm text-slate-400">18% del total</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <div className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wide">
            Total Tarjetas
          </div>
          <div className="text-3xl font-bold text-white mb-1">$22,140</div>
          <div className="text-sm text-slate-400">48% del total</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-6 border border-orange-500/30 shadow-xl">
          <div className="text-orange-400 text-sm font-semibold mb-2 uppercase tracking-wide">
            Total Transferencias
          </div>
          <div className="text-3xl font-bold text-white mb-1">$15,300</div>
          <div className="text-sm text-slate-400">34% del total</div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

interface MetricCardProps {
  numero: string;
  label: string;
  indicador: string;
  tendencia: "positiva" | "negativa";
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
      className={`bg-gradient-to-br ${colorFondo} rounded-xl p-6 border ${colorBorde} shadow-xl`}
    >
      <div className={`flex items-center justify-between mb-4 ${colorTexto}`}>
        {icono}
      </div>
      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{numero}</div>
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
    </motion.div>
  );
}

// Función auxiliar para obtener clases de badge de membresía
function getBadgeMembresia(tipo: string): string {
  const badges: Record<string, string> = {
    VIP: "bg-yellow-500/20 text-yellow-400",
    Premium: "bg-purple-500/20 text-purple-400",
    Anual: "bg-emerald-500/20 text-emerald-400",
    Mensual: "bg-blue-500/20 text-blue-400",
    Clases: "bg-cyan-500/20 text-cyan-400",
    Básica: "bg-slate-500/20 text-slate-400"
  };
  return badges[tipo] || "bg-gray-500/20 text-gray-400";
}

// Función auxiliar para obtener clases de badge de método de pago
function getBadgeMetodoPago(metodo: string): string {
  const badges: Record<string, string> = {
    Tarjeta: "bg-blue-500/20 text-blue-400",
    Transferencia: "bg-orange-500/20 text-orange-400",
    Efectivo: "bg-emerald-500/20 text-emerald-400",
    Yape: "bg-purple-500/20 text-purple-400"
  };
  return badges[metodo] || "bg-gray-500/20 text-gray-400";
}
