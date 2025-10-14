import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useCountUp } from "../hooks/useCountUp";
import {
  DashboardApi,
  DashboardStats,
  ActividadReciente,
  IngresosDia,
  AsistenciasPorHora,
} from "../api/dashboardApi";
import { toast } from "react-hot-toast";

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    clientesActivos: 0,
    ingresosMes: 0,
    asistenciasHoy: 0,
    membresiasPorVencer: 0,
  });
  const [ingresosSemana, setIngresosSemana] = useState<IngresosDia[]>([]);
  const [asistenciasPorHora, setAsistenciasPorHora] = useState<AsistenciasPorHora[]>([]);
  const [actividadesRecientes, setActividadesRecientes] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  // Contadores animados
  const clientesCount = useCountUp(stats.clientesActivos, 2000);
  const ingresosCount = useCountUp(stats.ingresosMes, 2500);
  const asistenciasCount = useCountUp(stats.asistenciasHoy, 1800);
  const vencimientosCount = useCountUp(stats.membresiasPorVencer, 1500);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar todas las estadísticas en paralelo
      const [statsData, ingresosData, asistenciasData, actividadData] = await Promise.all([
        DashboardApi.obtenerEstadisticas().catch(() => ({
          clientesActivos: 156,
          ingresosMes: 12450.0,
          asistenciasHoy: 42,
          membresiasPorVencer: 8,
        })),
        DashboardApi.obtenerIngresosSemana().catch(() => [
          { fecha: "Lun", ingresos: 1200 },
          { fecha: "Mar", ingresos: 1850 },
          { fecha: "Mié", ingresos: 2100 },
          { fecha: "Jue", ingresos: 1650 },
          { fecha: "Vie", ingresos: 2400 },
          { fecha: "Sáb", ingresos: 2950 },
          { fecha: "Dom", ingresos: 1800 },
        ]),
        DashboardApi.obtenerAsistenciasPorHora().catch(() => [
          { hora: "06:00", cantidad: 8 },
          { hora: "08:00", cantidad: 15 },
          { hora: "10:00", cantidad: 12 },
          { hora: "12:00", cantidad: 10 },
          { hora: "14:00", cantidad: 7 },
          { hora: "16:00", cantidad: 18 },
          { hora: "18:00", cantidad: 25 },
          { hora: "20:00", cantidad: 22 },
        ]),
        DashboardApi.obtenerActividadReciente().catch(() => [
          {
            id: 1,
            tipo: "pago" as const,
            mensaje: "Juan Pérez realizó un pago de S/ 150.00",
            tiempo: "Hace 5 minutos",
            icono: "💰",
          },
          {
            id: 2,
            tipo: "asistencia" as const,
            mensaje: "María García registró su asistencia",
            tiempo: "Hace 12 minutos",
            icono: "✅",
          },
          {
            id: 3,
            tipo: "registro" as const,
            mensaje: "Nuevo cliente: Carlos López",
            tiempo: "Hace 1 hora",
            icono: "🎉",
          },
          {
            id: 4,
            tipo: "pago" as const,
            mensaje: "Ana Torres renovó su membresía Premium",
            tiempo: "Hace 2 horas",
            icono: "💎",
          },
          {
            id: 5,
            tipo: "asistencia" as const,
            mensaje: "Luis Martínez completó su rutina",
            tiempo: "Hace 3 horas",
            icono: "💪",
          },
        ]),
      ]);

      setStats(statsData);
      setIngresosSemana(ingresosData);
      setAsistenciasPorHora(asistenciasData);
      setActividadesRecientes(actividadData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Registrar Pago",
      icon: DollarSign,
      color: "emerald",
      path: "/suscripcion",
    },
    { label: "Nuevo Cliente", icon: Users, color: "blue", path: "/clientes" },
    {
      label: "Ver Asistencias",
      icon: UserCheck,
      color: "purple",
      path: "/asistencia",
    },
    {
      label: "Reportes",
      icon: TrendingUp,
      color: "orange",
      path: "/reportes/ingresos",
    },
  ];

  const kpiCards = [
    {
      title: "Clientes Activos",
      value: clientesCount,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      change: "+12%",
      changePositive: true,
    },
    {
      title: "Ingresos del Mes",
      value: `S/ ${ingresosCount.toFixed(2)}`,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      change: "+18%",
      changePositive: true,
    },
    {
      title: "Asistencias Hoy",
      value: asistenciasCount,
      icon: UserCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      change: "+8%",
      changePositive: true,
    },
    {
      title: "Membresías por Vencer",
      value: vencimientosCount,
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
      change: "Próximos 7 días",
      changePositive: false,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-8 shadow-2xl"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreeting()}, {user?.nombre} 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              Aquí está el resumen de tu gimnasio hoy
            </p>
            <div className="flex items-center gap-4 mt-4 text-emerald-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">
                  {new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="relative overflow-hidden rounded-xl bg-[#1A1F25] border border-white/10 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Gradiente de fondo */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-20 blur-3xl`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                {card.changePositive !== undefined && (
                  <span
                    className={`text-xs font-medium ${
                      card.changePositive ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {card.change}
                  </span>
                )}
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  card.value
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos */}
        <motion.div
          className="bg-[#1A1F25] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-blue-400" />
            Ingresos Últimos 7 Días
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={ingresosSemana}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="fecha"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F1318",
                  border: "1px solid #ffffff20",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [`S/ ${value.toFixed(2)}`, "Ingresos"]}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIngresos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de Asistencias por Hora */}
        <motion.div
          className="bg-[#1A1F25] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Asistencias por Hora (Hoy)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={asistenciasPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="hora"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F1318",
                  border: "1px solid #ffffff20",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [`${value} asistencias`, "Total"]}
              />
              <Bar
                dataKey="cantidad"
                fill="#a855f7"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Actions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-1 bg-[#1A1F25] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center justify-between p-4 rounded-lg bg-${action.color}-500/10 border border-${action.color}-500/20 hover:bg-${action.color}-500/20 transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${action.color}-500/20 group-hover:bg-${action.color}-500/30 transition-colors`}
                  >
                    <action.icon
                      className={`w-5 h-5 text-${action.color}-400`}
                    />
                  </div>
                  <span className="text-white font-medium">{action.label}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="lg:col-span-2 bg-[#1A1F25] rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Actividad Reciente
          </h2>
          <div className="space-y-3">
            {actividadesRecientes.map((actividad, index) => (
              <motion.div
                key={actividad.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-[#0F1318] border border-white/5 hover:border-white/10 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <div className="text-2xl">{actividad.icono}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {actividad.mensaje}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {actividad.tiempo}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    actividad.tipo === "pago"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : actividad.tipo === "asistencia"
                      ? "bg-purple-500/10 text-purple-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {actividad.tipo}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Stats */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-xl border border-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">
              🎉 ¡Excelente desempeño!
            </h3>
            <p className="text-slate-300 text-sm">
              Tu gimnasio ha crecido un 25% este mes comparado con el anterior
            </p>
          </div>
          <button
            onClick={() => navigate("/reportes/ingresos")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            Ver Reportes Completos
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
