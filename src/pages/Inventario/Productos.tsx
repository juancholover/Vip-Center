import { useEffect, useState } from "react";
import { Package, Plus, Edit, Trash2, X, Save, Search, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useProductosStore } from "../../store/useProductosStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ProductosApi,
  Producto,
  CrearProductoRequest,
  ActualizarProductoRequest,
} from "../../api/productosApi";
import { Card } from "../../components/ui/Card";

export default function Productos() {
  const { user } = useAuthStore();
  const permisos = user?.permisos || [];
  const permisosCodigos = permisos.map((p) => p.codigo);
  const canCreateProducts = permisosCodigos.includes("suplementos.crear");
  const canEditProducts = permisosCodigos.includes("suplementos.editar");
  const canDeactivateProducts = permisosCodigos.includes("suplementos.desactivar");
  const canManageProducts = canCreateProducts || canEditProducts || canDeactivateProducts;

  const {
    productos,
    setProductos,
    agregarProducto,
    actualizarProducto,
    desactivarProducto,
    loading,
    setLoading,
  } = useProductosStore();

  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<CrearProductoRequest>({
    nombre: "",
    marca: "",
    categoria: "",
    precio: 0,
    stockActual: 0,
    stockMinimo: 10,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await ProductosApi.listar();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (producto?: Producto) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        marca: producto.marca,
        categoria: producto.categoria,
        precio: producto.precio,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
      });
    } else {
      setProductoEditando(null);
      setFormData({
        nombre: "",
        marca: "",
        categoria: "",
        precio: 0,
        stockActual: 0,
        stockMinimo: 10,
      });
    }
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setProductoEditando(null);
    setFormData({
      nombre: "",
      marca: "",
      categoria: "",
      precio: 0,
      stockActual: 0,
      stockMinimo: 10,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim() || !formData.marca.trim() || !formData.categoria.trim()) {
      setError("Nombre, marca y categoría son obligatorios");
      return;
    }

    if (formData.precio < 0) {
      setError("El precio no puede ser negativo");
      return;
    }

    try {
      setLoading(true);

      if (productoEditando) {
        const request: ActualizarProductoRequest = {
          nombre: formData.nombre,
          marca: formData.marca,
          categoria: formData.categoria,
          precio: formData.precio,
          stockActual: formData.stockActual ?? 0,
          stockMinimo: formData.stockMinimo ?? 10,
        };
        const actualizado = await ProductosApi.actualizar(productoEditando.id, request);
        actualizarProducto(productoEditando.id, actualizado);
        toast.success("Producto actualizado");
      } else {
        const nuevo = await ProductosApi.crear(formData);
        agregarProducto(nuevo);
        toast.success("Producto creado");
      }
      cerrarModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = error.response?.data?.error || error.response?.data?.message || "Error al guardar producto";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Desactivar este producto? No aparecerá en ventas.")) return;
    try {
      await ProductosApi.desactivar(id);
      desactivarProducto(id);
      toast.success("Producto desactivado");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al desactivar producto");
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const termino = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(termino) ||
      p.marca.toLowerCase().includes(termino) ||
      p.categoria.toLowerCase().includes(termino)
    );
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-400" />
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {canManageProducts ? "Gestiona el catálogo de suplementos" : "Consulta productos disponibles"}
          </p>
        </div>
      </div>

      {/* Search & Actions */}
      <Card>
        <div className="p-3 flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#0F1318] border border-white/10 rounded pl-9 pr-3 py-1.5 text-sm text-white"
            />
          </div>
          <button
            onClick={() => cargarProductos()}
            disabled={loading}
            className="px-3 py-1.5 rounded text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Refrescar
          </button>
          {canCreateProducts && (
            <button
              onClick={() => abrirModal()}
              className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-sm text-slate-400">Cargando productos...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            {busqueda ? "Sin resultados para la búsqueda" : "No hay productos registrados"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Producto</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Marca</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Categoría</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Precio</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Stock</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs">Estado</th>
                  {canManageProducts && (
                    <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3">
                      <div className="font-medium text-white text-sm">{producto.nombre}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-300 text-xs">{producto.marca}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded text-xs">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-white text-xs">
                      {formatCurrency(producto.precio)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`text-xs font-medium ${
                          producto.stockBajo ? "text-red-400" : "text-white"
                        }`}
                      >
                        {producto.stockActual}
                      </span>
                      {producto.stockBajo && (
                        <AlertTriangle className="inline h-3 w-3 text-red-400 ml-1" />
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {producto.activo ? (
                        <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded text-xs">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded text-xs">
                          Inactivo
                        </span>
                      )}
                    </td>
                    {canManageProducts && (
                      <td className="py-2 px-3">
                        <div className="flex justify-end gap-1">
                          {canEditProducts && (
                            <button
                              onClick={() => abrirModal(producto)}
                              className="p-1.5 hover:bg-blue-600/20 text-blue-400 rounded"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canDeactivateProducts && producto.activo && (
                            <button
                              onClick={() => handleDesactivar(producto.id)}
                              className="p-1.5 hover:bg-red-600/20 text-red-400 rounded"
                              title="Desactivar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171B22] rounded-lg border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-white">
                  {productoEditando ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button type="button" onClick={cerrarModal} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Marca *</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData((prev) => ({ ...prev, marca: e.target.value }))}
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Categoría *</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    placeholder="Ej: Proteínas, Creatina..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Precio (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockActual}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stockActual: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stockMinimo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stockMinimo: parseInt(e.target.value) || 10 }))
                    }
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                  disabled={loading}
                >
                  <Save className="h-3.5 w-3.5" />
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
