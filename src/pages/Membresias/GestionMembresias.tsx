import { useEffect, useState } from "react";
import { MembresiasApi, Membresia } from "../../api/membresiasApi";
import { useNotificationStore } from "../../store/useNotificationStore";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface MembresiaFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracionDias: number;
  precio: number;
  precioDescuento?: number;
  activa: boolean;
  color?: string;
  orden: number;
  beneficios: string;
}

export default function GestionMembresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState<Membresia | null>(null);
  const [formData, setFormData] = useState<MembresiaFormData>({
    codigo: "",
    nombre: "",
    descripcion: "",
    duracionDias: 30,
    precio: 0,
    precioDescuento: 0,
    activa: true,
    color: "#3B82F6",
    orden: 1,
    beneficios: "",
  });

  const showNotification = useNotificationStore((state) => state.show);

  useEffect(() => {
    cargarMembresias();
  }, []);

  const cargarMembresias = async () => {
    setLoading(true);
    try {
      const data = await MembresiasApi.listar();
      setMembresias(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar membresías"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre || !formData.codigo) {
      toast.error("Nombre y código son obligatorios");
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
    
    if (formData.precioDescuento && formData.precioDescuento > 0 && formData.precioDescuento >= formData.precio) {
      toast.error("El precio con descuento debe ser menor al precio normal");
      return;
    }

    // Validar que el orden no esté duplicado entre membresías ACTIVAS
    const ordenDuplicado = membresias.some(
      (m) => m.orden === formData.orden && m.id !== editingMembresia?.id && m.activa === true
    );
    if (ordenDuplicado) {
      toast.error("Ya existe una membresía activa con ese orden. Por favor elige otro número.");
      return;
    }

    try {
      const beneficiosArray = formData.beneficios
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const dataToSend = {
        ...formData,
        beneficios: beneficiosArray.join(","),
      };

      if (editingMembresia) {
        await MembresiasApi.actualizar(editingMembresia.id, dataToSend);
        toast.success("Membresía actualizada exitosamente ✅");
      } else {
        await MembresiasApi.crear(dataToSend);
        toast.success("Membresía creada exitosamente ✅");
      }

      setShowModal(false);
      resetForm();
      cargarMembresias();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar membresía"
      );
    }
  };

  const handleEdit = (membresia: Membresia) => {
    setEditingMembresia(membresia);
    
    // Manejar beneficios que pueden venir como string o array
    let beneficiosStr = "";
    if (membresia.beneficios) {
      if (Array.isArray(membresia.beneficios)) {
        beneficiosStr = membresia.beneficios.join(", ");
      } else if (typeof membresia.beneficios === "string") {
        beneficiosStr = membresia.beneficios;
      }
    }
    
    setFormData({
      codigo: membresia.codigo,
      nombre: membresia.nombre,
      descripcion: membresia.descripcion || "",
      duracionDias: membresia.duracionDias,
      precio: membresia.precio,
      precioDescuento: membresia.precioDescuento || 0,
      activa: membresia.activa,
      color: membresia.color || "#3B82F6",
      orden: membresia.orden,
      beneficios: beneficiosStr,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("⚠️ ¿Eliminar esta membresía PERMANENTEMENTE?\n\nEsta acción NO se puede deshacer y borrará todos los datos.\n\nSi solo quieres ocultarla, usa el botón de Activar/Desactivar.")) {
      return;
    }

    try {
      await MembresiasApi.eliminar(id);
      toast.success("Membresía eliminada permanentemente 🗑️");
      cargarMembresias();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar membresía"
      );
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      await MembresiasApi.cambiarEstado(id, !estadoActual);
      toast.success(
        `Membresía ${!estadoActual ? "activada" : "desactivada"} exitosamente ✅`
      );
      cargarMembresias();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cambiar estado"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      duracionDias: 30,
      precio: 0,
      precioDescuento: 0,
      activa: true,
      color: "#3B82F6",
      orden: 1,
      beneficios: "",
    });
    setEditingMembresia(null);
  };

  const handleNuevoClick = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <motion.div
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Gestión de Membresías</h1>
          <p className="text-slate-400 text-sm">Administra los planes de membresía del gimnasio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarMembresias}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              loading
                ? "bg-orange-700/60 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500"
            } text-white text-sm`}
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando..." : "Refrescar"}
          </button>
          <button
            onClick={handleNuevoClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nueva Membresía
          </button>
        </div>
      </div>

      {/* Indicador de actualización */}
      {loading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-emerald-400 font-medium">Actualizando membresías...</span>
        </div>
      )}

      {!loading && membresias.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-[#1A1F25] rounded-xl border border-white/10"
        >
          <p className="text-slate-400 mb-4">No hay membresías registradas</p>
          <button
            onClick={handleNuevoClick}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            + Crear primera membresía
          </button>
        </motion.div>
      ) : !loading && (
        <div className="bg-[#1A1F25] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-1.5 text-left">Orden</th>
                <th className="p-1.5 text-left">Código</th>
                <th className="p-1.5 text-left">Nombre</th>
                <th className="p-1.5 text-left">Duración</th>
                <th className="p-1.5 text-left">Precio</th>
                <th className="p-1.5 text-left">Descuento</th>
                <th className="p-1.5 text-left">Estado</th>
                <th className="p-1.5 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {membresias.map((membresia) => (
                <motion.tr
                  key={membresia.id}
                  className="border-b border-slate-700 hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.002 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="p-1.5 text-slate-300">{membresia.orden}</td>
                  <td className="p-1.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: membresia.color + "20",
                        color: membresia.color,
                        border: `1px solid ${membresia.color}40`,
                      }}
                    >
                      {membresia.codigo}
                    </span>
                  </td>
                  <td className="p-1.5">
                    <div className="text-white font-medium">{membresia.nombre}</div>
                    {membresia.descripcion && (
                      <div className="text-xs text-slate-400">{membresia.descripcion}</div>
                    )}
                  </td>
                  <td className="p-1.5 text-slate-300">{membresia.duracionDias} días</td>
                  <td className="p-1.5 text-slate-300">S/ {membresia.precio.toFixed(2)}</td>
                  <td className="p-1.5">
                    {membresia.tieneDescuento ? (
                      <div>
                        <div className="text-emerald-400 font-medium text-xs">
                          {membresia.porcentajeDescuento}% OFF
                        </div>
                        <div className="text-xs text-slate-400">
                          S/ {membresia.precioEfectivo.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Sin descuento</div>
                    )}
                  </td>
                  <td className="p-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        membresia.activa
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {membresia.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="p-1.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(membresia)}
                        className="text-sky-400 hover:text-sky-300 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleEstado(membresia.id, membresia.activa)}
                        className={`transition-colors ${
                          membresia.activa
                            ? "text-orange-400 hover:text-orange-300"
                            : "text-emerald-400 hover:text-emerald-300"
                        }`}
                        title={membresia.activa ? "Desactivar" : "Activar"}
                      >
                        {membresia.activa ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(membresia.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1F25] rounded-xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#1A1F25] border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-emerald-400">
                  {editingMembresia ? "Editar Membresía" : "Nueva Membresía"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="MENSUAL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Orden * 
                    <span className="ml-1 text-xs text-slate-500">(posición en página de ventas)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    min="1"
                    required
                    title="Orden de visualización en la página de ventas (1 = primero)"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Ej: 1 para mostrar primero, 2 para segundo lugar, etc.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
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
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  rows={2}
                  placeholder="Ideal para principiantes..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
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
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    min="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Precio Descuento (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioDescuento}
                    onChange={(e) =>
                      setFormData({ ...formData, precioDescuento: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    min="0"
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
                      className="flex-1 px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.activa ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, activa: e.target.value === "true" })
                    }
                    className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Beneficios (separados por coma)
                </label>
                <textarea
                  value={formData.beneficios}
                  onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  rows={3}
                  placeholder="Acceso ilimitado, Uso de vestuarios, Asesoría nutricional"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Ejemplo: "Acceso ilimitado, Uso de vestuarios, Asesoría nutricional"
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                >
                  {editingMembresia ? "Actualizar" : "Crear"} Membresía
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
