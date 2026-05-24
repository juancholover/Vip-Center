import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Save, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { NotificacionesApi } from "../../api/notificacionesApi";

interface NotificacionConfig {
  emailEnabled: boolean;
  emailFrom: string;
}

export default function NotificacionesConfig() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<NotificacionConfig>({
    emailEnabled: true,
    emailFrom: "VIP Center Fit <no-reply@vipcentergym.com>",
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const data = await NotificacionesApi.obtenerConfiguracion();
      setConfig(data);
      toast.success("Configuración cargada");
    } catch (error) {
      toast.error("Error al cargar configuración");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (config.emailEnabled && !config.emailFrom.trim()) {
      toast.error("El email remitente es obligatorio si el email está activado");
      return;
    }

    setSaving(true);
    try {
      await NotificacionesApi.guardarConfiguracion(config);
      toast.success("Configuración guardada exitosamente");
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
      toast.success("Email de prueba enviado");
    }, 2000);
  };

  return (
    <motion.div
      className="p-5 text-white space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <NotificacionesHeader
        loading={loading}
        saving={saving}
        onRefresh={cargarConfiguracion}
        onSave={handleGuardar}
      />

      <div className="max-w-xl">
        <div className="bg-[#1A1F25] rounded-xl border border-white/10 p-5 space-y-4">
          <EmailToggle
            enabled={config.emailEnabled}
            onToggle={() => setConfig({ ...config, emailEnabled: !config.emailEnabled })}
          />

          {config.emailEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email remitente *
              </label>
              <input
                type="email"
                value={config.emailFrom}
                onChange={(e) => setConfig({ ...config, emailFrom: e.target.value })}
                className="w-full px-3 py-2 bg-[#0F1318] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="VIP Center Fit <no-reply@vipcentergym.com>"
              />
              <p className="text-xs text-slate-400">
                Este email aparecerá como remitente en las notificaciones
              </p>

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
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-xl">
        <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          ¿Cuándo se envían las notificaciones?
        </h3>
        <ul className="text-slate-300 text-sm space-y-1.5 ml-6 list-disc">
          <li>
            <strong>Pago aprobado:</strong> email confirmando el pago y activación de membresía
          </li>
          <li>
            <strong>Reembolso procesado:</strong> email notificando la devolución
          </li>
          <li>
            <strong>Recordatorios de vencimiento:</strong> cron diario en backend (HU-31)
          </li>
          <li>
            <strong>Pago rechazado (tarjeta):</strong> alerta automática por email (HU-33)
          </li>
        </ul>
        <p className="text-slate-400 text-xs mt-3">
          Las notificaciones SMS (Twilio) fueron retiradas del sistema. Para contactar clientes
          use WhatsApp manualmente desde el enlace de pago (wa.me).
        </p>
      </div>
    </motion.div>
  );
}

function NotificacionesHeader({
  loading,
  saving,
  onRefresh,
  onSave,
}: {
  loading: boolean;
  saving: boolean;
  onRefresh: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-emerald-400">Configuración de Notificaciones</h1>
        <p className="text-slate-400 text-sm">Configura el envío de emails a tus clientes</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            loading ? "bg-cyan-700/60 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500"
          } text-white text-sm`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Cargando..." : "Refrescar"}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            saving ? "bg-emerald-700/60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
          } text-white text-sm`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}

function EmailToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
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
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-emerald-600" : "bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
