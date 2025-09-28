import { Plus, Search } from "lucide-react";
import { useClientesStore } from "../../store/useClientesStore";

interface Props {
  setBusqueda: (q: string) => void;
}

export default function ClientesHeader({ setBusqueda }: Props) {
  const { addCliente } = useClientesStore();

  const handleNuevoCliente = () => {
    addCliente({
      nombre: "Nuevo Cliente",
      dni: String(Math.floor(Math.random() * 99999999)),
      fecha: "01/03/2025",
      plan: "Mensual",
      estado: "Activo",
      asistencia: "Hoy - 12:00",
      foto: "https://i.pravatar.cc/150?u=" + Math.random(),
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-xl font-semibold text-emerald-400">
        Reportes de Clientes - <span className="text-slate-200">Vista General</span>
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o DNI..."
            className="w-72 h-9 rounded-lg bg-[#0F1318] border border-white/10 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>
        <button
          onClick={handleNuevoCliente}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </button>
      </div>
    </div>
  );
}
