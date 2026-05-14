import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  HandshakeIcon,
  RefreshCw,
  Users,
  Filter,
  Shield,
} from "lucide-react";
import { RecepcionApi } from "../../api/recepcionApi";
import type { ClientePorVencerDTO } from "../../api/recepcionApi";

export default function Recepcion() {
  const [clientes, setClientes] = useState<ClientePorVencerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [diasFiltro, setDiasFiltro] = useState(15);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await RecepcionApi.obtenerClientesPorVencer(diasFiltro);
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      toast.error("Error al cargar la bandeja de recepción");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasFiltro]);

  const cambiarEstado = async (
    clienteId: number,
    nuevoEstado: "PENDIENTE" | "LLAMADO" | "PROMESA"
  ) => {
    setUpdatingId(clienteId);
    try {
      const result = await RecepcionApi.actualizarEstadoSeguimiento(clienteId, nuevoEstado);
      toast.success(result.mensaje);
      // Actualizar localmente
      setClientes((prev) =>
        prev.map((c) =>
          c.clienteId === clienteId ? { ...c, estadoSeguimiento: nuevoEstado } : c
        )
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado de seguimiento");
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgenciaBadge = (dias: number) => {
    if (dias <= 1)
      return { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400", label: "¡URGENTE!" };
    if (dias <= 3)
      return { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", label: "Crítico" };
    if (dias <= 7)
      return { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", label: "Pronto" };
    return { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", label: "Próximo" };
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "LLAMADO":
        return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", icon: <PhoneCall className="w-3 h-3" /> };
      case "PROMESA":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", icon: <HandshakeIcon className="w-3 h-3" /> };
      default:
        return { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: <Clock className="w-3 h-3" /> };
    }
  };

  // Contadores
  const pendientes = clientes.filter((c) => c.estadoSeguimiento === "PENDIENTE").length;
  const llamados = clientes.filter((c) => c.estadoSeguimiento === "LLAMADO").length;
  const promesas = clientes.filter((c) => c.estadoSeguimiento === "PROMESA").length;

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
          <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <Shield className="w-7 h-7" />
            Bandeja de Recepción
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Clientes con membresía próxima a vencer — seguimiento de contacto
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro de días */}
          <div className="flex items-center gap-2 bg-[#1A1F25] rounded-lg border border-white/10 px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={diasFiltro}
              onChange={(e) => setDiasFiltro(Number(e.target.value))}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
              id="filtro-dias-recepcion"
            >
              <option value={7} className="bg-[#1A1F25]">Próximos 7 días</option>
              <option value={15} className="bg-[#1A1F25]">Próximos 15 días</option>
              <option value={30} className="bg-[#1A1F25]">Próximos 30 días</option>
            </select>
          </div>

          <button
            onClick={cargarClientes}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            id="btn-refrescar-recepcion"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Resumen de estados */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <motion.div
          className="bg-[#1A1F25] rounded-lg p-4 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-400">{clientes.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1A1F25] rounded-lg p-4 border border-slate-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-500/10">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-slate-300">{pendientes}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1A1F25] rounded-lg p-4 border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <PhoneCall className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Llamados</p>
              <p className="text-2xl font-bold text-blue-400">{llamados}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1A1F25] rounded-lg p-4 border border-emerald-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <HandshakeIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Promesas</p>
              <p className="text-2xl font-bold text-emerald-400">{promesas}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-[#1A1F25] rounded-lg border border-white/10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">¡Sin clientes por vencer!</p>
            <p className="text-slate-500 text-sm mt-1">
              No hay membresías próximas a vencer en los próximos {diasFiltro} días
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {clientes.map((cliente, index) => {
                const urgencia = getUrgenciaBadge(cliente.diasRestantes);
                const estadoBadge = getEstadoBadge(cliente.estadoSeguimiento);
                const isUpdating = updatingId === cliente.clienteId;

                return (
                  <motion.div
                    key={cliente.clienteId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 hover:bg-white/[0.02] transition-colors ${
                      cliente.diasRestantes <= 1 ? "bg-red-500/[0.03]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                          cliente.diasRestantes <= 3
                            ? "bg-gradient-to-br from-red-500 to-orange-600"
                            : cliente.diasRestantes <= 7
                            ? "bg-gradient-to-br from-orange-500 to-yellow-600"
                            : "bg-gradient-to-br from-blue-500 to-cyan-600"
                        }`}
                      >
                        {cliente.avatar || cliente.nombreCompleto.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>

                      {/* Info del cliente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-sm truncate">
                            {cliente.nombreCompleto}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${urgencia.bg} ${urgencia.text} ${urgencia.border} border`}
                          >
                            {cliente.diasRestantes === 0
                              ? "¡HOY!"
                              : cliente.diasRestantes === 1
                              ? "¡MAÑANA!"
                              : `${cliente.diasRestantes} días`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${estadoBadge.bg} ${estadoBadge.text} ${estadoBadge.border} border`}
                          >
                            {estadoBadge.icon}
                            {cliente.estadoSeguimiento}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </span>
                          <span className="flex items-center gap-1 hidden sm:flex">
                            <Mail className="w-3 h-3" />
                            {cliente.email}
                          </span>
                          <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-medium border border-purple-500/20">
                            {cliente.plan}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Vence: {cliente.fechaVencimiento}
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2 shrink-0">
                        {cliente.estadoSeguimiento !== "LLAMADO" && (
                          <button
                            onClick={() => cambiarEstado(cliente.clienteId, "LLAMADO")}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                            id={`btn-llamado-${cliente.clienteId}`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Llamado</span>
                          </button>
                        )}
                        {cliente.estadoSeguimiento !== "PROMESA" && (
                          <button
                            onClick={() => cambiarEstado(cliente.clienteId, "PROMESA")}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            id={`btn-promesa-${cliente.clienteId}`}
                          >
                            <HandshakeIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Promesa</span>
                          </button>
                        )}
                        {cliente.estadoSeguimiento !== "PENDIENTE" && (
                          <button
                            onClick={() => cambiarEstado(cliente.clienteId, "PENDIENTE")}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 transition-all disabled:opacity-50"
                            id={`btn-pendiente-${cliente.clienteId}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                          </button>
                        )}
                        {isUpdating && (
                          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      {!loading && clientes.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-lg border border-white/10 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Prioridad de contacto</p>
              <p className="text-slate-400 text-xs mt-1">
                Los clientes están ordenados por urgencia. Los que vencen en 1 día aparecen primero.
                Marca como <span className="text-blue-400">"Llamado"</span> cuando hagas contacto y{" "}
                <span className="text-emerald-400">"Promesa"</span> si el cliente confirma renovación.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
