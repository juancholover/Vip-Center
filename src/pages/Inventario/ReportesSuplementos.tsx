import { useState } from "react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ReportesSuplementoApi,
  ReporteSuplementoDTO,
  TopProductoDTO,
} from "../../api/reportesSuplementoApi";
import { Card } from "../../components/ui/Card";

export default function ReportesSuplementos() {
  const [reporte, setReporte] = useState<ReporteSuplementoDTO | null>(null);
  const [topProductos, setTopProductos] = useState<TopProductoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"semanal" | "mensual" | "top">("semanal");

  // Weekly report state
  const [fechaInicioSemanal, setFechaInicioSemanal] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  // Monthly report state
  const [anioMensual, setAnioMensual] = useState(new Date().getFullYear());
  const [mesMensual, setMesMensual] = useState(new Date().getMonth() + 1);

  // Top products state
  const [fechaInicioTop, setFechaInicioTop] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [fechaFinTop, setFechaFinTop] = useState(() => new Date().toISOString().split("T")[0]);
  const [limiteTop, setLimiteTop] = useState(10);

  const cargarReporteSemanal = async () => {
    try {
      setLoading(true);
      const data = await ReportesSuplementoApi.reporteSemanal(fechaInicioSemanal);
      setReporte(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al cargar reporte semanal");
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteMensual = async () => {
    try {
      setLoading(true);
      const data = await ReportesSuplementoApi.reporteMensual(anioMensual, mesMensual);
      setReporte(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al cargar reporte mensual");
    } finally {
      setLoading(false);
    }
  };

  const cargarTopProductos = async () => {
    try {
      setLoading(true);
      const data = await ReportesSuplementoApi.topProductos(fechaInicioTop, fechaFinTop, limiteTop);
      setTopProductos(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al cargar top productos");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
          Reportes de Suplementos
        </h1>
        <p className="text-sm text-slate-400 mt-1">Análisis de ventas e inventario de suplementos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("semanal")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "semanal"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-1" />
          Semanal
        </button>
        <button
          onClick={() => setActiveTab("mensual")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "mensual"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-1" />
          Mensual
        </button>
        <button
          onClick={() => setActiveTab("top")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "top"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-1" />
          Top Productos
        </button>
      </div>

      {/* Weekly Report */}
      {activeTab === "semanal" && (
        <div className="space-y-4">
          <Card>
            <div className="p-3 flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha inicio (lunes)</label>
                <input
                  type="date"
                  value={fechaInicioSemanal}
                  onChange={(e) => setFechaInicioSemanal(e.target.value)}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <button
                onClick={cargarReporteSemanal}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Generar Reporte"}
              </button>
            </div>
          </Card>

          {reporte && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Ingresos Totales</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(reporte.totalIngresos)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {reporte.fechaInicio} - {reporte.fechaFin}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Unidades Vendidas</div>
                    <div className="text-2xl font-bold text-white">{reporte.totalUnidadesVendidas}</div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Total Ventas</div>
                    <div className="text-2xl font-bold text-white">{reporte.totalVentas}</div>
                  </div>
                </Card>
              </div>

              {/* Product Breakdown */}
              <Card>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3">Desglose por producto</h3>
                  {reporte.productos.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-400">
                      No hay ventas en este período
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Producto</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Unidades</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.productos.map((p) => (
                            <tr key={p.productoId} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-3 text-white text-sm">{p.productoNombre}</td>
                              <td className="py-2 px-3 text-right text-slate-300 text-xs">
                                {p.unidadesVendidas}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-400 text-xs">
                                {formatCurrency(p.ingresoTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Monthly Report */}
      {activeTab === "mensual" && (
        <div className="space-y-4">
          <Card>
            <div className="p-3 flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Año</label>
                <input
                  type="number"
                  value={anioMensual}
                  onChange={(e) => setAnioMensual(parseInt(e.target.value) || new Date().getFullYear())}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white w-24"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mes</label>
                <select
                  value={mesMensual}
                  onChange={(e) => setMesMensual(parseInt(e.target.value))}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                >
                  {meses.map((mes, i) => (
                    <option key={i + 1} value={i + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={cargarReporteMensual}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Generar Reporte"}
              </button>
            </div>
          </Card>

          {reporte && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Ingresos Totales</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(reporte.totalIngresos)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {meses[mesMensual - 1]} {anioMensual}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Unidades Vendidas</div>
                    <div className="text-2xl font-bold text-white">{reporte.totalUnidadesVendidas}</div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Total Ventas</div>
                    <div className="text-2xl font-bold text-white">{reporte.totalVentas}</div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3">Desglose por producto</h3>
                  {reporte.productos.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-400">
                      No hay ventas en este período
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Producto</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Unidades</th>
                            <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.productos.map((p) => (
                            <tr key={p.productoId} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-3 text-white text-sm">{p.productoNombre}</td>
                              <td className="py-2 px-3 text-right text-slate-300 text-xs">
                                {p.unidadesVendidas}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-400 text-xs">
                                {formatCurrency(p.ingresoTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Top Products */}
      {activeTab === "top" && (
        <div className="space-y-4">
          <Card>
            <div className="p-3 flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaInicioTop}
                  onChange={(e) => setFechaInicioTop(e.target.value)}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaFinTop}
                  onChange={(e) => setFechaFinTop(e.target.value)}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Límite</label>
                <select
                  value={limiteTop}
                  onChange={(e) => setLimiteTop(parseInt(e.target.value))}
                  className="bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                </select>
              </div>
              <button
                onClick={cargarTopProductos}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Buscar"}
              </button>
            </div>
          </Card>

          {topProductos.length > 0 && (
            <Card>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white mb-3">Productos más vendidos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs">#</th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Producto</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Unidades</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductos.map((p) => (
                        <tr key={p.productoId} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                p.posicion === 1
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : p.posicion === 2
                                  ? "bg-slate-400/20 text-slate-300"
                                  : p.posicion === 3
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-slate-700/50 text-slate-400"
                              }`}
                            >
                              {p.posicion}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-white text-sm">{p.productoNombre}</td>
                          <td className="py-2 px-3 text-right text-slate-300 text-xs">
                            {p.unidadesVendidas}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-400 text-xs">
                            {formatCurrency(p.ingresoTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
