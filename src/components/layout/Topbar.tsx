import { useAuthStore } from "../../store/useAuthStore";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Topbar() {
  const { user } = useAuthStore();

  const roles = user?.roles || [];
  // ✅ Backend usa nombres en minúscula: "admin", "secretaria", etc.
  const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
  const isSecretaria = roles.some((r: string) => r.toLowerCase() === "secretaria");

  const rolActivo = isAdmin
    ? "Administrador"
    : isSecretaria
    ? "Secretaría"
    : "Usuario";

  // 💡 Colores del neón según rol
  const neonStyles =
    isAdmin
      ? "from-emerald-400 via-emerald-300 to-emerald-500 shadow-[0_0_15px_#10b981]"
      : isSecretaria
      ? "from-yellow-400 via-yellow-300 to-yellow-500 shadow-[0_0_15px_#facc15]"
      : "from-slate-400 via-slate-300 to-slate-500 shadow-[0_0_15px_#94a3b8]";

  return (
    <header className="relative flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#171B22]/90 backdrop-blur-md shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-emerald-400">VIP</span>{" "}
          <span className="text-slate-200">Center</span>{" "}
          <span className="text-yellow-400">Fit</span>
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex items-center gap-8 text-sm font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-400"
              : "text-slate-300 hover:text-white transition-colors"
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/asistencia"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-400"
              : "text-slate-300 hover:text-white transition-colors"
          }
        >
          Asistencia
        </NavLink>

        <NavLink
          to="/suscripcion"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-400"
              : "text-slate-300 hover:text-white transition-colors"
          }
        >
          Suscripciones
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-400"
              : "text-slate-300 hover:text-white transition-colors"
          }
        >
          Clientes
        </NavLink>

        {/* Solo visible para ADMIN */}
        {isAdmin && (
          <>
            <NavLink
              to="/empleados"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400"
                  : "text-slate-300 hover:text-purple-300 transition-colors"
              }
            >
              Empleados
            </NavLink>
            <NavLink
              to="/membresias"
              className={({ isActive }) =>
                isActive
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-cyan-300 transition-colors"
              }
            >
              Membresías
            </NavLink>
            <NavLink
              to="/reportes"
              className={({ isActive }) =>
                isActive
                  ? "text-orange-400"
                  : "text-slate-300 hover:text-orange-300 transition-colors"
              }
            >
              Reportes
            </NavLink>
            <NavLink
              to="/clientes-inactivos"
              className={({ isActive }) =>
                isActive
                  ? "text-red-400"
                  : "text-slate-300 hover:text-red-300 transition-colors"
              }
            >
              Inactivos
            </NavLink>
            <NavLink
              to="/configuracion/notificaciones"
              className={({ isActive }) =>
                isActive
                  ? "text-pink-400"
                  : "text-slate-300 hover:text-pink-300 transition-colors"
              }
            >
              Configuración
            </NavLink>
          </>
        )}

        {/* Recepción — visible para admin y secretaria */}
        {(isAdmin || isSecretaria) && (
          <NavLink
            to="/recepcion"
            className={({ isActive }) =>
              isActive
                ? "text-teal-400"
                : "text-slate-300 hover:text-teal-300 transition-colors"
            }
          >
            Recepción
          </NavLink>
        )}

        {/* Perfil disponible para todos */}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            isActive
              ? "text-blue-400"
              : "text-slate-300 hover:text-blue-300 transition-colors"
          }
        >
          Mi Perfil
        </NavLink>
      </nav>

      {/* Usuario + Rol */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-sm text-slate-200 font-medium">
            {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
          </span>
          <span
            className={`text-[11px] mt-0.5 px-2 py-0.5 rounded-full border ${
              isAdmin
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : isSecretaria
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                : "bg-slate-600/20 text-slate-300 border-slate-500/40"
            }`}
          >
            {rolActivo}
          </span>
        </div>
      </div>

      {/* 🔥 Franja neón animada bajo el Topbar */}
      <div
        className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${neonStyles} animate-slideGradient`}
      ></div>
    </header>
  );
}
