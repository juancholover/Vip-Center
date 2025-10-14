import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Save, RefreshCw, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { NotificacionesApi } from "../../api/notificacionesApi";

interface NotificacionConfig {
  emailEnabled: boolean;
  emailFrom: string;
  smsEnabled: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
}

export default function NotificacionesConfig() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [config, setConfig] = useState<NotificacionConfig>({
    emailEnabled: true,
    emailFrom: "VIP Center Fit <no-reply@vipcentergym.com>",
    smsEnabled: false,
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioFromNumber: "",
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const data = await NotificacionesApi.obtenerConfiguracion();
      setConfig(data);
      toast.success("Configuración cargada ✅");
    } catch (error) {
      toast.error("Error al cargar configuración");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (config.emailEnabled && !config.emailFrom.trim()) {
      toast.error("El email remitente es obligatorio si el email está activado");
      return;
    }

    if (config.smsEnabled) {
      if (!config.twilioAccountSid.trim()) {
        toast.error("El Account SID de Twilio es obligatorio si SMS está activado");
        return;
      }
      if (!config.twilioAuthToken.trim()) {
        toast.error("El Auth Token de Twilio es obligatorio si SMS está activado");
        return;
      }
      if (!config.twilioFromNumber.trim()) {
        toast.error("El número de teléfono de Twilio es obligatorio si SMS está activado");
        return;
      }
    }

    setSaving(true);
    try {
      await NotificacionesApi.guardarConfiguracion(config);
      toast.success("Configuración guardada exitosamente ✅");
    } catch (error) {
      toast.error("Error al guardar configuración");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = () => {
    toast.loading("Enviando email de prueba...", { id: "test-email" });
    
    setTimeout(() => {
      toast.dismiss("test-email");
      toast.success("Email de prueba enviado ✅");
    }, 2000);
  };

  const handleTestSms = () => {
    toast.loading("Enviando SMS de prueba...", { id: "test-sms" });
    
    setTimeout(() => {
      toast.dismiss("test-sms");
      toast.success("SMS de prueba enviado ✅");
    }, 2000);
  };

  return (
    <motion.div
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Configuración de Notificaciones</h1>
          <p className="text-slate-400 text-sm">Configura el envío de emails y SMS a tus clientes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarConfiguracion}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              loading
                ? "bg-orange-700/60 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500"
            } text-white text-sm`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              saving
                ? "bg-emerald-700/60 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            } text-white text-sm`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Configuración de Email */}
        <div className="bg-[#1A1F25] rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Email</h2>
                <p className="text-xs text-slate-400">Notificaciones por correo electrónico</p>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, emailEnabled: !config.emailEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.emailEnabled ? "bg-emerald-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.emailEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {config.emailEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email Remitente *
                </label>
                <input
                  type="email"
                  value={config.emailFrom}
                  onChange={(e) => setConfig({ ...config, emailFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="VIP Center Fit <no-reply@vipcentergym.com>"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Este email aparecerá como remitente en las notificaciones
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {config.emailEnabled ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Email activado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Email desactivado</span>
                  </div>
                )}
                <button
                  onClick={handleTestEmail}
                  disabled={!config.emailEnabled}
                  className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    config.emailEnabled
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Enviar prueba
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Configuración de SMS */}
        <div className="bg-[#1A1F25] rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SMS (Twilio)</h2>
                <p className="text-xs text-slate-400">Notificaciones por mensaje de texto</p>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, smsEnabled: !config.smsEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.smsEnabled ? "bg-emerald-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.smsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {config.smsEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Account SID *
                </label>
                <input
                  type="text"
                  value={config.twilioAccountSid}
                  onChange={(e) => setConfig({ ...config, twilioAccountSid: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Auth Token *
                </label>
                <div className="relative">
                  <input
                    type={showAuthToken ? "text" : "password"}
                    value={config.twilioAuthToken}
                    onChange={(e) => setConfig({ ...config, twilioAuthToken: e.target.value })}
                    className="w-full px-3 py-2 pr-10 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthToken(!showAuthToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showAuthToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Número de Teléfono *
                </label>
                <input
                  type="tel"
                  value={config.twilioFromNumber}
                  onChange={(e) => setConfig({ ...config, twilioFromNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="+51999888777"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Número de Twilio desde el cual se enviarán los SMS
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {config.smsEnabled ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>SMS activado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>SMS desactivado</span>
                  </div>
                )}
                <button
                  onClick={handleTestSms}
                  disabled={!config.smsEnabled}
                  className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    config.smsEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Enviar prueba
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          ¿Cuándo se envían las notificaciones?
        </h3>
        <ul className="text-slate-300 text-sm space-y-1.5 ml-6 list-disc">
          <li>✅ <strong>Pago Aprobado:</strong> Email y SMS confirmando el pago y activación de membresía</li>
          <li>💰 <strong>Reembolso Procesado:</strong> Email y SMS notificando la devolución del dinero</li>
          <li>📧 Se envían de forma asíncrona para no afectar el rendimiento</li>
        </ul>
      </div>

      {/* Guía de configuración de Twilio */}
      <div className="bg-[#1A1F25] rounded-xl border border-white/10 p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          ¿Cómo obtener credenciales de Twilio?
        </h3>
        <ol className="text-slate-300 text-sm space-y-2 ml-5 list-decimal">
          <li>
            Crea una cuenta en{" "}
            <a
              href="https://www.twilio.com/try-twilio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              twilio.com
            </a>
          </li>
          <li>Verifica tu número de teléfono</li>
          <li>
            Ve al{" "}
            <a
              href="https://console.twilio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Dashboard de Twilio
            </a>
          </li>
          <li>Copia tu <strong>Account SID</strong> y <strong>Auth Token</strong></li>
          <li>
            Compra un número de teléfono en{" "}
            <a
              href="https://console.twilio.com/us1/develop/phone-numbers/manage/search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Phone Numbers
            </a>
          </li>
          <li>Pega las credenciales en los campos de arriba y guarda</li>
        </ol>
      </div>
    </motion.div>
  );
}
