import { useEffect, useState } from "react";
import { Shield, Plus, Edit, Trash2, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmpleadosStore } from "../../store/useEmpleadosStore";
import {
  obtenerRolesRequest,
  obtenerPermisosRequest,
  eliminarRolRequest,
  crearRolRequest,
  actualizarRolRequest,
  Rol,
  Permiso,
  CrearRolRequest,
} from "../../api/empleadosApi";
import { Card } from "../../components/ui/Card";

export default function RolesPermisos() {
  const navigate = useNavigate();
  const { roles, setRoles, permisos, setPermisos, eliminarRol, agregarRol, actualizarRol } =
    useEmpleadosStore();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rolEditando, setRolEditando] = useState<Rol | null>(null);

  // Formulario de rol
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisosIds: [] as number[],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        obtenerRolesRequest(),
        obtenerPermisosRequest(),
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (rol?: Rol) => {
    if (rol) {
      setRolEditando(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion || "",
        permisosIds: rol.permisos.map((p) => p.id),
      });
    } else {
      setRolEditando(null);
      setFormData({ nombre: "", descripcion: "", permisosIds: [] });
    }
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setRolEditando(null);
    setFormData({ nombre: "", descripcion: "", permisosIds: [] });
    setError("");
  };

  const handlePermisoToggle = (permisoId: number) => {
    setFormData((prev) => ({
      ...prev,
      permisosIds: prev.permisosIds.includes(permisoId)
        ? prev.permisosIds.filter((id) => id !== permisoId)
        : [...prev.permisosIds, permisoId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim()) {
      setError("El nombre del rol es obligatorio");
      return;
    }

    if (formData.permisosIds.length === 0) {
      setError("Debes asignar al menos un permiso");
      return;
    }

    try {
      setLoading(true);
      const request: CrearRolRequest = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        permisosIds: formData.permisosIds,
      };

      if (rolEditando) {
        const rolActualizado = await actualizarRolRequest(rolEditando.id, request);
        actualizarRol(rolEditando.id, rolActualizado);
      } else {
        const nuevoRol = await crearRolRequest(request);
        agregarRol(nuevoRol);
      }

      cerrarModal();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Error al guardar rol");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${nombre}"?`)) return;

    try {
      await eliminarRolRequest(id);
      eliminarRol(id);
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      alert("Error al eliminar rol. Puede que esté asignado a usuarios.");
    }
  };

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            Roles y Permisos
          </h1>
          <p className="text-slate-400 mt-1">
            Gestiona roles personalizados y asigna permisos granulares
          </p>
        </div>
        <button
          onClick={() => navigate("/empleados")}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
        >
          ← Volver a Empleados
        </button>
      </div>

      {/* Lista de roles */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Roles del Sistema</h2>
            <button
              onClick={() => abrirModal()}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Rol
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Cargando roles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className="bg-[#0F1318] border border-white/10 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{rol.nombre}</h3>
                      {rol.descripcion && (
                        <p className="text-xs text-slate-400 mt-1">{rol.descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirModal(rol)}
                        className="p-1.5 hover:bg-blue-600/20 text-blue-400 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {rol.nombre !== "Administrador" && (
                        <button
                          onClick={() => handleEliminar(rol.id, rol.nombre)}
                          className="p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2">
                      {rol.permisos.length} permiso(s)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {rol.permisos.slice(0, 5).map((permiso) => (
                        <span
                          key={permiso.id}
                          className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs"
                        >
                          {permiso.nombre.split(".")[1] || permiso.nombre}
                        </span>
                      ))}
                      {rol.permisos.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                          +{rol.permisos.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171B22] rounded-xl border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white">
                {rolEditando ? "Editar Rol" : "Nuevo Rol"}
              </h2>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Nombre del rol <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>

              {/* Permisos agrupados por módulo */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">
                  Permisos <span className="text-red-400">*</span>
                </label>
                <div className="space-y-4">
                  {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
                    <div key={modulo} className="bg-[#0F1318] rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 capitalize">{modulo}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permisosModulo.map((permiso) => (
                          <label
                            key={permiso.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permisosIds.includes(permiso.id)}
                              onChange={() => handlePermisoToggle(permiso.id)}
                              className="w-4 h-4 accent-purple-500"
                            />
                            <span className="text-sm text-slate-300">
                              {permiso.nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  <CheckSquare className="h-4 w-4" />
                  {loading ? "Guardando..." : "Guardar Rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
