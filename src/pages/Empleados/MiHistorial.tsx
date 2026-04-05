import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Clock,
  Monitor,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Globe,
} from "lucide-react";
import historialApi, {
  HistorialAccesoDTO,
  PaginaHistorial,
} from "../../api/historialApi";
import toast from "react-hot-toast";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MiHistorial() {
  const [historial, setHistorial] = useState<PaginaHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  useEffect(() => {
    cargarHistorial();
  }, [page]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await historialApi.obtenerMiHistorial(page, size);
      setHistorial(data);
    } catch (error: any) {
      console.error("Error al cargar historial:", error);
      toast.error(error.response?.data?.mensaje || "Error al cargar el historial. Backend no implementado.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const getEventIcon = (tipoEvento: string) => {
    switch (tipoEvento) {
      case "LOGIN":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "LOGOUT":
        return <XCircle className="w-5 h-5 text-blue-400" />;
      case "LOGIN_FAILED":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "PASSWORD_CHANGE":
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case "PASSWORD_RESET":
        return <Shield className="w-5 h-5 text-orange-400" />;
      case "PROFILE_UPDATE":
        return <Monitor className="w-5 h-5 text-purple-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getEventColor = (tipoEvento: string, exitoso: boolean) => {
    if (!exitoso) return "border-l-red-500 bg-red-500/5";

    switch (tipoEvento) {
      case "LOGIN":
        return "border-l-green-500 bg-green-500/5";
      case "LOGOUT":
        return "border-l-blue-500 bg-blue-500/5";
      case "PASSWORD_CHANGE":
      case "PASSWORD_RESET":
        return "border-l-yellow-500 bg-yellow-500/5";
      case "PROFILE_UPDATE":
        return "border-l-purple-500 bg-purple-500/5";
      default:
        return "border-l-slate-500 bg-slate-500/5";
    }
  };

  const formatFecha = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Hace un momento";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;

    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: fecha.getFullYear() !== ahora.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCompleta = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ============================================
  // ESTADÍSTICAS RÁPIDAS
  // ============================================

  const calcularEstadisticas = () => {
    if (!historial) return null;

    const total = historial.totalElements;
    const exitosos = historial.content.filter((h) => h.exitoso).length;
    const fallidos = historial.content.filter((h) => !h.exitoso).length;
    const logins = historial.content.filter((h) => h.tipoEvento === "LOGIN").length;

    return { total, exitosos, fallidos, logins };
  };

  const stats = calcularEstadisticas();

  // ============================================
  // RENDER - LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E12] via-[#0F1318] to-[#0A0E12] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-700/30 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-700/20 rounded animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                <div className="h-4 w-24 bg-slate-700/30 rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-slate-700/40 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="h-20 bg-slate-700/20 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E12] via-[#0F1318] to-[#0A0E12] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Mi Historial de Accesos</h1>
          </div>
          <p className="text-slate-400 ml-14">
            Registro completo de tu actividad en el sistema
          </p>
        </motion.div>

        {/* Estadísticas */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Eventos</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Exitosos</p>
                  <p className="text-2xl font-bold text-white">{stats.exitosos}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fallidos</p>
                  <p className="text-2xl font-bold text-white">{stats.fallidos}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Inicios de Sesión</p>
                  <p className="text-2xl font-bold text-white">{stats.logins}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista de Eventos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Actividad Reciente
            </h2>

            {historial && historial.content.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay eventos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {historial?.content.map((evento, index) => (
                    <motion.div
                      key={evento.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        border-l-4 rounded-lg p-4 
                        ${getEventColor(evento.tipoEvento, evento.exitoso)}
                        hover:bg-slate-700/20 transition-all duration-200
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Icono y Descripción */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{getEventIcon(evento.tipoEvento)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white">
                                {evento.descripcionEvento}
                              </p>
                              {!evento.exitoso && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                  Fallido
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span title={formatFechaCompleta(evento.fechaHora)}>
                                  {formatFecha(evento.fechaHora)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span>{evento.ipAddress}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Monitor className="w-4 h-4" />
                                <span>{evento.navegador}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4" />
                                <span>{evento.sistemaOperativo}</span>
                              </div>
                            </div>
                            {evento.detalles && (
                              <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-400">
                                {evento.detalles}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Paginación */}
          {historial && historial.totalPages > 1 && (
            <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Mostrando <span className="font-medium text-white">{historial.numberOfElements}</span> de{" "}
                  <span className="font-medium text-white">{historial.totalElements}</span> eventos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="
                      px-4 py-2 rounded-lg font-medium
                      bg-slate-700/50 text-white
                      hover:bg-slate-600/50
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200
                      flex items-center gap-2
                    "
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <span className="text-white font-medium">{page + 1}</span>
                    <span className="text-slate-400"> / {historial.totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= historial.totalPages - 1}
                    className="
                      px-4 py-2 rounded-lg font-medium
                      bg-slate-700/50 text-white
                      hover:bg-slate-600/50
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200
                      flex items-center gap-2
                    "
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
