import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LayoutGrid, Package } from "lucide-react";
import logo from "../assets/logo.svg";

export default function SeleccionModulo() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const roles = user?.roles || [];
  const isAdmin = roles.some((r: string) => r.toLowerCase() === "admin");
  const isRecepcionista = roles.some((r: string) => r.toLowerCase() === "recepcionista");
  const isSecretaria = roles.some((r: string) => r.toLowerCase() === "secretaria");

  const puedeInventario = isAdmin || isRecepcionista || isSecretaria;

  return (
    <div className="min-h-screen bg-[#0F1318] text-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <img src={logo} alt="VIP Center Fit" className="h-16 mb-4" />
      <h1 className="text-2xl font-bold mb-2">
        <span className="text-emerald-400">VIP</span>{" "}
        <span className="text-slate-200">Center</span>{" "}
        <span className="text-yellow-400">Fit</span>
      </h1>
      <p className="text-slate-400 text-sm mb-10">
        Hola {user?.nombre}, ¿a dónde quieres ir?
      </p>

      {/* Tarjetas de selección */}
      <div className="flex flex-col sm:flex-row gap-6 max-w-lg w-full">
        {/* Gestión */}
        <button
          onClick={() => navigate("/")}
          className="group flex-1 bg-[#171B22] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <LayoutGrid className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Gestión</h2>
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Clientes, membresías, empleados, asistencia, reportes y más.
          </p>
        </button>

        {/* Inventario */}
        {puedeInventario && (
          <button
            onClick={() => navigate("/inventario/productos")}
            className="group flex-1 bg-[#171B22] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Package className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-200">Inventario</h2>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Suplementos, ventas, stock y reportes de inventario.
            </p>
          </button>
        )}
      </div>

      {/* Volver al login */}
      <button
        onClick={() => {
          useAuthStore.getState().logout();
          navigate("/login");
        }}
        className="mt-10 text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
