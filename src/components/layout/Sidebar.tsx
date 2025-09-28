import { Home, CalendarCheck2, CreditCard, Users, BarChart2, Settings, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const nav = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/asistencia", label: "Asistencia", icon: CalendarCheck2 },
  { path: "/suscripcion", label: "Suscripción", icon: CreditCard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/reportes", label: "Reportes", icon: BarChart2 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        />
      )}

      <aside
        className={`fixed sm:static top-0 left-0 h-full w-[210px] shrink-0 bg-[#0F1318] border-r border-white/5 flex flex-col py-4 z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Botón cerrar en móvil */}
        <div className="flex justify-end px-3 sm:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {nav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[#1F2430] text-slate-100"
                    : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center h-5 w-5 rounded-sm ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-slate-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-3 pt-2">
          <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
            <span className="grid place-items-center h-5 w-5 rounded-sm bg-white/5">
              <Settings className="h-3.5 w-3.5" />
            </span>
            Setting
          </button>
        </div>
      </aside>
    </>
  );
}
