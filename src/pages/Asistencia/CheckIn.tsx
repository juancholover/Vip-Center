import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AsistenciaApi, RegistrarAsistenciaResponse } from "../../api/asistenciaApi";
import { CheckCircle, XCircle, Loader2, Calendar, Clock, User } from "lucide-react";

type EstadoCheckIn = "loading" | "success" | "error";
type ErrorMeta = { status?: number; message: string };

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState<EstadoCheckIn>("loading");
  const [respuesta, setRespuesta] = useState<RegistrarAsistenciaResponse | null>(null);
  const [error, setError] = useState<ErrorMeta>({ message: "" });
  const [retryDisabled, setRetryDisabled] = useState(false);

  useEffect(() => {
    if (!token) {
  setEstado("error");
  setError({ message: "Token de acceso no válido. Por favor, escanea tu QR nuevamente." });
      return;
    }

    registrarAsistencia(token);
  }, [token]);

  const registrarAsistencia = async (qrToken: string) => {
    try {
      setEstado("loading");
      const result = await AsistenciaApi.registrarPorToken(qrToken);
      setRespuesta(result);
      setEstado("success");
      
      // 🔔 Disparar evento para que otras páginas sepan que hay nueva asistencia
      const clienteNombre = `${result.clienteNombre} ${result.clienteApellido}`;
      window.dispatchEvent(
        new CustomEvent("asistencia-registrada", {
          detail: { clienteNombre },
        })
      );
      console.log("✅ Evento 'asistencia-registrada' disparado para", clienteNombre);
    } catch (err) {
      setEstado("error");
      let status: number | undefined = undefined;
      let message = "Error al registrar asistencia";

      if (err && typeof err === "object") {
        const e = err as Error & { status?: number };
        status = e.status;
        if (e.message) message = e.message;
      }

      // Mapear por status cuando sea posible
      if (status === 404) {
        message = "Código QR no válido o no existe";
      } else if (status === 409) {
        // Mantener el mensaje exacto del backend
        // Deshabilitar reintento por 3s para evitar spam
        setRetryDisabled(true);
        setTimeout(() => setRetryDisabled(false), 3000);
        
        // 🔔 También disparar evento en duplicados para refrescar la lista
        window.dispatchEvent(new CustomEvent("asistencia-registrada"));
      } else if (status === 500) {
        message = "Error del servidor. Intente nuevamente.";
      }

      console.error("❌ Error al registrar asistencia:", err);
      setError({ status, message });
    }
  };

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const horaActual = new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center text-black font-bold text-2xl shadow-lg">
              V
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">
            VIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">CENTER FIT</span>
          </h1>
          <p className="text-slate-400 text-sm tracking-[0.2em] mt-1">REGISTRO DE ASISTENCIA</p>
        </div>

        {/* Card principal */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
          {estado === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Registrando asistencia...</h2>
              <p className="text-slate-400 text-sm">Por favor espera un momento</p>
            </div>
          )}

          {estado === "success" && respuesta && (
            <div className="text-center">
              {/* Ícono de éxito con animación */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
                <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto relative animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
                {respuesta.clienteNombre} {respuesta.clienteApellido}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-3 text-slate-300">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm capitalize">{fechaActual}</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-300">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-bold">{horaActual}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <p className="text-emerald-400 font-medium">✅ {respuesta.message}</p>
              </div>

              {/* Información de Membresía */}
              {respuesta.membresiaActual && respuesta.fechaVencimiento && (() => {
                const fechaVenc = new Date(respuesta.fechaVencimiento);
                const hoy = new Date();
                const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                const estaProximoAVencer = diasRestantes <= 7 && diasRestantes >= 0;

                return (
                  <>
                    <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ 
                            backgroundColor: respuesta.membresiaActual.color || "#3B82F6",
                            boxShadow: `0 0 10px ${respuesta.membresiaActual.color || "#3B82F6"}80`
                          }}
                        ></div>
                        <span className="text-white font-semibold">
                          {respuesta.membresiaActual.nombre}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Vence: {fechaVenc.toLocaleDateString()}
                      </p>
                    </div>

                    {estaProximoAVencer && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 animate-pulse">
                        <p className="text-yellow-400 font-medium text-sm">
                          ⚠️ Tu membresía vence en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}
                        </p>
                        <p className="text-yellow-300/70 text-xs mt-1">
                          ¡No olvides renovarla para seguir disfrutando del gimnasio!
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="text-slate-400 text-sm">
                <p>Tu asistencia ha sido registrada correctamente.</p>
                <p className="mt-2">¡Disfruta tu entrenamiento! 💪</p>
              </div>

              <button
                onClick={() => window.close()}
                className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          )}

          {estado === "error" && (
            <div className="text-center">
              {/* Ícono de error */}
              <div className="mb-6">
                <XCircle className="w-20 h-20 text-red-400 mx-auto" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Error al registrar</h2>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-400 font-medium">{error.message}</p>
              </div>

              <div className="space-y-4 text-sm text-slate-400">
                <p>Posibles causas:</p>
                <ul className="list-disc list-inside space-y-2 text-left">
                  <li>❌ No tienes una membresía activa</li>
                  <li>⏰ Tu membresía ha vencido</li>
                  <li>🚫 El QR no es válido o fue deshabilitado</li>
                  <li>✅ Ya registraste tu asistencia hoy</li>
                  <li>📡 Problemas de conexión a internet</li>
                </ul>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-4">
                  <p className="text-orange-400 font-medium text-xs">
                    💡 Si no tienes membresía, acércate a recepción para adquirir una y comenzar a entrenar.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
                >
                  Ir al inicio
                </button>
                <button
                  onClick={() => token && registrarAsistencia(token)}
                  disabled={retryDisabled}
                  className={`w-full py-3 rounded-lg transition-colors font-medium ${
                    retryDisabled
                      ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  {retryDisabled ? "Espera un momento..." : "Reintentar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-xs">
          <p>¿Problemas con tu QR?</p>
          <p className="mt-1">Contacta a recepción o envía un WhatsApp al +51 999 888 777</p>
        </div>
      </div>
    </div>
  );
}
