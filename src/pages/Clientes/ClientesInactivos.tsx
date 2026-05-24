import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Users,
  UserX,
  Shield,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  ChevronDown
} from "lucide-react";
import { InactividadApi } from "../../api/inactividadApi";
import type { ClienteInactivoDTO, InactividadResponse } from "../../api/inactividadApi";
import { useAuthStore } from "../../store/useAuthStore";

export default function ClientesInactivos() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.some((r: string) => r.toLowerCase() === "admin") ?? false;

  const [data, setData] = useState<InactividadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [diasMinimo, setDiasMinimo] = useState(0);
  const [nivelRiesgoFiltro, setNivelRiesgoFiltro] = useState<string>("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const result = await InactividadApi.obtenerClientesInactivos(
        diasMinimo,
        nivelRiesgoFiltro || undefined
      );
      setData(result);
    } catch (error) {
      console.error("Error al cargar inactivos:", error);
      toast.error("Error al cargar clientes inactivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasMinimo, nivelRiesgoFiltro]);

  const handleExportar = async () => {
    setExporting(true);
    try {
      const blob = await InactividadApi.exportarClientesInactivos(diasMinimo || 15);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_inactivos_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Archivo exportado correctamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar clientes inactivos");
    } finally {
      setExporting(false);
    }
  };

  const getRiesgoBadge = (nivel: string) => {
    switch (nivel) {
      case "BAJO":
        return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", dot: "#22c55e" };
      case "MEDIO":
        return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", dot: "#eab308" };
      case "ALTO":
        return { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", dot: "#f97316" };
      case "CRITICO":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "#ef4444" };
      default:
        return { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", dot: "#94a3b8" };
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Nunca";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const resumenCards = [
    { label: "Total Inactivos", value: data?.totalInactivos ?? 0, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", icon: <Users className="w-5 h-5" /> },
    { label: "Bajo Riesgo", value: data?.bajo ?? 0, color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20", icon: <Shield className="w-5 h-5" /> },
    { label: "Medio Riesgo", value: data?.medio ?? 0, color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20", icon: <Clock className="w-5 h-5" /> },
    { label: "Alto Riesgo", value: data?.alto ?? 0, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", icon: <AlertTriangle className="w-5 h-5" /> },
    { label: "Crítico", value: data?.critico ?? 0, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20", icon: <UserX className="w-5 h-5" /> },
  ];

  return (
    <motion.div
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            <Activity className="w-7 h-7" />
            Clientes Inactivos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Detecta clientes sin asistencia para campañas de reactivación
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtro días mínimo */}
          <div className="relative flex items-center gap-2 bg-[#1A1F25] rounded-lg border border-white/10 px-3 py-1.5 focus-within:border-orange-500 transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={diasMinimo}
              onChange={(e) => setDiasMinimo(Number(e.target.value))}
              className="bg-transparent text-white text-sm outline-none cursor-pointer appearance-none pr-6"
              id="filtro-dias-inactivos"
            >
              <option value={0} className="bg-[#1A1F25]">Todos</option>
              <option value={7} className="bg-[#1A1F25]">+7 días</option>
              <option value={15} className="bg-[#1A1F25]">+15 días</option>
              <option value={30} className="bg-[#1A1F25]">+30 días</option>
              <option value={60} className="bg-[#1A1F25]">+60 días</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Filtro nivel riesgo */}
          <div className="relative flex items-center gap-2 bg-[#1A1F25] rounded-lg border border-white/10 px-3 py-1.5 focus-within:border-orange-500 transition-colors">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <select
              value={nivelRiesgoFiltro}
              onChange={(e) => setNivelRiesgoFiltro(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer appearance-none pr-6"
              id="filtro-riesgo-inactivos"
            >
              <option value="" className="bg-[#1A1F25]">Todos los niveles</option>
              <option value="BAJO" className="bg-[#1A1F25]">Bajo</option>
              <option value="MEDIO" className="bg-[#1A1F25]">Medio</option>
              <option value="ALTO" className="bg-[#1A1F25]">Alto</option>
              <option value="CRITICO" className="bg-[#1A1F25]">Crítico</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Botón exportar (solo ADMIN) */}
          {isAdmin && (
            <button
              onClick={handleExportar}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              id="btn-exportar-inactivos"
            >
              <Download className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
              {exporting ? "Exportando..." : "Exportar Excel"}
            </button>
          )}

          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            id="btn-refrescar-inactivos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {resumenCards.map((card, index) => (
          <motion.div
            key={card.label}
            className={`bg-[#1A1F25] rounded-lg p-4 border ${card.borderColor}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <div className={card.color}>{card.icon}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 uppercase font-medium">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {loading ? <span className="animate-pulse">...</span> : card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Lista de Clientes Inactivos */}
      <div className="bg-[#1A1F25] rounded-lg border border-white/10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : !data || data.clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">¡Todos activos!</p>
            <p className="text-slate-500 text-sm mt-1">
              No se encontraron clientes inactivos con los filtros aplicados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0f1318] border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Contacto
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Plan
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Última Asistencia
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Días Inactivo
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-300 uppercase tracking-wider px-4 py-3">
                    Riesgo
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.clientes.map((cliente: ClienteInactivoDTO, index: number) => {
                  const riesgo = getRiesgoBadge(cliente.nivelRiesgo);
                  return (
                    <motion.tr
                      key={cliente.clienteId}
                      className={`border-b border-white/5 hover:bg-[#1e293b] transition-colors ${
                        index % 2 === 0 ? "bg-[#141b24]" : ""
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ background: `linear-gradient(135deg, ${riesgo.dot}, ${riesgo.dot}88)` }}
                          >
                            {cliente.nombreCompleto.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{cliente.nombreCompleto}</p>
                            <p className="text-slate-500 text-[10px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Vence: {cliente.fechaVencimiento}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {cliente.telefono}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {cliente.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium border border-purple-500/20">
                          {cliente.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-slate-300 text-sm">
                          {formatearFecha(cliente.ultimaAsistencia)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${riesgo.text}`}>
                          {cliente.diasInactivo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${riesgo.bg} ${riesgo.text} ${riesgo.border} border`}
                        >
                          {cliente.nivelRiesgo}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
