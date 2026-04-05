import { useState, useEffect } from "react";
import { User, Lock, History, Monitor, Eye, EyeOff, LogOut, Shield, Clock, Globe, MapPin, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  actualizarMiPerfilRequest,
  cambiarMiPasswordRequest,
  ActualizarPerfilRequest,
  CambiarPasswordPerfilRequest,
} from "../../api/empleadosApi";
import historialApi, { PaginaHistorial } from "../../api/historialApi";
import { Card } from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ============================================
// COMPONENTE HISTORIAL TAB
// ============================================
function HistorialTab({ historialData, loadingHistorial, pageHistorial, setPageHistorial }: {
  historialData: PaginaHistorial | null;
  loadingHistorial: boolean;
  pageHistorial: number;
  setPageHistorial: (page: number) => void;
}) {
  const getEventIcon = (tipoEvento: string) => {
    switch (tipoEvento) {
      case "LOGIN":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "LOGOUT":
        return <XCircle className="w-4 h-4 text-blue-400" />;
      case "LOGIN_FAILED":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "PASSWORD_CHANGE":
        return <Shield className="w-4 h-4 text-yellow-400" />;
      case "PASSWORD_RESET":
        return <Shield className="w-4 h-4 text-orange-400" />;
      case "PROFILE_UPDATE":
        return <Monitor className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventColor = (tipoEvento: string, exitoso: boolean) => {
    if (!exitoso) return "border-l-red-500 bg-red-500/5";
    switch (tipoEvento) {
      case "LOGIN":
        return "border-l-green-500 bg-green-500/5";
      case "LOGOUT":
        return "border-l-blue-500 bg-blue-500/5";
      case "PASSWORD_CHANGE":
      case "PASSWORD_RESET":
        return "border-l-yellow-500 bg-yellow-500/5";
      case "PROFILE_UPDATE":
        return "border-l-purple-500 bg-purple-500/5";
      default:
        return "border-l-slate-500 bg-slate-500/5";
    }
  };

  const formatFecha = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Hace un momento";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;

    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: fecha.getFullYear() !== ahora.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCompleta = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calcularEstadisticas = () => {
    if (!historialData) return null;
    const total = historialData.totalElements;
    const exitosos = historialData.content.filter((h) => h.exitoso).length;
    const fallidos = historialData.content.filter((h) => !h.exitoso).length;
    const logins = historialData.content.filter((h) => h.tipoEvento === "LOGIN").length;
    return { total, exitosos, fallidos, logins };
  };

  const stats = calcularEstadisticas();

  if (loadingHistorial) {
    return (
      <Card>
        <div className="p-4 space-y-3">
          <div className="h-4 w-32 bg-slate-700/30 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-700/20 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Total Eventos</p>
                <p className="text-lg font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-500/20 rounded">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Exitosos</p>
                <p className="text-lg font-bold text-white">{stats.exitosos}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/20 rounded">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Fallidos</p>
                <p className="text-lg font-bold text-white">{stats.fallidos}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Logins</p>
                <p className="text-lg font-bold text-white">{stats.logins}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <Card>
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
            Actividad Reciente
          </h3>

          {historialData && historialData.content.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No hay eventos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {historialData?.content.map((evento, index) => (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.03 }}
                    className={`
                      border-l-2 rounded p-2.5
                      ${getEventColor(evento.tipoEvento, evento.exitoso)}
                      hover:bg-slate-700/20 transition-all duration-200
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="mt-0.5">{getEventIcon(evento.tipoEvento)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white text-xs">
                              {evento.descripcionEvento}
                            </p>
                            {!evento.exitoso && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full">
                                Fallido
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span title={formatFechaCompleta(evento.fechaHora)}>
                                {formatFecha(evento.fechaHora)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{evento.ipAddress}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              <span>{evento.navegador}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>{evento.sistemaOperativo}</span>
                            </div>
                          </div>
                          {evento.detalles && (
                            <div className="mt-1.5 p-1.5 bg-slate-900/50 rounded text-[10px] text-slate-400">
                              {evento.detalles}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Paginación */}
          {historialData && historialData.totalPages > 1 && (
            <div className="border-t border-slate-700/50 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400">
                  Mostrando <span className="font-medium text-white">{historialData.numberOfElements}</span> de{" "}
                  <span className="font-medium text-white">{historialData.totalElements}</span> eventos
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPageHistorial(pageHistorial - 1)}
                    disabled={pageHistorial === 0}
                    className="
                      px-2.5 py-1 rounded text-xs font-medium
                      bg-slate-700/50 text-white
                      hover:bg-slate-600/50
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200
                      flex items-center gap-1
                    "
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Anterior
                  </button>
                  <div className="px-2.5 py-1 bg-slate-900/50 rounded border border-slate-700/50">
                    <span className="text-white font-medium text-xs">{pageHistorial + 1}</span>
                    <span className="text-slate-400 text-xs"> / {historialData.totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPageHistorial(pageHistorial + 1)}
                    disabled={pageHistorial >= historialData.totalPages - 1}
                    className="
                      px-2.5 py-1 rounded text-xs font-medium
                      bg-slate-700/50 text-white
                      hover:bg-slate-600/50
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200
                      flex items-center gap-1
                    "
                  >
                    Siguiente
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function Perfil() {
  const user = useAuthStore((s) => s.user);
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<"datos" | "password" | "historial">("datos");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Estado datos personales
  const [datosForm, setDatosForm] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
  });
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [errorDatos, setErrorDatos] = useState("");
  const [exitoDatos, setExitoDatos] = useState("");

  // Estado contraseña
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [exitoPassword, setExitoPassword] = useState("");

  // Estado historial
  const [historialData, setHistorialData] = useState<PaginaHistorial | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [pageHistorial, setPageHistorial] = useState(0);
  const [sizeHistorial] = useState(10);

  // Actualizar formulario cuando se carga el usuario
  useEffect(() => {
    if (user) {
      setDatosForm({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
      });
    }
  }, [user]);

  // Cargar historial cuando se selecciona la pestaña o cambia la página
  useEffect(() => {
    if (tabActiva === "historial") {
      cargarHistorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabActiva, pageHistorial]);

  const cargarHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const data = await historialApi.obtenerMiHistorial(pageHistorial, sizeHistorial);
      setHistorialData(data);
    } catch (error: unknown) {
      console.error("Error al cargar historial:", error);
      const err = error as { response?: { data?: { mensaje?: string } } };
      toast.error(err.response?.data?.mensaje || "Error al cargar el historial");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleDatosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDatos("");
    setExitoDatos("");

    try {
      setLoadingDatos(true);
      const request: ActualizarPerfilRequest = {
        nombre: datosForm.nombre,
        apellido: datosForm.apellido,
        email: datosForm.email,
        telefono: datosForm.telefono || undefined,
      };
      await actualizarMiPerfilRequest(request);
      
      // ⚠️ Actualizar el store con los nuevos datos
      updateUserProfile(datosForm.nombre, datosForm.apellido, datosForm.email, datosForm.telefono);
      
      setExitoDatos("Datos actualizados correctamente");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setExitoDatos(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorDatos(error.response?.data?.error || "Error al actualizar datos");
    } finally {
      setLoadingDatos(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword("");
    setExitoPassword("");

    if (passwordForm.passwordNueva.length < 8) {
      setErrorPassword("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordForm.passwordNueva !== passwordForm.confirmarPassword) {
      setErrorPassword("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoadingPassword(true);
      const request: CambiarPasswordPerfilRequest = {
        passwordActual: passwordForm.passwordActual,
        passwordNueva: passwordForm.passwordNueva,
        confirmarPassword: passwordForm.confirmarPassword,
      };
      await cambiarMiPasswordRequest(request);
      setExitoPassword("Contraseña cambiada correctamente");
      setPasswordForm({ passwordActual: "", passwordNueva: "", confirmarPassword: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorPassword(error.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setTabActiva("datos")}
          className={`px-3 py-2 text-xs font-medium transition-colors relative ${
            tabActiva === "datos"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="h-3 w-3 inline mr-1.5" />
          Datos Personales
        </button>
        <button
          onClick={() => setTabActiva("password")}
          className={`px-3 py-2 text-xs font-medium transition-colors relative ${
            tabActiva === "password"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Lock className="h-3 w-3 inline mr-1.5" />
          Cambiar Contraseña
        </button>
        <button
          onClick={() => setTabActiva("historial")}
          className={`px-3 py-2 text-xs font-medium transition-colors relative ${
            tabActiva === "historial"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <History className="h-3 w-3 inline mr-1.5" />
          Historial de Accesos
        </button>
      </div>

      {/* Contenido de tabs */}
      {tabActiva === "datos" && (
        <Card>
          <form onSubmit={handleDatosSubmit} className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
              Información Personal
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={datosForm.nombre}
                  onChange={(e) =>
                    setDatosForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Apellido</label>
                <input
                  type="text"
                  value={datosForm.apellido}
                  onChange={(e) =>
                    setDatosForm((prev) => ({ ...prev, apellido: e.target.value }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={datosForm.email}
                onChange={(e) =>
                  setDatosForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
              <input
                type="tel"
                value={datosForm.telefono}
                onChange={(e) =>
                  setDatosForm((prev) => ({ ...prev, telefono: e.target.value }))
                }
                className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 text-sm text-white"
              />
            </div>

            {exitoDatos && (
              <div className="bg-emerald-600/20 border border-emerald-600/50 rounded p-2 text-emerald-400 text-xs">
                {exitoDatos}
              </div>
            )}

            {errorDatos && (
              <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">
                {errorDatos}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-1.5 text-sm rounded transition-colors disabled:opacity-50"
              disabled={loadingDatos}
            >
              {loadingDatos ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </Card>
      )}

      {tabActiva === "password" && (
        <Card>
          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
              Cambiar Contraseña
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showPasswordActual ? "text" : "password"}
                  value={passwordForm.passwordActual}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      passwordActual: e.target.value,
                    }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 pr-9 text-sm text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordActual(!showPasswordActual)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPasswordActual ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswordActual ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswordNueva ? "text" : "password"}
                  value={passwordForm.passwordNueva}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      passwordNueva: e.target.value,
                    }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 pr-9 text-sm text-white"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPasswordNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswordNueva ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmar ? "text" : "password"}
                  value={passwordForm.confirmarPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmarPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-[#0F1318] border border-white/10 rounded px-3 py-1.5 pr-9 text-sm text-white"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPasswordConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswordConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {exitoPassword && (
              <div className="bg-emerald-600/20 border border-emerald-600/50 rounded p-2 text-emerald-400 text-xs">
                {exitoPassword}
              </div>
            )}

            {errorPassword && (
              <div className="bg-red-600/20 border border-red-600/50 rounded p-2 text-red-400 text-xs">
                {errorPassword}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-1.5 text-sm rounded transition-colors disabled:opacity-50"
              disabled={loadingPassword}
            >
              {loadingPassword ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </form>
        </Card>
      )}

      {tabActiva === "historial" && <HistorialTab historialData={historialData} loadingHistorial={loadingHistorial} pageHistorial={pageHistorial} setPageHistorial={setPageHistorial} />}
    </div>
  );
}
