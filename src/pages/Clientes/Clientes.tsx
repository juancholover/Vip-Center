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
  QrCode,
} from "lucide-react";
import { motion } from "framer-motion";
import { ClientesApi, type Cliente } from "../../api/clientesApi";
import EstadoBadge from "./EstadoBadge";
import ClienteForm from "./ClienteForm";
import ClienteFichaModal from "./ClienteFichaModal";
import QRCode from "react-qr-code";

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
  const [qrVisible, setQrVisible] = useState<string | null>(null);
  const [fichaCliente, setFichaCliente] = useState<Cliente | null>(null);

  const [metricas, setMetricas] = useState({
    total: 0,
    nuevos: 0,
    activos: 0,
    inactivos: 0,
    vencidas: 0,
    retencion: 94,
  });

  // 📦 Cargar clientes con cálculo automático de estado
  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await ClientesApi.listar();

      const hoy = new Date();
      const actualizados = data.map((c): Cliente => {
        if (!c.fechaVencimiento) return { ...c, estado: "sin_membresia" as const };
        const vencimiento = new Date(c.fechaVencimiento);
        if (vencimiento >= hoy) return { ...c, estado: "activo" as const };
        return { ...c, estado: "vencido" as const };
      });

      setClientes(actualizados);
      setClientesFiltrados(actualizados);

      setMetricas({
        total: actualizados.length,
        nuevos: Math.floor(actualizados.length * 0.1),
        activos: actualizados.filter((c) => c.estado === "activo").length,
        inactivos: actualizados.filter((c) => c.estado === "sin_membresia").length,
        vencidas: actualizados.filter((c) => c.estado === "vencido").length,
        retencion: 94,
      });
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
      const actualizado = await ClientesApi.regenerarQr(id);
      toast.success("QR regenerado correctamente ✅");
      setQrVisible(actualizado.qrAcceso ?? null);
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
                ? "bg-orange-700/60 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500"
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

      {/* 📊 Tarjetas */}
  <div className="grid grid-cols-6 gap-3.5">
        {[
          { title: "Total de Clientes", value: metricas.total, color: "emerald", icon: Users },
          { title: "Clientes Nuevos", value: metricas.nuevos, color: "blue", icon: UserPlus },
          { title: "Activos", value: metricas.activos, color: "green", icon: Activity },
          { title: "Sin Membresía", value: metricas.inactivos, color: "yellow", icon: Clock },
          { title: "Vencidos", value: metricas.vencidas, color: "red", icon: AlertTriangle },
          { title: "Retención", value: `${metricas.retencion}%`, color: "teal", icon: TrendingUp },
        ].map(({ title, value, color, icon: Icon }) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.02 }}
            className={`bg-[#1A1F25] p-3.5 rounded-xl border border-${color}-500/30 hover:border-${color}-400/50 transition-all`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">{title}</span>
              <Icon className={`h-5 w-5 text-${color}-400`} />
            </div>
            <h2 className={`text-2xl font-bold text-${color}-300`}>{value}</h2>
          </motion.div>
        ))}
      </div>

      {/* 🧭 Tabs */}
      <div className="flex items-center gap-3">
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
            className={`px-3 py-1 rounded-full text-sm border transition-all ${
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
                <th className="p-1.5 text-left">DNI</th>
                <th className="p-1.5 text-left">Fecha Registro</th>
                <th className="p-1.5 text-left">Plan Actual</th>
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
                    <td className="p-1.5 text-slate-400">{c.dni || "—"}</td>
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
                        {c.estado === "activo" && c.qrAcceso && (
                          <button
                            onClick={() => setQrVisible(c.qrAcceso!)}
                            className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                          >
                            <QrCode className="h-3.5 w-3.5" /> Ver QR
                          </button>
                        )}
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

      {/* 🧩 Modal QR */}
      {qrVisible && (
        <div
          onClick={() => setQrVisible(null)}
          className="fixed inset-0 z-50 bg-black/70 grid place-items-center cursor-pointer"
        >
          <div className="bg-[#0F1318] p-5 rounded-xl border border-white/10 text-center">
            <h3 className="text-lg mb-3 text-slate-300">Código QR generado</h3>
            <QRCode value={qrVisible} size={200} bgColor="transparent" fgColor="#22c55e" />
            <p className="mt-3 text-sm text-slate-400">Haz clic fuera para cerrar</p>
          </div>
        </div>
      )}

      {/* 🧠 Modal Ficha del Cliente */}
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

      {/* 📈 Gráficos */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-[#1A1F25] border border-white/10 rounded-xl p-3">
          <h2 className="text-slate-300 text-sm font-semibold mb-4">
            Evolución mensual de clientes
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={[
                { mes: "Ene", clientes: 32 },
                { mes: "Feb", clientes: 40 },
                { mes: "Mar", clientes: 47 },
                { mes: "Abr", clientes: 58 },
                { mes: "May", clientes: 64 },
                { mes: "Jun", clientes: 75 },
                { mes: "Jul", clientes: 90 },
                { mes: "Ago", clientes: 94 },
                { mes: "Sep", clientes: 97 },
                { mes: "Oct", clientes: 102 },
                { mes: "Nov", clientes: 106 },
                { mes: "Dic", clientes: 111 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="mes" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0F1318", border: "1px solid #1e293b" }} />
              <Line type="monotone" dataKey="clientes" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
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
                outerRadius={80}
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                dataKey="value"
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
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
