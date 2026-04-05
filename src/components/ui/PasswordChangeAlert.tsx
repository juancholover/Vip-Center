import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { AlertCircle, X } from "lucide-react";

/**
 * Alerta flotante que aparece cuando el usuario debe cambiar su contraseña
 * 
 * Características:
 * - Se muestra solo si debeCambiarPassword = true
 * - Aparece en la parte superior del dashboard
 * - Se puede cerrar temporalmente (no vuelve a aparecer hasta recargar)
 * - Botón directo para ir a cambiar contraseña
 */
export default function PasswordChangeAlert() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isDismissed, setIsDismissed] = useState(false);

  // No mostrar si:
  // - No hay usuario autenticado
  // - El usuario NO debe cambiar contraseña
  // - El usuario cerró la alerta temporalmente
  if (!user || !user.debeCambiarPassword || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-l-4 border-yellow-400 rounded-lg p-4 shadow-2xl backdrop-blur-sm max-w-md">
        <div className="flex items-start gap-3">
          {/* Icono de advertencia */}
          <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1 text-sm">
              🔐 Cambio de contraseña requerido
            </h3>
            <p className="text-slate-300 text-xs mb-3">
              Por seguridad, debes cambiar tu contraseña inicial antes de continuar usando la plataforma.
            </p>

            {/* Botón de acción */}
            <button
              onClick={() => navigate("/change-password")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1.5 px-4 rounded text-xs transition-colors"
            >
              Cambiar ahora →
            </button>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors"
            title="Cerrar temporalmente"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
