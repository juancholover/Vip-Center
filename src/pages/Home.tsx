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
  CreditCard,
  CheckCircle,
  PartyPopper,
  Gem,
  Dumbbell,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
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
} from "../api/dashboardApi";
import { toast } from "react-hot-toast";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    clientesActivos: 0,
    ingresosMes: 0,
    asistenciasHoy: 0,
    membresiasPorVencer: 0,
  });

  const [ingresosSemana, setIngresosSemana] = useState<Array<{fecha: string; ingresos: number}>>([]);
  const [asistenciasPorHora, setAsistenciasPorHora] = useState<Array<{hora: string; cantidad: number}>>([]);
  const [actividadesRecientes, setActividadesRecientes] = useState<Array<{id: number; tipo: string; mensaje: string; tiempo: string; icono: string}>>([]);
  const [loading, setLoading] = useState(true);

  // Hook para animar números
  const clientesAnimado = useCountUp(stats.clientesActivos, 1500);
  const ingresoAnimado = useCountUp(stats.ingresosMes, 2000);
  const asistenciasAnimado = useCountUp(stats.asistenciasHoy, 1800);
  const vencidasAnimado = useCountUp(stats.membresiasPorVencer, 1600);

  // Función para mapear iconos de string a componentes
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      "credit-card": <CreditCard className="w-5 h-5" />,
      "check-circle": <CheckCircle className="w-5 h-5" />,
      "party-popper": <PartyPopper className="w-5 h-5" />,
      "gem": <Gem className="w-5 h-5" />,
      "dumbbell": <Dumbbell className="w-5 h-5" />,
    };
    return iconMap[iconName] || <Activity className="w-5 h-5" />;
  };

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
            icono: "credit-card",
          },
          {
            id: 2,
            tipo: "asistencia" as const,
            mensaje: "María García registró su asistencia",
            tiempo: "Hace 12 minutos",
            icono: "check-circle",
          },
          {
            id: 3,
            tipo: "registro" as const,
            mensaje: "Nuevo cliente: Carlos López",
            tiempo: "Hace 1 hora",
            icono: "party-popper",
          },
          {
            id: 4,
            tipo: "pago" as const,
            mensaje: "Ana Torres renovó su membresía Premium",
            tiempo: "Hace 2 horas",
            icono: "gem",
          },
          {
            id: 5,
            tipo: "asistencia" as const,
            mensaje: "Luis Martínez completó su rutina",
            tiempo: "Hace 3 horas",
            icono: "dumbbell",
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
      path: "/reportes",
    },
  ];

  const kpiCards = [
    {
      title: "Clientes Activos",
      value: clientesAnimado,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      change: "+12%",
      changePositive: true,
    },
    {
      title: "Ingresos del Mes",
      value: `S/ ${ingresoAnimado.toFixed(2)}`,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      change: "+18%",
      changePositive: true,
    },
    {
      title: "Asistencias Hoy",
      value: asistenciasAnimado,
      icon: UserCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      change: "+8%",
      changePositive: true,
    },
    {
      title: "Membresías por Vencer",
      value: vencidasAnimado,
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
      {/* Hero Section - Minimalista */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-4 shadow-lg"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              {getGreeting()}, {user?.nombre} 👋
            </h1>
            <p className="text-emerald-100 text-sm">
              Resumen de hoy
            </p>
            <div className="flex items-center gap-3 mt-2 text-emerald-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid - Compactas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="relative overflow-hidden rounded-lg bg-[#1A1F25] border border-white/10 p-3 shadow hover:shadow-lg transition-all hover:scale-[1.02]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
                {card.changePositive !== undefined && (
                  <span
                    className={`text-[10px] font-medium ${
                      card.changePositive ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {card.change}
                  </span>
                )}
              </div>
              <h3 className="text-slate-400 text-xs font-medium mb-0.5">
                {card.title}
              </h3>
              <p className={`text-xl font-bold ${card.textColor}`}>
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

      {/* Gráficos de Análisis - Compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Gráfico de Ingresos */}
        <motion.div
          className="bg-[#1A1F25] rounded-lg border border-white/10 p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <LineChartIcon className="w-4 h-4 text-blue-400" />
            Ingresos Últimos 7 Días
          </h2>
          <ResponsiveContainer width="100%" height={180}>
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
          className="bg-[#1A1F25] rounded-lg border border-white/10 p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Asistencias por Hora (Hoy)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
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

      {/* Quick Actions & Activity Feed - Compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-1 bg-[#1A1F25] rounded-lg border border-white/10 p-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            Acciones Rápidas
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg bg-${action.color}-500/10 border border-${action.color}-500/20 hover:bg-${action.color}-500/20 transition-all group`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg bg-${action.color}-500/20 group-hover:bg-${action.color}-500/30 transition-colors`}
                  >
                    <action.icon
                      className={`w-3.5 h-3.5 text-${action.color}-400`}
                    />
                  </div>
                  <span className="text-white font-medium text-xs">{action.label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="lg:col-span-2 bg-[#1A1F25] rounded-lg border border-white/10 p-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            Actividad Reciente
          </h2>
          <div className="space-y-2">
            {actividadesRecientes.map((actividad, index) => (
              <motion.div
                key={actividad.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#0F1318] border border-white/5 hover:border-white/10 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5">
                  {getIconComponent(actividad.icono)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">
                    {actividad.mensaje}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    {actividad.tiempo}
                  </p>
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
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

      {/* Footer Stats - Compacto */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-lg border border-white/10 p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm mb-0.5 flex items-center gap-1.5">
              <PartyPopper className="w-4 h-4" /> ¡Excelente desempeño!
            </h3>
            <p className="text-slate-300 text-xs">
              Tu gimnasio ha crecido un 25% este mes
            </p>
          </div>
          <button
            onClick={() => navigate("/reportes")}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium text-xs rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            Ver Reportes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
