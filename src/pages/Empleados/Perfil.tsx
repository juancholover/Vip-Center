import { useState, useEffect } from "react";
import { User, Lock, History, Monitor, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  actualizarMiPerfilRequest,
  cambiarMiPasswordRequest,
  obtenerMiHistorialRequest,
  ActualizarPerfilRequest,
  CambiarPasswordPerfilRequest,
  HistorialAcceso,
} from "../../api/empleadosApi";
import { Card } from "../../components/ui/Card";

export default function Perfil() {
  const user = useAuthStore((s) => s.user);
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);
  const [tabActiva, setTabActiva] = useState<"datos" | "password" | "historial">("datos");

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
  const [historial, setHistorial] = useState<HistorialAcceso[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

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

  // Cargar historial cuando se selecciona la pestaña
  useEffect(() => {
    if (tabActiva === "historial") {
      cargarHistorial();
    }
  }, [tabActiva]);

  const cargarHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const data = await obtenerMiHistorialRequest();
      setHistorial(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
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
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-emerald-400" />
        <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
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

      {tabActiva === "historial" && (
        <Card>
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
              Historial de Accesos
            </h3>

            {loadingHistorial ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Cargando historial...
              </div>
            ) : historial.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No hay registros de accesos
              </div>
            ) : (
              <div className="space-y-2">
                {historial.map((acceso) => (
                  <div
                    key={acceso.id}
                    className="bg-[#0F1318] border border-white/10 rounded p-3 flex items-start gap-3"
                  >
                    <Monitor
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        acceso.exitoso ? "text-emerald-400" : "text-red-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{acceso.accion}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(acceso.fecha).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                            acceso.exitoso
                              ? "bg-emerald-600/20 text-emerald-400"
                              : "bg-red-600/20 text-red-400"
                          }`}
                        >
                          {acceso.exitoso ? "Exitoso" : "Fallido"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1.5 truncate">
                        IP: {acceso.ip} · {acceso.dispositivo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
