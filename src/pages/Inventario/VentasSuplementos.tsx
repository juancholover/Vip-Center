import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Trash2, Search, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useVentasSuplementoStore } from "../../store/useVentasSuplementoStore";
import { useProductosStore } from "../../store/useProductosStore";
import { ProductosApi, Producto } from "../../api/productosApi";
import {
  VentasSuplementoApi,
  CrearVentaSuplementoRequest,
  DetalleVentaSuplementoRequest,
  VentaSuplementoResponse,
} from "../../api/ventasSuplementoApi";
import { Card } from "../../components/ui/Card";

export default function VentasSuplementos() {
  const {
    ventasDelDia,
    setVentasDelDia,
    agregarVenta,
    loading,
    setLoading,
  } = useVentasSuplementoStore();

  const { productos, setProductos } = useProductosStore();

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [detalles, setDetalles] = useState<DetalleVentaSuplementoRequest[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [showResultados, setShowResultados] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, ventasData] = await Promise.all([
        ProductosApi.listar(),
        VentasSuplementoApi.ventasDelDia().catch(() => []),
      ]);
      setProductos(productosData);
      setVentasDelDia(ventasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const productosDisponibles = productos.filter(
    (p) =>
      p.activo &&
      p.stockActual > 0 &&
      (p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.marca.toLowerCase().includes(busquedaProducto.toLowerCase()))
  );

  const agregarProducto = (producto: Producto) => {
    const existente = detalles.find((d) => d.productoId === producto.id);
    if (existente) {
      if (existente.cantidad < producto.stockActual) {
        setDetalles(
          detalles.map((d) =>
            d.productoId === producto.id ? { ...d, cantidad: d.cantidad + 1 } : d
          )
        );
      } else {
        toast.error("Stock insuficiente");
      }
    } else {
      setDetalles([...detalles, { productoId: producto.id, cantidad: 1 }]);
    }
    setBusquedaProducto("");
    setShowResultados(false);
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      setDetalles(detalles.filter((d) => d.productoId !== productoId));
      return;
    }
    const producto = productos.find((p) => p.id === productoId);
    if (producto && cantidad > producto.stockActual) {
      toast.error(`Stock máximo: ${producto.stockActual}`);
      return;
    }
    setDetalles(
      detalles.map((d) => (d.productoId === productoId ? { ...d, cantidad } : d))
    );
  };

  const eliminarDetalle = (productoId: number) => {
    setDetalles(detalles.filter((d) => d.productoId !== productoId));
  };

  const calcularTotal = () => {
    return detalles.reduce((total, detalle) => {
      const producto = productos.find((p) => p.id === detalle.productoId);
      return total + (producto ? producto.precio * detalle.cantidad : 0);
    }, 0);
  };

  const handleCrearVenta = async () => {
    if (detalles.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    try {
      setLoading(true);
      const request: CrearVentaSuplementoRequest = {
        metodoPago,
        detalles,
      };
      const venta = await VentasSuplementoApi.crear(request);
      agregarVenta(venta);
      setDetalles([]);
      setMetodoPago("EFECTIVO");
      toast.success("Venta registrada exitosamente");
      // Recargar productos para actualizar stock
      const productosData = await ProductosApi.listar();
      setProductos(productosData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = error.response?.data?.error || error.response?.data?.message || "Error al registrar venta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-emerald-400" />
          Venta de Suplementos
        </h1>
        <p className="text-sm text-slate-400 mt-1">Registrar ventas y consultar historial diario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Sale Form */}
        <div className="space-y-4">
          {/* Product Search */}
          <Card>
            <div className="p-3 space-y-3">
              <h3 className="text-sm font-medium text-white">Agregar productos</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setShowResultados(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowResultados(busquedaProducto.length > 0)}
                  className="w-full bg-[#0F1318] border border-white/10 rounded pl-9 pr-3 py-1.5 text-sm text-white"
                />
                {showResultados && productosDisponibles.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-[#171B22] border border-white/10 rounded shadow-lg max-h-48 overflow-y-auto">
                    {productosDisponibles.slice(0, 10).map((producto) => (
                      <button
                        key={producto.id}
                        onClick={() => agregarProducto(producto)}
                        className="w-full text-left px-3 py-2 hover:bg-white/5 flex justify-between items-center text-sm"
                      >
                        <div>
                          <span className="text-white">{producto.nombre}</span>
                          <span className="text-slate-400 ml-2 text-xs">{producto.marca}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 text-xs">{formatCurrency(producto.precio)}</span>
                          <span className="text-slate-500 text-xs ml-2">Stock: {producto.stockActual}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Sale Details */}
          <Card>
            <div className="p-3 space-y-3">
              <h3 className="text-sm font-medium text-white">Detalle de venta</h3>
              {detalles.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Busca y agrega productos para comenzar
                </p>
              ) : (
                <div className="space-y-2">
                  {detalles.map((detalle) => {
                    const producto = productos.find((p) => p.id === detalle.productoId);
                    if (!producto) return null;
                    return (
                      <div
                        key={detalle.productoId}
                        className="flex items-center gap-2 bg-[#0F1318] rounded p-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{producto.nombre}</div>
                          <div className="text-xs text-slate-400">
                            {formatCurrency(producto.precio)} x {detalle.cantidad}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              actualizarCantidad(detalle.productoId, detalle.cantidad - 1)
                            }
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm text-white">
                            {detalle.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              actualizarCantidad(detalle.productoId, detalle.cantidad + 1)
                            }
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm text-emerald-400 w-20 text-right">
                          {formatCurrency(producto.precio * detalle.cantidad)}
                        </div>
                        <button
                          onClick={() => eliminarDetalle(detalle.productoId)}
                          className="p-1 hover:bg-red-600/20 text-red-400 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Method & Total */}
              {detalles.length > 0 && (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Método de pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="YAPE">Yape</option>
                      <option value="PLIN">Plin</option>
                    </select>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(calcularTotal())}
                    </span>
                  </div>

                  <button
                    onClick={handleCrearVenta}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading ? "Procesando..." : "Registrar Venta"}
                  </button>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Daily History */}
        <Card>
          <div className="p-3">
            <h3 className="text-sm font-medium text-white mb-3">
              Ventas de hoy ({ventasDelDia.length})
            </h3>
            {loading && ventasDelDia.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">Cargando...</div>
            ) : ventasDelDia.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No hay ventas registradas hoy
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {ventasDelDia.map((venta: VentaSuplementoResponse) => (
                  <div
                    key={venta.id}
                    className="bg-[#0F1318] rounded p-3 border border-white/5"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-slate-400">
                        #{venta.id} - {formatTime(venta.fecha)}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(venta.total)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {venta.detalles.map((d) => (
                        <div key={d.id}>
                          {d.productoNombre} x{d.cantidad}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-slate-500">{venta.metodoPago}</span>
                      {venta.clienteNombre && (
                        <span className="text-[10px] text-slate-500">Cliente: {venta.clienteNombre}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
