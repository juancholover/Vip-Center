import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ReportesApi, ReporteSuscripcionDTO } from "../../api/reportesApi";
import { Download, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

const dataBarras = [
  { mes: "Ene", renovaciones: 200, cancelaciones: 20 },
  { mes: "Feb", renovaciones: 180, cancelaciones: 15 },
  { mes: "Mar", renovaciones: 220, cancelaciones: 25 },
  { mes: "Abr", renovaciones: 190, cancelaciones: 18 },
  { mes: "May", renovaciones: 240, cancelaciones: 22 },
];

const dataPie = [
  { name: "Activas", value: 1247 },
  { name: "Vencidas", value: 89 },
  { name: "Por vencer", value: 156 },
];

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

export default function SuscripcionesReport() {
  const [suscripciones, setSuscripciones] = useState<ReporteSuscripcionDTO[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [estado, setEstado] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const cargarSuscripciones = async () => {
    setLoading(true);
    try {
      const response = await ReportesApi.obtenerSuscripcionesPaginadas(
        page,
        10,
        estado || undefined,
        fechaInicio || undefined,
        fechaFin || undefined
      );
      // Map from SuscripcionPaginadaDTO to ReporteSuscripcionDTO for display
      const mapped = (response.content || []).map((s, i) => ({
        id: s.clienteId || i,
        cliente: s.nombreCompleto,
        plan: s.plan,
        fechaInicio: "",
        fechaFin: s.fechaVencimiento,
        estado: s.estado,
      }));
      setSuscripciones(mapped as ReporteSuscripcionDTO[]);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error(error);
      // Fallback para vista
      setSuscripciones([
        { id: 1, cliente: "Juan Pérez", plan: "Anual", fechaInicio: "2024-01-10", fechaFin: "2025-01-10", estado: "activa" },
        { id: 2, cliente: "María Torres", plan: "Premium", fechaInicio: "2024-05-15", fechaFin: "2024-06-15", estado: "vencida" },
        { id: 3, cliente: "Carlos Cruz", plan: "Básico", fechaInicio: "2024-05-01", fechaFin: "2024-06-01", estado: "por_vencer" },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSuscripciones();
  }, [page]);

  const handleSearch = () => {
    setPage(0);
    cargarSuscripciones();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await ReportesApi.exportarSuscripciones(
        estado || undefined,
        fechaInicio || undefined,
        fechaFin || undefined
      );
      // Crear objeto URL del blob y descargarlo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_Suscripciones_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Reporte exportado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar el reporte. Verifique la conexión.");
    } finally {
      setExporting(false);
    }
  };

  const badgeColor = (est: string) => {
    switch (est.toLowerCase()) {
      case "activa": return "bg-emerald-500/20 text-emerald-400";
      case "vencida": return "bg-red-500/20 text-red-400";
      case "por_vencer": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#1A1F25] p-5 rounded-xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">Reporte de Suscripciones</h2>
          <p className="text-sm text-slate-400">Filtra y exporta la información de membresías</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50"
        >
          {exporting ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {exporting ? "Exportando..." : "Exportar a Excel"}
        </button>
      </div>

      {/* Formulario Superior con Filtros */}
      <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full bg-[#0F1318] text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none appearance-none"
            >
              <option value="">Todos los Estados</option>
              <option value="activa">Activas</option>
              <option value="vencida">Vencidas</option>
              <option value="por_vencer">Próximas a Vencer</option>
            </select>
          </div>
        </div>
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
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full md:w-auto h-[42px] flex flex-row items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Buscar
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-[#1A1F25] rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0F1318]">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fecha Inicio</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fecha Vencimiento</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Cargando...</td>
                </tr>
              ) : suscripciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No se encontraron resultados</td>
                </tr>
              ) : (
                suscripciones.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{sub.cliente}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{sub.plan}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{sub.fechaInicio}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{sub.fechaFin}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${badgeColor(sub.estado)}`}>
                        {sub.estado.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-[#0F1318] text-white disabled:opacity-50 hover:bg-white/5"
            >
              Anterior
            </button>
            <span className="text-slate-400 text-sm">
              Página {page + 1} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-[#0F1318] text-white disabled:opacity-50 hover:bg-white/5"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-5 gap-6">
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Suscripciones Activas</h3>
          <p className="text-2xl font-bold text-emerald-500">1,247</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Suscripciones Vencidas</h3>
          <p className="text-2xl font-bold text-red-500">89</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Próximas a Vencer</h3>
          <p className="text-2xl font-bold text-yellow-500">156</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Renovaciones del Mes</h3>
          <p className="text-2xl font-bold text-emerald-400">203</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Cancelaciones</h3>
          <p className="text-2xl font-bold text-red-400">34</p>
        </div>
      </div>

      {/* Gráfico de renovaciones */}
      <div className="bg-[#0F1318] p-6 rounded-lg">
        <h3 className="text-slate-300 mb-4">Renovaciones y Cancelaciones</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataBarras}>
            <XAxis dataKey="mes" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="renovaciones" fill="#00C49F" />
            <Bar dataKey="cancelaciones" fill="#FF4D4D" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0F1318] p-6 rounded-lg">
          <h3 className="text-slate-300 mb-4">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataPie}
                dataKey="value"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {dataPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0F1318] p-6 rounded-lg">
          <h3 className="text-slate-300 mb-4">Distribución de Tipos de Membresía</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Básico", value: 500 },
                  { name: "Premium", value: 300 },
                  { name: "Anual", value: 200 },
                ]}
                dataKey="value"
                outerRadius={90}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FFD93D" />
                <Cell fill="#FF8042" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
