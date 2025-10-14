import { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Filter,
  Trash2
} from "lucide-react";
import { Asistencia } from "../../api/asistenciaApi";
import { toast } from "react-hot-toast";
import { useAsistenciasStore } from "../../store/useAsistenciasStore";

export default function AsistenciaModule() {
  const { asistencias, loading, cargarAsistencias, eliminarAsistencia } = useAsistenciasStore();
  const [filtro, setFiltro] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar al montar y cada 30 segundos si auto-refresh está activo
  useEffect(() => {
    cargarAsistencias();

    if (autoRefresh) {
      const interval = setInterval(cargarAsistencias, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh, cargarAsistencias]);

  // 🔔 Escuchar evento de nueva asistencia registrada desde CheckIn
  useEffect(() => {
    const handleNuevaAsistencia = (event: Event) => {
      console.log("🔔 Nueva asistencia detectada, refrescando lista...");
      
      // Mostrar toast con el nombre del cliente si está disponible
      const customEvent = event as CustomEvent;
      const clienteNombre = customEvent.detail?.clienteNombre;
      
      if (clienteNombre) {
        toast.success(`Nueva asistencia registrada: ${clienteNombre}`, {
          icon: "✅",
          duration: 4000,
        });
      }
      
      cargarAsistencias();
    };

    window.addEventListener("asistencia-registrada", handleNuevaAsistencia);
    
    return () => {
      window.removeEventListener("asistencia-registrada", handleNuevaAsistencia);
    };
  }, [cargarAsistencias]);
  
  // Manejar eliminación con confirmación
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta asistencia?")) {
      return;
    }
    await eliminarAsistencia(id);
  };

  // Filtrar asistencias
  const asistenciasFiltradas = asistencias.filter((a) => {
    if (!filtro.trim()) return true;
    const textoFiltro = filtro.toLowerCase();
    return (
      a.cliente.nombre.toLowerCase().includes(textoFiltro) ||
      a.cliente.apellido.toLowerCase().includes(textoFiltro) ||
      a.cliente.telefono?.toLowerCase().includes(textoFiltro) ||
      a.cliente.membresia?.nombre.toLowerCase().includes(textoFiltro)
    );
  });

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Asistencias Hoy"
          value={asistencias.length}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Última Entrada"
          value={asistencias[0]?.horaFormateada || "--:--"}
          color="cyan"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Promedio Diario"
          value="45"
          color="purple"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Fecha"
          value={new Date().getDate().toString()}
          subtitle={new Date().toLocaleDateString("es-PE", { month: "short" })}
          color="orange"
        />
      </div>

      {/* Controles */}
      <div className="bg-[#1A1F25] rounded-xl border border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o membresía..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                autoRefresh
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
              }`}
              title={autoRefresh ? "Auto-actualización activada (cada 30s)" : "Auto-actualización desactivada"}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto-actualizar
            </button>

            <button
              onClick={() => {
                toast.loading("Actualizando lista...", { id: "refresh-asistencias" });
                cargarAsistencias().finally(() => {
                  toast.dismiss("refresh-asistencias");
                  toast.success("Lista actualizada", { duration: 2000 });
                });
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading
                  ? "bg-orange-700/60 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500"
              } text-white`}
              title="Actualizar lista ahora"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando..." : "Refrescar"}
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de actualización */}
      {loading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-emerald-400 font-medium">Actualizando lista de asistencias...</span>
        </div>
      )}

      {/* Tabla de asistencias */}
      <div className="bg-[#1A1F25] rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0F1318] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Membresía
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando asistencias...
                  </td>
                </tr>
              ) : asistenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {filtro ? "No se encontraron resultados" : "No hay asistencias registradas hoy"}
                  </td>
                </tr>
              ) : (
                asistenciasFiltradas.map((asistencia) => (
                  <tr
                    key={asistencia.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        {asistencia.horaFormateada}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {asistencia.cliente.nombre} {asistencia.cliente.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {asistencia.cliente.telefono || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {asistencia.cliente.membresia ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{ 
                              backgroundColor: asistencia.cliente.membresia.color || "#3B82F6",
                              boxShadow: `0 0 8px ${asistencia.cliente.membresia.color || "#3B82F6"}80`
                            }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-medium">
                              {asistencia.cliente.membresia.nombre}
                            </span>
                            {asistencia.cliente.fechaVencimiento && (() => {
                              const fechaVenc = new Date(asistencia.cliente.fechaVencimiento);
                              const hoy = new Date();
                              const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                              const estaProximoAVencer = diasRestantes <= 7 && diasRestantes >= 0;
                              const yaVencio = diasRestantes < 0;

                              if (yaVencio) {
                                return (
                                  <span className="text-xs text-red-400 font-medium">
                                    ⛔ Vencida
                                  </span>
                                );
                              } else if (estaProximoAVencer) {
                                return (
                                  <span className="text-xs text-yellow-400 font-medium animate-pulse">
                                    ⚠️ Vence en {diasRestantes}d
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-400 font-medium">❌ Sin membresía</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          asistencia.cliente.estado === "activo"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-orange-500/10 text-orange-400"
                        }`}
                      >
                        {asistencia.cliente.estado === "activo" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {asistencia.cliente.estado === "activo" ? "Activo" : "Vencido"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400">
                        {asistencia.tipoRegistro === "QR_AUTO"
                          ? "QR"
                          : asistencia.tipoRegistro === "MANUAL_STAFF"
                          ? "Manual"
                          : "Molinete"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleEliminar(asistencia.id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors group"
                          title="Eliminar asistencia"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info footer */}
      {asistenciasFiltradas.length > 0 && (
        <div className="text-center text-sm text-slate-400">
          Mostrando {asistenciasFiltradas.length} de {asistencias.length} asistencias del día
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: "emerald" | "cyan" | "purple" | "orange";
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-4`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className={colorClasses[color]}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {subtitle && <span className="text-sm text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
}
