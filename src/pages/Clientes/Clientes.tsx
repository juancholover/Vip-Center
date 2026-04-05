import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  UserPlus,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  RefreshCcw,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { ClientesApi, type Cliente } from "../../api/clientesApi";
import EstadoBadge from "./EstadoBadge";
import ClienteForm from "./ClienteForm";
import ClienteFichaModal from "./ClienteFichaModal";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "todos" | "activos" | "vencidos" | "sin-membresia"
  >("todos");
  const [search, setSearch] = useState("");
  const [fichaCliente, setFichaCliente] = useState<Cliente | null>(null);

  const [metricas, setMetricas] = useState({
    total: 0,
    nuevos: 0,
    activos: 0,
    inactivos: 0,
    vencidas: 0,
    retencion: 94,
  });

  const [evolucionMensual, setEvolucionMensual] = useState<Array<{mes: string; clientes: number}>>([]);

  // 📦 Cargar clientes (usar estado del backend)
  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await ClientesApi.listar();

      // Usar el estado que viene del backend (ya calculado correctamente)
      setClientes(data);
      setClientesFiltrados(data);

      // Calcular clientes nuevos (últimos 30 días)
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const clientesNuevos = data.filter((c) => {
        if (!c.fechaRegistro) return false;
        const fechaReg = new Date(c.fechaRegistro);
        return fechaReg >= hace30Dias;
      }).length;

      // Calcular estadísticas
      const activos = data.filter((c) => c.estado === "activo").length;
      const sinMembresia = data.filter((c) => c.estado === "sin_membresia").length;
      const vencidos = data.filter((c) => c.estado === "vencido").length;
      
      // Calcular tasa de retención: (Activos / (Activos + Vencidos)) * 100
      const totalConMembresia = activos + vencidos;
      const tasaRetencion = totalConMembresia > 0 
        ? Math.round((activos / totalConMembresia) * 100)
        : 0;

      setMetricas({
        total: data.length,
        nuevos: clientesNuevos,
        activos: activos,
        inactivos: sinMembresia,
        vencidas: vencidos,
        retencion: tasaRetencion,
      });

      // Calcular evolución mensual (últimos 12 meses)
      const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const hoy = new Date();
      const evolucion: Array<{mes: string; clientes: number}> = [];
      
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes = mesesNombres[fecha.getMonth()];
        
        // Contar clientes registrados hasta esa fecha
        const clientesHastaMes = data.filter((c) => {
          if (!c.fechaRegistro) return false;
          const fechaReg = new Date(c.fechaRegistro);
          return fechaReg <= new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
        }).length;
        
        evolucion.push({ mes, clientes: clientesHastaMes });
      }
      
      setEvolucionMensual(evolucion);
    } catch {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Filtro por tabs (declarar antes del useEffect que lo usa)
  const filtrarClientes = useCallback((tab: string) => {
    setActiveTab(tab as "todos" | "activos" | "vencidos" | "sin-membresia");
    if (tab === "todos") {
      setClientesFiltrados(clientes);
    } else if (tab === "activos") {
      setClientesFiltrados(clientes.filter((c) => c.estado === "activo"));
    } else if (tab === "vencidos") {
      setClientesFiltrados(clientes.filter((c) => c.estado === "vencido"));
    } else if (tab === "sin-membresia") {
      setClientesFiltrados(clientes.filter((c) => c.estado === "sin_membresia"));
    }
  }, [clientes]);

  useEffect(() => {
    cargarClientes();
  }, []);

  // 🔔 Escuchar evento de nueva asistencia para actualizar "Última Asistencia"
  useEffect(() => {
    const handleNuevaAsistencia = (event: Event) => {
      console.log("🔔 Nueva asistencia detectada, recargando clientes...");
      
      // Mostrar toast con el nombre del cliente si está disponible
      const customEvent = event as CustomEvent;
      const clienteNombre = customEvent.detail?.clienteNombre;
      
      if (clienteNombre) {
        toast.success(`✅ ${clienteNombre} registró asistencia`, {
          duration: 3000,
        });
      }
      
      // Recargar clientes para obtener ultimaAsistencia actualizada
      cargarClientes();
    };

    window.addEventListener("asistencia-registrada", handleNuevaAsistencia);
    
    return () => {
      window.removeEventListener("asistencia-registrada", handleNuevaAsistencia);
    };
  }, []);

  // 🔍 Búsqueda
  useEffect(() => {
    if (!search.trim()) {
      filtrarClientes(activeTab);
      return;
    }
    const filtrados = clientes.filter((c) => {
      const term = search.toLowerCase();
      return (
        c.nombreCompleto.toLowerCase().includes(term) ||
        c.telefono.toLowerCase().includes(term) ||
        c.dni?.toLowerCase().includes(term)
      );
    });
    setClientesFiltrados(filtrados);
  }, [search, clientes, activeTab, filtrarClientes]);

  // 📅 Formatear fecha de última asistencia
  const formatearFechaAsistencia = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const esHoy = fecha.toDateString() === hoy.toDateString();
    const esAyer = fecha.toDateString() === ayer.toDateString();

    const hora = fecha.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (esHoy) return `Hoy - ${hora}`;
    if (esAyer) return `Ayer - ${hora}`;
    
    return fecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 🔁 Regenerar QR
  const handleRegenerarQr = async (id: number) => {
    if (!window.confirm("¿Deseas generar un nuevo QR para este cliente?")) return;
    try {
      await ClientesApi.regenerarQr(id);
      toast.success("QR regenerado correctamente ✅");
      cargarClientes();
    } catch {
      toast.error("Error al regenerar QR");
    }
  };

  // 🆕 Crear o editar cliente
  const handleGuardarCliente = async () => {
    toast.success("Cliente guardado correctamente ✅");
    setFormOpen(false);
    setClienteEditando(null);
    cargarClientes();
  };

  return (
    <motion.div
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔝 Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">
            Reportes de Clientes
          </h1>
          <p className="text-slate-400 text-sm">
            Vista general y registro detallado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o DNI..."
              className="w-full bg-[#0F1318] border border-white/10 focus:border-emerald-500 outline-none rounded-full pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-500 transition-all"
            />
          </div>

          {/* Botón Forzar Refresh */}
          <button
            onClick={() => {
              toast.loading("Actualizando clientes...", { id: "force-refresh-clientes" });
              cargarClientes().finally(() => {
                toast.dismiss("force-refresh-clientes");
                toast.success("Clientes actualizados", { duration: 2000 });
              });
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              loading
                ? "bg-cyan-700/60 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500"
            } text-white text-sm`}
            title="Forzar actualización de clientes"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {/* Indicador de actualización */}
      {loading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3 animate-pulse">
          <RefreshCcw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-emerald-400 font-medium">Actualizando lista de clientes...</span>
        </div>
      )}

      {/* 📊 Tarjetas minimalistas - Compactas */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { title: "Total", value: metricas.total, color: "emerald", icon: Users },
          { title: "Nuevos", value: metricas.nuevos, color: "blue", icon: UserPlus },
          { title: "Activos", value: metricas.activos, color: "green", icon: Activity },
          { title: "Sin Membresía", value: metricas.inactivos, color: "yellow", icon: Clock },
          { title: "Vencidos", value: metricas.vencidas, color: "red", icon: AlertTriangle },
          { title: "Retención", value: `${metricas.retencion}%`, color: "teal", icon: TrendingUp },
        ].map(({ title, value, color, icon: Icon }) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.02 }}
            className={`bg-[#1A1F25] p-2.5 rounded-lg border border-${color}-500/30 hover:border-${color}-400/50 transition-all`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px] font-medium">{title}</span>
              <Icon className={`h-3.5 w-3.5 text-${color}-400`} />
            </div>
            <h2 className={`text-lg font-bold text-${color}-300`}>{value}</h2>
          </motion.div>
        ))}
      </div>

      {/* 📈 Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1F25] border border-white/10 rounded-xl p-3">
          <h2 className="text-slate-300 text-sm font-semibold mb-4">
            Evolución mensual de clientes
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolucionMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis 
                dataKey="mes" 
                stroke="#94A3B8" 
                fontSize={11} 
                angle={0}
                height={40}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11}
                width={35}
              />
              <Tooltip 
                contentStyle={{ 
                  background: "#0F1318", 
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px"
                }} 
                labelStyle={{ color: "#94A3B8" }}
              />
              <Line 
                type="monotone" 
                dataKey="clientes" 
                stroke="#22c55e" 
                strokeWidth={2} 
                dot={{ r: 3 }}
                name="Clientes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1A1F25] border border-white/10 rounded-xl p-3">
          <h2 className="text-slate-300 text-sm font-semibold mb-4">
            Distribución por estado
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Activos", value: metricas.activos },
                  { name: "Vencidos", value: metricas.vencidas },
                  { name: "Sin membresía", value: metricas.inactivos },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                labelLine={false}
                label={(entry: {name?: string; value?: number}) => {
                  // Solo mostrar si tiene valor mayor a 0
                  if (!entry.value || entry.value === 0) return '';
                  return `${entry.name}: ${entry.value}`;
                }}
                dataKey="value"
                fontSize={10}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
                <Cell fill="#eab308" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0F1318",
                  border: "1px solid #1e293b",
                  color: "#fff",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value: number) => [`${value} clientes`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧭 Tabs - Ahora debajo de gráficos */}
      <div className="flex items-center gap-2">
        {[
          { id: "todos", label: "Todos" },
          { id: "activos", label: "Activos" },
          { id: "vencidos", label: "Vencidos" },
          { id: "sin-membresia", label: "Sin Membresía" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => filtrarClientes(tab.id)}
            whileTap={{ scale: 0.96 }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                : "bg-transparent border-white/10 text-slate-400 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* 📋 Tabla */}
  <div className="bg-[#1A1F25] p-3 rounded-xl border border-white/10">
        {loading ? (
          <p className="text-slate-400 text-center py-6">Cargando...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-slate-500 text-center py-6 italic">
            No se encontraron resultados
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-1.5 text-left">Cliente</th>
                <th className="p-1.5 text-left">Teléfono</th>
                <th className="p-1.5 text-left">Fecha Registro</th>
                <th className="p-1.5 text-left">Membresía Actual</th>
                <th className="p-1.5 text-left">Estado</th>
                <th className="p-1.5 text-left">Última Asistencia</th>
                <th className="p-1.5 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => {
                const fechaFormateada = c.ultimaAsistencia
                  ? formatearFechaAsistencia(c.ultimaAsistencia)
                  : "Sin registro";

                return (
                  <motion.tr
                    key={c.id}
                    className="border-b border-slate-700 hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="p-1.5">{c.nombreCompleto}</td>
                    <td className="p-1.5 text-slate-400">{c.telefono || "—"}</td>
                    <td className="p-1.5 text-slate-400">
                      {c.fechaRegistro
                        ? new Date(c.fechaRegistro).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="p-1.5">
                      {c.membresiaActual ? (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: c.membresiaActual.color
                              ? `${c.membresiaActual.color}20`
                              : "#38bdf820",
                            color: c.membresiaActual.color || "#38bdf8",
                            border: `1px solid ${c.membresiaActual.color || "#38bdf8"}40`,
                          }}
                        >
                          {c.membresiaActual.nombre}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Sin plan</span>
                      )}
                    </td>
                    <td className="p-1.5">
                      <EstadoBadge estado={c.estado} />
                    </td>
                    <td className="p-1.5 text-slate-400">{fechaFormateada}</td>
                    <td className="p-1.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFichaCliente(c)}
                          className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver Ficha
                        </button>
                        <button
                          onClick={() => handleRegenerarQr(c.id)}
                          className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" /> Regenerar QR
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/*  Modal Ficha del Cliente */}
      {fichaCliente && (
        <ClienteFichaModal
          cliente={fichaCliente}
          onClose={() => setFichaCliente(null)}
          onEdit={(id) => {
            setFichaCliente(null);
            setTimeout(() => {
              setClienteEditando(id);
              setFormOpen(true);
            }, 150);
          }}
        />
      )}

      {/* ✏️ Modal Edición / Creación */}
      {formOpen && (
        <ClienteForm
          cliente={clientes.find((c) => c.id === clienteEditando) ?? null}
          onClose={() => {
            setFormOpen(false);
            setClienteEditando(null);
          }}
          onSuccess={handleGuardarCliente}
        />
      )}
    </motion.div>
  );
}
