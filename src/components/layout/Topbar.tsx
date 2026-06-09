import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LayoutGrid, Package, Settings } from "lucide-react";
import logo from "../../assets/logo.svg";

function Dropdown({
  label,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
          open
            ? `bg-white/10 ${color}`
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownLink({
  to,
  children,
  color = "text-emerald-400",
}: {
  to: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 text-xs transition-colors ${
          isActive
            ? `${color} bg-white/5`
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Topbar() {
  const { user } = useAuthStore();

  const roles = user?.roles || [];
  const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
  const isSecretaria = roles.some((r: string) => r.toLowerCase() === "secretaria");
  const isRecepcionista = roles.some((r: string) => r.toLowerCase() === "recepcionista");

  const rolActivo = isAdmin
    ? "Administrador"
    : isSecretaria
    ? "Secretaría"
    : isRecepcionista
    ? "Recepcionista"
    : "Usuario";

  const neonStyles =
    isAdmin
      ? "from-emerald-400 via-emerald-300 to-emerald-500 shadow-[0_0_15px_#10b981]"
      : isSecretaria
      ? "from-yellow-400 via-yellow-300 to-yellow-500 shadow-[0_0_15px_#facc15]"
      : isRecepcionista
      ? "from-teal-400 via-teal-300 to-teal-500 shadow-[0_0_15px_#14b8a6]"
      : "from-slate-400 via-slate-300 to-slate-500 shadow-[0_0_15px_#94a3b8]";

  const puedeInventario = isAdmin || isRecepcionista || isSecretaria;

  return (
    <header className="relative flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-8 py-2 md:py-3 border-b border-white/10 bg-[#171B22]/90 backdrop-blur-md shadow-lg gap-2 md:gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <img
          src={logo}
          alt="logo"
          className="h-7 w-7 md:h-9 md:w-9 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
        />
        <h1 className="text-lg md:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">VIP</span>{" "}
          <span className="text-slate-200">Center</span>{" "}
          <span className="text-yellow-400">Fit</span>
        </h1>
      </div>

      {/* Navegación con dropdowns */}
      <nav className="flex items-center gap-1.5 md:gap-2 text-xs font-medium order-last md:order-none pb-1 md:pb-0">
        {/* ═══ GESTIÓN ═══ */}
        <Dropdown label="Gestión" icon={LayoutGrid} color="text-emerald-400">
          <DropdownLink to="/">Inicio</DropdownLink>
          <DropdownLink to="/asistencia">Asistencia</DropdownLink>
          <DropdownLink to="/suscripcion">Suscripciones</DropdownLink>
          <DropdownLink to="/clientes">Clientes</DropdownLink>
          {isAdmin && (
            <DropdownLink to="/clientes-inactivos" color="text-red-400">
              Clientes Inactivos
            </DropdownLink>
          )}
        </Dropdown>

        {/* ═══ ADMIN (solo Admin) ═══ */}
        {isAdmin && (
          <Dropdown label="Admin" icon={Settings} color="text-purple-400">
            <DropdownLink to="/empleados" color="text-purple-400">
              Empleados
            </DropdownLink>
            <DropdownLink to="/membresias" color="text-cyan-400">
              Membresías
            </DropdownLink>
            {(isAdmin || isSecretaria) && (
              <DropdownLink to="/recepcion" color="text-teal-400">
                Recepción
              </DropdownLink>
            )}
            <DropdownLink to="/reportes" color="text-orange-400">
              Reportes
            </DropdownLink>
            <DropdownLink to="/configuracion/notificaciones" color="text-pink-400">
              Configuración
            </DropdownLink>
          </Dropdown>
        )}

        {/* ═══ INVENTARIO ═══ */}
        {puedeInventario && (
          <Dropdown label="Inventario" icon={Package} color="text-amber-400">
            <DropdownLink to="/inventario/productos" color="text-amber-400">
              Productos
            </DropdownLink>
            <DropdownLink to="/inventario/ventas" color="text-green-400">
              Ventas
            </DropdownLink>
            {isAdmin && (
              <DropdownLink to="/inventario/stock" color="text-blue-400">
                Stock
              </DropdownLink>
            )}
            {isAdmin && (
              <DropdownLink to="/inventario/reportes" color="text-rose-400">
                Reportes
              </DropdownLink>
            )}
          </Dropdown>
        )}

        {/* ═══ PERFIL ═══ */}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `ml-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              isActive
                ? "text-blue-400 bg-white/10"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`
          }
        >
          Mi Perfil
        </NavLink>
      </nav>

      {/* Usuario + Rol */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto md:ml-0">
        <div className="flex flex-col text-right">
          <span className="text-xs md:text-sm text-slate-200 font-medium">
            {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
          </span>
          <span
            className={`text-[10px] md:text-[11px] mt-0.5 px-2 py-0.5 rounded-full border inline-block w-fit ml-auto ${
              isAdmin
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : isSecretaria
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                : isRecepcionista
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-600/20 text-slate-300 border-slate-500/40"
            }`}
          >
            {rolActivo}
          </span>
        </div>
      </div>

      {/* Franja neón */}
      <div
        className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${neonStyles} animate-slideGradient`}
      />
    </header>
  );
}
