import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
  Package,
  Settings,
  Home,
  UserCheck,
  CreditCard,
  Users,
  UserX,
  ShoppingCart,
  BarChart3,
  Warehouse,
  ClipboardList,
  Briefcase,
  HeartHandshake,
  Bell,
  Truck,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.svg";

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ElementType;
  color: string;
  adminOnly?: boolean;
  inventario?: boolean;
}

const gestionLinks: SidebarLink[] = [
  { to: "/", label: "Inicio", icon: Home, color: "text-emerald-400" },
  { to: "/asistencia", label: "Asistencia", icon: UserCheck, color: "text-emerald-400" },
  { to: "/suscripcion", label: "Suscripciones", icon: CreditCard, color: "text-emerald-400" },
  { to: "/clientes", label: "Clientes", icon: Users, color: "text-emerald-400" },
  { to: "/clientes-inactivos", label: "Inactivos", icon: UserX, color: "text-red-400", adminOnly: true },
];

const adminLinks: SidebarLink[] = [
  { to: "/empleados", label: "Empleados", icon: Briefcase, color: "text-purple-400", adminOnly: true },
  { to: "/membresias", label: "Membresías", icon: HeartHandshake, color: "text-cyan-400", adminOnly: true },
  { to: "/recepcion", label: "Recepción", icon: ClipboardList, color: "text-teal-400" },
  { to: "/reportes", label: "Reportes", icon: BarChart3, color: "text-orange-400", adminOnly: true },
  { to: "/configuracion/notificaciones", label: "Configuración", icon: Bell, color: "text-pink-400", adminOnly: true },
];

const inventarioLinks: SidebarLink[] = [
  { to: "/inventario/productos", label: "Productos", icon: Package, color: "text-amber-400" },
  { to: "/inventario/ventas", label: "Ventas", icon: ShoppingCart, color: "text-green-400" },
  { to: "/inventario/stock", label: "Stock", icon: Warehouse, color: "text-blue-400", adminOnly: true },
  { to: "/inventario/reportes", label: "Reportes", icon: BarChart3, color: "text-rose-400", adminOnly: true },
];

function SidebarSection({
  label,
  icon: Icon,
  color,
  children,
  defaultOpen = false,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();

  // Abrir si alguna ruta hija está activa
  useEffect(() => {
    const childPaths = (children as React.ReactElement[])
      ?.filter((child) => child?.props?.to)
      .map((child) => child.props.to as string);
    if (childPaths?.some((p) => location.pathname === p || (p !== "/" && location.pathname.startsWith(p)))) {
      setOpen(true);
    }
  }, [location.pathname, children]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          open
            ? `bg-white/10 ${color}`
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="ml-4 mt-0.5 border-l border-white/10 pl-3 space-y-0.5 animate-in fade-in slide-in-from-left-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon, color }: SidebarLink) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
          isActive
            ? `bg-white/10 ${color}`
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const roles = user?.roles || [];
  const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
  const isSecretaria = roles.some((r: string) => r.toLowerCase() === "secretaria");
  const isRecepcionista = roles.some((r: string) => r.toLowerCase() === "recepcionista");

  const puedeInventario = isAdmin || isRecepcionista || isSecretaria;

  const rolActivo = isAdmin
    ? "Administrador"
    : isSecretaria
    ? "Secretaría"
    : isRecepcionista
    ? "Recepcionista"
    : "Usuario";

  const neonColor = isAdmin
    ? "bg-emerald-400"
    : isSecretaria
    ? "bg-yellow-400"
    : isRecepcionista
    ? "bg-teal-400"
    : "bg-slate-400";

  // Cerrar mobile al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <img
          src={logo}
          alt="logo"
          className="h-8 w-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] shrink-0"
        />
        {!collapsed && (
          <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
            <span className="text-emerald-400">VIP</span>{" "}
            <span className="text-slate-200">Center</span>{" "}
            <span className="text-yellow-400">Fit</span>
          </h1>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* GESTIÓN */}
        {!collapsed ? (
          <SidebarSection label="Gestión" icon={LayoutGrid} color="text-emerald-400" defaultOpen>
            {gestionLinks
              .filter((l) => !l.adminOnly || isAdmin)
              .map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
          </SidebarSection>
        ) : (
          gestionLinks
            .filter((l) => !l.adminOnly || isAdmin)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-lg transition-colors ${
                    isActive ? `bg-white/10 ${link.color}` : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
                title={link.label}
              >
                <link.icon className="w-4 h-4" />
              </NavLink>
            ))
        )}

        {/* ADMIN */}
        {isAdmin && (
          <>
            {!collapsed ? (
              <SidebarSection label="Admin" icon={Settings} color="text-purple-400">
                {adminLinks.map((link) => (
                  <SidebarLink key={link.to} {...link} />
                ))}
              </SidebarSection>
            ) : (
              adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-lg transition-colors ${
                      isActive ? `bg-white/10 ${link.color}` : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                  title={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </NavLink>
              ))
            )}
          </>
        )}

        {/* INVENTARIO */}
        {puedeInventario && (
          <>
            {!collapsed ? (
              <SidebarSection label="Inventario" icon={Package} color="text-amber-400">
                {inventarioLinks.map((link) => (
                  <SidebarLink key={link.to} {...link} />
                ))}
              </SidebarSection>
            ) : (
              inventarioLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-lg transition-colors ${
                      isActive ? `bg-white/10 ${link.color}` : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                  title={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </NavLink>
              ))
            )}
          </>
        )}
      </nav>

      {/* Perfil + Colapsar */}
      <div className="border-t border-white/10 px-3 py-3 space-y-2">
        {!collapsed && (
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? "bg-white/10 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-slate-200 text-xs">
                {user?.nombre} {user?.apellido}
              </span>
              <span className="text-[10px] text-slate-500">{rolActivo}</span>
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Neón indicator */}
      <div className={`w-full h-[3px] ${neonColor}`} />
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#171B22] border border-white/10 text-slate-300 hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#171B22] border-r border-white/10 z-40 transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-56"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar — Mobile */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen bg-[#171B22] border-r border-white/10 z-50 transition-transform duration-300 w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
