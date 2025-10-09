import { useEffect, useState } from "react";
import { Users, Plus, Edit, Trash2, Unlock, Shield, CheckSquare, X, Save } from "lucide-react";
import { useEmpleadosStore } from "../../store/useEmpleadosStore";
import {
  obtenerEmpleadosRequest,
  eliminarEmpleadoRequest,
  desbloquearEmpleadoRequest,
  crearEmpleadoRequest,
  actualizarEmpleadoRequest,
  obtenerRolesRequest,
  obtenerPermisosRequest,
  eliminarRolRequest,
  crearRolRequest,
  actualizarRolRequest,
  Rol,
  Permiso,
  Empleado,
  CrearRolRequest,
  CrearEmpleadoRequest,
  ActualizarEmpleadoRequest,
} from "../../api/empleadosApi";
import { Card } from "../../components/ui/Card";

export default function Empleados() {
  const { 
    empleados, setEmpleados, agregarEmpleado, actualizarEmpleado: actualizarEmpleadoStore, eliminarEmpleado,
    setLoading, loading,
    roles, setRoles, permisos, setPermisos, eliminarRol, agregarRol, actualizarRol 
  } = useEmpleadosStore();
  
  const [tabActiva, setTabActiva] = useState<"empleados" | "roles">("empleados");
  const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [busqueda, setBusqueda] = useState("");
  
  // Modal de EMPLEADO
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);
  const [formDataEmpleado, setFormDataEmpleado] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
    rolesIds: [] as number[],
    activo: true,
  });
  const [errorEmpleado, setErrorEmpleado] = useState("");
  
  // Modal de ROL
  const [showModalRol, setShowModalRol] = useState(false);
  const [rolEditando, setRolEditando] = useState<Rol | null>(null);
  const [formDataRol, setFormDataRol] = useState({
    nombre: "",
    descripcion: "",
    permisosIds: [] as number[],
  });
  const [errorRol, setErrorRol] = useState("");

  useEffect(() => {
    cargarEmpleados();
    cargarRolesYPermisos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const data = await obtenerEmpleadosRequest();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarRolesYPermisos = async () => {
    try {
      const [rolesData, permisosData] = await Promise.all([
        obtenerRolesRequest(),
        obtenerPermisosRequest(),
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
    } catch (error) {
      console.error("Error al cargar roles y permisos:", error);
    }
  };

  // ========== EMPLEADOS ==========
  
  const abrirModalEmpleado = (empleado?: Empleado) => {
    if (empleado) {
      setEmpleadoEditando(empleado);
      setFormDataEmpleado({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        telefono: empleado.telefono || "",
        password: "",
        confirmarPassword: "",
        rolesIds: empleado.roles.map((r) => r.id),
        activo: empleado.activo,
      });
    } else {
      setEmpleadoEditando(null);
      setFormDataEmpleado({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        confirmarPassword: "",
        rolesIds: [],
        activo: true,
      });
    }
    setErrorEmpleado("");
    setShowModalEmpleado(true);
  };

  const cerrarModalEmpleado = () => {
    setShowModalEmpleado(false);
    setEmpleadoEditando(null);
    setFormDataEmpleado({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      confirmarPassword: "",
      rolesIds: [],
      activo: true,
    });
    setErrorEmpleado("");
  };

  const handleRolEmpleadoToggle = (rolId: number) => {
    setFormDataEmpleado((prev) => ({
      ...prev,
      rolesIds: prev.rolesIds.includes(rolId)
        ? prev.rolesIds.filter((id) => id !== rolId)
        : [...prev.rolesIds, rolId],
    }));
  };

  const handleSubmitEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEmpleado("");

    // Validaciones
    if (!formDataEmpleado.nombre.trim() || !formDataEmpleado.apellido.trim()) {
      setErrorEmpleado("Nombre y apellido son obligatorios");
      return;
    }

    if (!formDataEmpleado.email.trim()) {
      setErrorEmpleado("El email es obligatorio");
      return;
    }

    if (!empleadoEditando) {
      if (!formDataEmpleado.password || formDataEmpleado.password.length < 8) {
        setErrorEmpleado("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      if (formDataEmpleado.password !== formDataEmpleado.confirmarPassword) {
        setErrorEmpleado("Las contraseñas no coinciden");
        return;
      }
    }

    if (formDataEmpleado.rolesIds.length === 0) {
      setErrorEmpleado("Debes asignar al menos un rol");
      return;
    }

    try {
      setLoading(true);

      if (empleadoEditando) {
        // Actualizar
        const request: ActualizarEmpleadoRequest = {
          nombre: formDataEmpleado.nombre,
          apellido: formDataEmpleado.apellido,
          email: formDataEmpleado.email,
          telefono: formDataEmpleado.telefono || undefined,
          rolesIds: formDataEmpleado.rolesIds,
          activo: formDataEmpleado.activo,
        };
        const actualizado = await actualizarEmpleadoRequest(empleadoEditando.id, request);
        actualizarEmpleadoStore(empleadoEditando.id, actualizado);
      } else {
        // Crear
        const request: CrearEmpleadoRequest = {
          nombre: formDataEmpleado.nombre,
          apellido: formDataEmpleado.apellido,
          email: formDataEmpleado.email,
          telefono: formDataEmpleado.telefono || undefined,
          password: formDataEmpleado.password,
          rolesIds: formDataEmpleado.rolesIds,
        };
        const nuevo = await crearEmpleadoRequest(request);
        agregarEmpleado(nuevo);
      }
      cerrarModalEmpleado();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorEmpleado(error.response?.data?.error || "Error al guardar empleado");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEmpleado = async (id: number) => {
    if (!confirm("¿Eliminar este empleado permanentemente?")) return;
    try {
      await eliminarEmpleadoRequest(id);
      // Eliminar del store ya que es eliminación permanente
      eliminarEmpleado(id);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar empleado");
    }
  };

  const handleDesbloquear = async (id: number) => {
    try {
      await desbloquearEmpleadoRequest(id);
      await cargarEmpleados();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al desbloquear");
    }
  };

  // ========== ROLES ==========

  const abrirModalRol = (rol?: Rol) => {
    if (rol) {
      setRolEditando(rol);
      setFormDataRol({
        nombre: rol.nombre,
        descripcion: rol.descripcion || "",
        permisosIds: rol.permisos.map((p) => p.id),
      });
    } else {
      setRolEditando(null);
      setFormDataRol({ nombre: "", descripcion: "", permisosIds: [] });
    }
    setErrorRol("");
    setShowModalRol(true);
  };

  const cerrarModalRol = () => {
    setShowModalRol(false);
    setRolEditando(null);
    setFormDataRol({ nombre: "", descripcion: "", permisosIds: [] });
    setErrorRol("");
  };

  const handlePermisoToggle = (permisoId: number) => {
    setFormDataRol((prev) => ({
      ...prev,
      permisosIds: prev.permisosIds.includes(permisoId)
        ? prev.permisosIds.filter((id) => id !== permisoId)
        : [...prev.permisosIds, permisoId],
    }));
  };

  const handleSubmitRol = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRol("");

    if (!formDataRol.nombre.trim()) {
      setErrorRol("El nombre es obligatorio");
      return;
    }
    if (formDataRol.permisosIds.length === 0) {
      setErrorRol("Asigna al menos un permiso");
      return;
    }

    try {
      setLoading(true);
      const request: CrearRolRequest = {
        nombre: formDataRol.nombre,
        descripcion: formDataRol.descripcion || undefined,
        permisosIds: formDataRol.permisosIds,
      };

      if (rolEditando) {
        const rolActualizado = await actualizarRolRequest(rolEditando.id, request);
        actualizarRol(rolEditando.id, rolActualizado);
      } else {
        const nuevoRol = await crearRolRequest(request);
        agregarRol(nuevoRol);
      }
      cerrarModalRol();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorRol(error.response?.data?.error || "Error al guardar rol");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarRol = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar el rol "${nombre}"?`)) return;
    try {
      await eliminarRolRequest(id);
      eliminarRol(id);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar rol");
    }
  };

  // Filtrado de empleados
  const empleadosFiltrados = empleados.filter((e) => {
    const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase();
    const coincideBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      (e.email?.toLowerCase() || "").includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "activos" && e.activo) ||
      (filtro === "inactivos" && !e.activo);
    return coincideBusqueda && coincideFiltro;
  });

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            Gestión del Sistema
          </h1>
          <p className="text-sm text-slate-400 mt-1">Administra empleados, roles y permisos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setTabActiva("empleados")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tabActiva === "empleados"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4 inline mr-1" />
          Empleados ({empleados.length})
        </button>
        <button
          onClick={() => setTabActiva("roles")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tabActiva === "roles"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-1" />
          Roles ({roles.length})
        </button>
      </div>

      {/* Contenido Tab Empleados */}
      {tabActiva === "empleados" && (
        <>
          {/* Filtros y acciones */}
          <Card>
            <div className="p-3 flex gap-3 items-center flex-wrap">
              <input
                type="text"
                placeholder="Buscar..."
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
                  Todos
                </button>
                <button
                  onClick={() => setFiltro("activos")}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    filtro === "activos"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0F1318] text-slate-400 hover:text-white"
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setFiltro("inactivos")}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    filtro === "inactivos"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0F1318] text-slate-400 hover:text-white"
                  }`}
                >
                  Inactivos
                </button>
              </div>
              <button
                onClick={() => abrirModalEmpleado()}
                className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo
              </button>
            </div>
          </Card>

          {/* Tabla de empleados - COMPACTA */}
          <Card>
            {loading ? (
              <div className="text-center py-8 text-sm text-slate-400">Cargando...</div>
            ) : empleadosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">Sin resultados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Nombre</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Email</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Teléfono</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Roles</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Estado</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosFiltrados.map((empleado) => (
                      <tr key={empleado.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3">
                          <div className="font-medium text-white text-sm">{empleado.nombre} {empleado.apellido}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-300 text-xs">{empleado.email}</td>
                        <td className="py-2 px-3 text-slate-300 text-xs">{empleado.telefono || "-"}</td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1">
                            {empleado.roles.map((rol) => (
                              <span key={`${empleado.id}-${rol.id}`} className="px-1.5 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs">
                                {rol.nombre}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {empleado.activo ? (
                            <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded text-xs">Activo</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded text-xs">Bloqueado</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            {empleado.fechaBloqueo && (
                              <button
                                onClick={() => handleDesbloquear(empleado.id)}
                                className="p-1.5 hover:bg-green-600/20 text-green-400 rounded"
                                title="Desbloquear cuenta"
                              >
                                <Unlock className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => abrirModalEmpleado(empleado)}
                              className="p-1.5 hover:bg-blue-600/20 text-blue-400 rounded"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEliminarEmpleado(empleado.id)}
                              className="p-1.5 hover:bg-red-600/20 text-red-400 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Contenido Tab Roles */}
      {tabActiva === "roles" && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Roles del Sistema</h2>
              <button
                onClick={() => abrirModalRol()}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded text-sm flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Nuevo Rol
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-sm text-slate-400">Cargando...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((rol) => (
                  <div key={rol.id} className="bg-[#0F1318] border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{rol.nombre}</h3>
                        {rol.descripcion && (
                          <p className="text-xs text-slate-400 mt-0.5">{rol.descripcion}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => abrirModalRol(rol)}
                          className="p-1 hover:bg-blue-600/20 text-blue-400 rounded"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        {rol.nombre !== "Administrador" && rol.nombre.toLowerCase() !== "admin" && (
                          <button
                            onClick={() => handleEliminarRol(rol.id, rol.nombre)}
                            className="p-1 hover:bg-red-600/20 text-red-400 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-1.5">{rol.permisos.length} permiso(s)</div>
                    <div className="flex flex-wrap gap-1">
                      {rol.permisos.slice(0, 4).map((permiso) => (
                        <span key={permiso.id} className="px-1.5 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs">
                          {permiso.nombre.split(" ")[0]}
                        </span>
                      ))}
                      {rol.permisos.length > 4 && (
                        <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                          +{rol.permisos.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal de EMPLEADO */}
      {showModalEmpleado && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171B22] rounded-lg border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmitEmpleado} className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-white">{empleadoEditando ? "Editar Empleado" : "Nuevo Empleado"}</h2>
                <button type="button" onClick={cerrarModalEmpleado} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formDataEmpleado.nombre}
                    onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={formDataEmpleado.apellido}
                    onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, apellido: e.target.value }))}
                    className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={formDataEmpleado.email}
                  onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formDataEmpleado.telefono}
                  onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, telefono: e.target.value }))}
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>

              {!empleadoEditando && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contraseña *</label>
                    <input
                      type="password"
                      value={formDataEmpleado.password}
                      onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                      minLength={8}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Confirmar *</label>
                    <input
                      type="password"
                      value={formDataEmpleado.confirmarPassword}
                      onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, confirmarPassword: e.target.value }))}
                      className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-2">Roles *</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((rol) => (
                    <label key={rol.id} className="flex items-center gap-2 p-2 bg-[#0F1318] rounded cursor-pointer hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={formDataEmpleado.rolesIds.includes(rol.id)}
                        onChange={() => handleRolEmpleadoToggle(rol.id)}
                        className="w-3 h-3 accent-emerald-500"
                      />
                      <span className="text-xs text-white">{rol.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {empleadoEditando && (
                <label className="flex items-center gap-2 p-2 bg-[#0F1318] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDataEmpleado.activo}
                    onChange={(e) => setFormDataEmpleado((prev) => ({ ...prev, activo: e.target.checked }))}
                    className="w-3 h-3 accent-emerald-500"
                  />
                  <span className="text-xs text-white">Cuenta activa</span>
                </label>
              )}

              {errorEmpleado && (
                <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">{errorEmpleado}</div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={cerrarModalEmpleado}
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

      {/* Modal de Rol - COMPACTO */}
      {showModalRol && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171B22] rounded-lg border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmitRol} className="p-4 space-y-3">
              <h2 className="text-lg font-bold text-white">{rolEditando ? "Editar Rol" : "Nuevo Rol"}</h2>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formDataRol.nombre}
                  onChange={(e) => setFormDataRol((prev) => ({ ...prev, nombre: e.target.value }))}
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                <input
                  type="text"
                  value={formDataRol.descripcion}
                  onChange={(e) => setFormDataRol((prev) => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>

              {/* Permisos - COMPACTO */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Permisos *</label>
                <div className="space-y-2">
                  {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
                    <div key={modulo} className="bg-[#0F1318] rounded p-2">
                      <h4 className="text-white font-medium text-xs mb-1.5 capitalize">{modulo}</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {permisosModulo.map((permiso) => (
                          <label key={permiso.id} className="flex items-center gap-1.5 cursor-pointer hover:bg-white/5 p-1 rounded text-xs">
                            <input
                              type="checkbox"
                              checked={formDataRol.permisosIds.includes(permiso.id)}
                              onChange={() => handlePermisoToggle(permiso.id)}
                              className="w-3 h-3 accent-purple-500"
                            />
                            <span className="text-slate-300">{permiso.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errorRol && (
                <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">{errorRol}</div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={cerrarModalRol}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center gap-1 disabled:opacity-50"
                  disabled={loading}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
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
