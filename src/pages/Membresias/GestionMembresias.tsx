import { useEffect, useState } from "react";
import { MembresiasApi, Membresia } from "../../api/membresiasApi";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "../../components/ui/Card";

interface MembresiaFormData {
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio: number;
  estado: boolean;
  color?: string;
  orden: number;
}

type FiltroEstado = "todos" | "activos" | "inactivos";

export default function GestionMembresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState<Membresia | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState<MembresiaFormData>({
    nombre: "",
    descripcion: "",
    duracionDias: 30,
    precio: 0,
    estado: true,
    color: "#3B82F6",
    orden: 1,
  });

  useEffect(() => {
    cargarMembresias();
  }, []);

  const cargarMembresias = async () => {
    setLoading(true);
    try {
      const data = await MembresiasApi.listar();
      setMembresias(data);
    } catch {
      toast.error("Error al cargar membresías");
    } finally {
      setLoading(false);
    }
  };

  const membresiasFiltradas = membresias.filter((m) => {
    const coincideBusqueda =
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "activos" && m.estado) ||
      (filtro === "inactivos" && !m.estado);

    return coincideBusqueda && coincideFiltro;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (formData.precio <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    if (formData.duracionDias < 1 || formData.duracionDias > 3650) {
      toast.error("La duración debe estar entre 1 y 3650 días");
      return;
    }

    try {
      if (editingMembresia) {
        await MembresiasApi.actualizar(editingMembresia.id, formData);
        toast.success("Membresía actualizada ✅");
      } else {
        await MembresiasApi.crear(formData);
        toast.success("Membresía creada ✅");
      }

      setShowModal(false);
      resetForm();
      cargarMembresias();
    } catch {
      toast.error("Error al guardar membresía");
    }
  };

  const handleEdit = (membresia: Membresia) => {
    setEditingMembresia(membresia);
    setFormData({
      nombre: membresia.nombre,
      descripcion: membresia.descripcion || "",
      duracionDias: membresia.duracionDias,
      precio: membresia.precio,
      estado: membresia.estado,
      color: membresia.color || "#3B82F6",
      orden: membresia.orden,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("⚠️ ¿Eliminar esta membresía? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await MembresiasApi.eliminar(id);
      toast.success("Membresía eliminada 🗑️");
      cargarMembresias();
    } catch {
      toast.error("Error al eliminar membresía");
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      await MembresiasApi.cambiarEstado(id, !estadoActual);
      toast.success(`Membresía ${!estadoActual ? "activada" : "desactivada"} ✅`);
      cargarMembresias();
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      duracionDias: 30,
      precio: 0,
      estado: true,
      color: "#3B82F6",
      orden: 1,
    });
    setEditingMembresia(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Membresías</h1>
          <p className="text-sm text-slate-400 mt-1">Administra los planes de suscripción</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarMembresias}
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
            <Plus className="w-4 h-4" /> Nueva Membresía
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="p-3 flex gap-3 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
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
              Todos ({membresias.length})
            </button>
            <button
              onClick={() => setFiltro("activos")}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filtro === "activos"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0F1318] text-slate-400 hover:text-white"
              }`}
            >
              Activos ({membresias.filter(m => m.estado).length})
            </button>
            <button
              onClick={() => setFiltro("inactivos")}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filtro === "inactivos"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0F1318] text-slate-400 hover:text-white"
              }`}
            >
              Inactivos ({membresias.filter(m => !m.estado).length})
            </button>
          </div>
        </div>
      </Card>

      {/* Tabla de membresías */}
      {loading && (
        <Card>
          <div className="p-8 text-center text-slate-400">
            Cargando membresías...
          </div>
        </Card>
      )}

      {!loading && membresiasFiltradas.length === 0 && (
        <Card>
          <div className="p-8 text-center text-slate-400">
            {busqueda
              ? "No se encontraron membresías con ese criterio"
              : "No hay membresías registradas"}
          </div>
        </Card>
      )}

      {!loading && membresiasFiltradas.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Duración</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Precio</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Estado</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {membresiasFiltradas.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        <div>
                          <div className="text-white font-medium">{m.nombre}</div>
                          {m.descripcion && (
                            <div className="text-xs text-slate-400">{m.descripcion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{m.duracionDias} días</td>
                    <td className="p-3 text-slate-300">S/ {m.precio.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          m.estado
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {m.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(m)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleEstado(m.id, m.estado)}
                          className={`transition-colors ${
                            m.estado
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={m.estado ? "Desactivar" : "Activar"}
                        >
                          {m.estado ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
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
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="bg-[#1A1F25] rounded-xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
              <div className="sticky top-0 bg-[#1A1F25] border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-400">
                  {editingMembresia ? "Editar Membresía" : "Nueva Membresía"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Membresía Mensual"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Acceso completo al gimnasio..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Duración (días) *
                    </label>
                    <input
                      type="number"
                      value={formData.duracionDias}
                      onChange={(e) =>
                        setFormData({ ...formData, duracionDias: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min="1"
                      max="3650"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Precio (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) =>
                        setFormData({ ...formData, precio: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-16 bg-[#0F1318] border border-white/10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value === "true" })
                      }
                      className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white focus:border-blue-500 outline-none"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium transition-colors"
                >
                  {editingMembresia ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
