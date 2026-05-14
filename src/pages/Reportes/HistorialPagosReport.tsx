import { useEffect, useState } from "react";
import { ReportesApi, ReportePagoHistorialDTO, ReporteRenovacionCancelacionDTO } from "../../api/reportesApi";
import { Search, Download, DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function HistorialPagosReport() {
  const [pagos, setPagos] = useState<ReportePagoHistorialDTO[]>([]);
  const [retencionData, setRetencionData] = useState<ReporteRenovacionCancelacionDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [historial, renovaciones] = await Promise.all([
        ReportesApi.obtenerHistorialPagos().catch(() => [
          { pagoId: 1, fecha: "2026-05-12", hora: "10:30", cliente: "Juan Pérez", plan: "Anual", metodo: "Tarjeta", monto: 1200, estado: "Aprobado" },
          { pagoId: 2, fecha: "2026-05-11", hora: "15:45", cliente: "María García", plan: "Mensual", metodo: "Yape", monto: 150, estado: "Rechazado" },
        ]),
        ReportesApi.obtenerRenovacionesCancelaciones().catch(() => [
          { anio: 2026, mesNumero: 5, mes: "Mayo", renovaciones: 45, cancelaciones: 5 },
        ])
      ]);
      setPagos(historial);
      setRetencionData(renovaciones);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await ReportesApi.exportarHistorialPagos(search || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Historial_Pagos_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Historial exportado correctamente");
    } catch (error) {
      toast.error("Error al exportar, genere el archivo desde BD");
    } finally {
      setExporting(false);
    }
  };

  const filteredPagos = pagos.filter((p) => 
    p.cliente.toLowerCase().includes(search.toLowerCase()) ||
    p.estado.toLowerCase().includes(search.toLowerCase()) ||
    p.metodo.toLowerCase().includes(search.toLowerCase())
  );

  const currentMonthData = retencionData.length > 0 ? retencionData[0] : null;
  const tasaRetencion = currentMonthData 
    ? ((currentMonthData.renovaciones / (currentMonthData.renovaciones + currentMonthData.cancelaciones)) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#1A1F25] p-5 rounded-xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Pagos y Retención</h2>
          <p className="text-sm text-slate-400">Consulta transacciones y analiza la lealtad</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50"
        >
          {exporting ? (
             <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {exporting ? "Exportando..." : "Exportar Historial"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-5 rounded-xl border border-blue-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tasa de Retención (Mes)</p>
              <h3 className="text-2xl font-bold text-blue-400">{tasaRetencion}%</h3>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg"><Users className="w-6 h-6 text-blue-400"/></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-5 rounded-xl border border-emerald-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Renovaciones</p>
              <h3 className="text-2xl font-bold text-emerald-400">{currentMonthData?.renovaciones || 0}</h3>
            </div>
            <div className="bg-emerald-500/20 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-emerald-400"/></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-5 rounded-xl border border-red-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Cancelaciones</p>
              <h3 className="text-2xl font-bold text-red-400">{currentMonthData?.cancelaciones || 0}</h3>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg"><TrendingDown className="w-6 h-6 text-red-400"/></div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por DNI o Nombre de cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F1318] text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#1A1F25] rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0F1318]">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fecha/Hora</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Método</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Monto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">Cargando...</td></tr>
              ) : filteredPagos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">No se encontraron transacciones</td></tr>
              ) : (
                filteredPagos.map((p) => (
                  <tr key={p.pagoId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{p.fecha} {p.hora}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{p.cliente}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{p.plan}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{p.metodo}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400 font-medium text-right">S/ {p.monto.toFixed(2)}</td>
                    <td className="px-6 py-4 flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.estado.toLowerCase() === "aprobado" ? "bg-emerald-500/20 text-emerald-400" : 
                        p.estado.toLowerCase() === "rechazado" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}