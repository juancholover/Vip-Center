import { useEffect, useState } from "react";
import { DescuentosApi, Descuento, CrearDescuentoRequest } from "../../api/descuentosApi";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "../../components/ui/Card";

export default function GestionDescuentos() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDescuento, setEditingDescuento] = useState<Descuento | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [busqueda, setBusqueda] = useState("");
  
  const [formData, setFormData] = useState<CrearDescuentoRequest>({
    nombre: "",
    porcentaje: 0,
    estado: true,
  });

  useEffect(() => {
    cargarDescuentos();
  }, []);

  const cargarDescuentos = async () => {
    setLoading(true);
    try {
      const data = await DescuentosApi.listarTodos();
      setDescuentos(data);
    } catch (error) {
      console.error("Error al cargar descuentos:", error);
      toast.error("Error al cargar descuentos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nombre.trim()) {
        toast.error("El nombre es obligatorio");
        return;
      }

      if (formData.porcentaje <= 0 || formData.porcentaje > 100) {
        toast.error("El porcentaje debe estar entre 1 y 100");
        return;
      }

      if (editingDescuento) {
        await DescuentosApi.actualizar(editingDescuento.id, formData);
        toast.success("Descuento actualizado");
      } else {
        await DescuentosApi.crear(formData);
        toast.success("Descuento creado");
      }

      setShowModal(false);
      resetForm();
      cargarDescuentos();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { mensaje?: string } } };
      toast.error(err.response?.data?.mensaje || "Error al guardar descuento");
    }
  };

  const handleEditar = (descuento: Descuento) => {
    setEditingDescuento(descuento);
    setFormData({
      nombre: descuento.nombre,
      porcentaje: descuento.porcentaje,
      estado: descuento.estado,
    });
    setShowModal(true);
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: boolean) => {
    try {
      await DescuentosApi.cambiarEstado(id, nuevoEstado);
      toast.success(`Descuento ${nuevoEstado ? "activado" : "desactivado"}`);
      cargarDescuentos();
    } catch (error: unknown) {
      console.error(error);
      toast.error("Error al cambiar estado");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este descuento?")) return;

    try {
      await DescuentosApi.eliminar(id);
      toast.success("Descuento eliminado");
      cargarDescuentos();
    } catch (error: unknown) {
      console.error(error);
      toast.error("Error al eliminar descuento");
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", porcentaje: 0, estado: true });
    setEditingDescuento(null);
  };

  const descuentosFiltrados = descuentos.filter((d) => {
    const cumpleFiltro =
      filtro === "todos" ||
      (filtro === "activos" && d.estado) ||
      (filtro === "inactivos" && !d.estado);
    
    const cumpleBusqueda =
      busqueda === "" ||
      d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.porcentaje.toString().includes(busqueda);

    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Descuentos</h1>
          <p className="text-sm text-slate-400 mt-1">Administra los descuentos disponibles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarDescuentos}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              loading ? "bg-cyan-700/60 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500"
            } text-white text-sm`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando..." : "Refrescar"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nuevo Descuento
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="p-3 flex gap-3 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar descuento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 min-w-[200px] bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro("todos")}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filtro === "todos"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0F1318] text-slate-400 hover:text-white"
              }`}
            >
              Todos ({descuentos.length})
            </button>
            <button
              onClick={() => setFiltro("activos")}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filtro === "activos"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0F1318] text-slate-400 hover:text-white"
              }`}
            >
              Activos ({descuentos.filter((d) => d.estado).length})
            </button>
            <button
              onClick={() => setFiltro("inactivos")}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filtro === "inactivos"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0F1318] text-slate-400 hover:text-white"
              }`}
            >
              Inactivos ({descuentos.filter((d) => !d.estado).length})
            </button>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      {loading && (
        <Card>
          <div className="p-8 text-center text-slate-400">
            Cargando descuentos...
          </div>
        </Card>
      )}

      {!loading && descuentosFiltrados.length === 0 && (
        <Card>
          <div className="p-8 text-center text-slate-400">
            {busqueda
              ? "No se encontraron descuentos con ese criterio"
              : "No hay descuentos registrados"}
          </div>
        </Card>
      )}

      {!loading && descuentosFiltrados.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Descuento</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Estado</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {descuentosFiltrados.map((descuento) => (
                  <tr
                    key={descuento.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                  <td className="p-2.5">
                    <span className="text-sm text-white font-medium">{descuento.nombre}</span>
                  </td>
                  <td className="p-2.5">
                    <span className="text-lg font-bold text-emerald-400">
                      {descuento.porcentaje}%
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded font-medium ${
                        descuento.estado
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {descuento.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditar(descuento)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(descuento.id, !descuento.estado)}
                        className={`transition-colors ${
                          descuento.estado
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-emerald-400 hover:text-emerald-300"
                        }`}
                        title={descuento.estado ? "Desactivar" : "Activar"}
                      >
                        {descuento.estado ? (
                          <ToggleLeft className="w-4 h-4" />
                        ) : (
                          <ToggleRight className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEliminar(descuento.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <div
            className="bg-[#1A1F25] rounded-xl border border-white/10 shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingDescuento ? "Editar Descuento" : "Nuevo Descuento"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Estudiante, Adulto Mayor"
                    className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Porcentaje (%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.porcentaje}
                    onChange={(e) =>
                      setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Ej: 20"
                    className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="estado"
                    checked={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="estado" className="text-sm font-medium text-slate-300 cursor-pointer">
                    Descuento activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                >
                  {editingDescuento ? "Actualizar" : "Crear Descuento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
