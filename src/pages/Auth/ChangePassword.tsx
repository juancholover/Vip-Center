import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarPasswordRequest } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/logo.svg";

export default function ChangePassword() {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const navigate = useNavigate();
  const updateDebeCambiarPassword = useAuthStore((s) => s.updateDebeCambiarPassword);
  const user = useAuthStore((s) => s.user);

  // Si no hay usuario o no debe cambiar password, redirigir
  if (!user || !user.debeCambiarPassword) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones frontend
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await cambiarPasswordRequest({ nuevaPassword, confirmarPassword });
      
      // Actualizar flag en store
      updateDebeCambiarPassword(false);
      
      // Redirigir al dashboard
      navigate("/");
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || "Error al cambiar contraseña");
      } else {
        setError("Error al cambiar contraseña. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0F1318] text-white flex flex-col justify-center items-center px-4">
      <img src={logo} alt="VIP Center Fit" className="h-20 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">
        <span className="text-emerald-400">Cambiar</span>{" "}
        <span className="text-yellow-400">Contraseña</span>
      </h1>
      <p className="text-sm text-slate-400 mb-6 text-center max-w-md">
        Por seguridad, debes cambiar tu contraseña antes de continuar.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[#171B22] p-6 rounded-xl w-full max-w-md shadow-lg border border-white/10"
      >
        <label className="block text-sm mb-2">Nueva Contraseña</label>
        <div className="relative mb-4">
          <input
            type={mostrarNueva ? "text" : "password"}
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="w-full p-2 pr-10 rounded bg-[#0F1318] border border-white/10 text-sm"
            placeholder="Mínimo 8 caracteres"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setMostrarNueva(!mostrarNueva)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            disabled={loading}
          >
            {mostrarNueva ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <label className="block text-sm mb-2">Confirmar Contraseña</label>
        <div className="relative mb-6">
          <input
            type={mostrarConfirmar ? "text" : "password"}
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="w-full p-2 pr-10 rounded bg-[#0F1318] border border-white/10 text-sm"
            placeholder="Repite la contraseña"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            disabled={loading}
          >
            {mostrarConfirmar ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-3 mb-4">
            <p className="text-red-400 text-xs text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Cambiando..." : "Cambiar Contraseña"}
        </button>

        <div className="mt-4 text-xs text-slate-400 text-center">
          <p>✓ Mínimo 8 caracteres</p>
          <p>✓ Usa letras, números y símbolos</p>
        </div>
      </form>
    </div>
  );
}
