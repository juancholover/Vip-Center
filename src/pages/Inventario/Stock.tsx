import { useEffect, useState } from "react";
import { Warehouse, Package, AlertTriangle, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useStockStore } from "../../store/useStockStore";
import { useProductosStore } from "../../store/useProductosStore";
import { ProductosApi, Producto } from "../../api/productosApi";
import { StockApi, CrearEntradaStockRequest } from "../../api/stockApi";
import { Card } from "../../components/ui/Card";

export default function Stock() {
  const {
    alertas,
    setAlertas,
    setLoading,
    loading,
  } = useStockStore();

  const { productos, setProductos } = useProductosStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CrearEntradaStockRequest>({
    productoId: 0,
    cantidad: 1,
    proveedor: "",
    observaciones: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, alertasData] = await Promise.all([
        ProductosApi.listar(),
        StockApi.alertas().catch(() => []),
      ]);
      setProductos(productosData);
      setAlertas(alertasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      toast.error("Error al cargar datos de stock");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.productoId) {
      setError("Selecciona un producto");
      return;
    }
    if (formData.cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }
    if (!formData.proveedor.trim()) {
      setError("El proveedor es obligatorio");
      return;
    }

    try {
      setLoading(true);
      await StockApi.registrarEntrada(formData);
      toast.success("Entrada de stock registrada");
      setFormData({ productoId: 0, cantidad: 1, proveedor: "", observaciones: "" });
      setShowForm(false);
      // Recargar datos
      await cargarDatos();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = error.response?.data?.error || error.response?.data?.message || "Error al registrar entrada";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const productosActivos = productos.filter((p) => p.activo);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-emerald-400" />
            Gestión de Stock
          </h1>
          <p className="text-sm text-slate-400 mt-1">Entradas de stock y alertas de inventario</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Entrada
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Registrar entrada de stock</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Producto *</label>
                <select
                  value={formData.productoId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productoId: Number(e.target.value) }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                >
                  <option value={0}>Seleccionar producto...</option>
                  {productosActivos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - {p.marca} (Stock actual: {p.stockActual})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Proveedor *</label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, proveedor: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, observaciones: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  placeholder="Opcional"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrar Entrada"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <Card>
          <div className="p-3">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Alertas de Stock Bajo ({alertas.length})
            </h3>
            {loading && alertas.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">Cargando...</div>
            ) : alertas.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No hay productos con stock bajo
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {alertas.map((producto: Producto) => (
                  <div
                    key={producto.id}
                    className="bg-[#0F1318] rounded p-3 border border-yellow-500/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-white font-medium">{producto.nombre}</div>
                      <div className="text-xs text-slate-400">{producto.marca}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-400">{producto.stockActual} u.</div>
                      <div className="text-[10px] text-slate-500">Mín: {producto.stockMinimo}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* All Products Stock Overview */}
        <Card>
          <div className="p-3">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              Inventario General ({productosActivos.length})
            </h3>
            {loading && productos.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">Cargando...</div>
            ) : productosActivos.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No hay productos activos
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#171B22]">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-2 text-slate-400 font-medium text-xs">Producto</th>
                      <th className="text-right py-2 px-2 text-slate-400 font-medium text-xs">Stock</th>
                      <th className="text-right py-2 px-2 text-slate-400 font-medium text-xs">Mín</th>
                      <th className="text-center py-2 px-2 text-slate-400 font-medium text-xs">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosActivos.map((producto) => (
                      <tr key={producto.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2">
                          <div className="text-white text-xs">{producto.nombre}</div>
                          <div className="text-[10px] text-slate-500">{producto.marca}</div>
                        </td>
                        <td className="py-2 px-2 text-right text-xs">
                          <span className={producto.stockBajo ? "text-red-400 font-bold" : "text-white"}>
                            {producto.stockActual}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-xs text-slate-400">
                          {producto.stockMinimo}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {producto.stockBajo ? (
                            <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded text-[10px]">
                              Bajo
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 rounded text-[10px]">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
