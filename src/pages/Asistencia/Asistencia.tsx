import { Phone, IdCard, CalendarDays, User } from "lucide-react";
import { useClientesStore } from "../../store/useClientesStore";

export default function Asistencia() {
  const { selectedCliente } = useClientesStore();

  if (!selectedCliente) {
    return (
      <div className="text-slate-400">
        ⚠️ No hay cliente seleccionado. Vuelve a <b>Clientes</b> y selecciona uno.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {/* Card Cliente */}
      <div className="bg-[#0F1318] rounded-xl border border-white/10 p-4 flex flex-col items-center">
        <img
          src={selectedCliente.foto}
          alt={selectedCliente.nombre}
          className="w-40 h-52 object-cover rounded-lg shadow-md"
        />
        <div className="mt-3 text-center">
          <p className="text-sm text-slate-400">Asistencia</p>
          <p className="text-slate-200 font-medium">{selectedCliente.asistencia}</p>
        </div>
      </div>

      {/* Card Datos */}
      <div className="bg-[#0F1318] rounded-xl border border-white/10 p-4">
        <h2 className="text-slate-200 font-semibold mb-4">Datos</h2>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <User className="h-5 w-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Nombre:</span>
            <span className="text-slate-200 font-medium">{selectedCliente.nombre}</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Telf/Celular:</span>
            <span className="text-slate-200 font-medium">{selectedCliente.dni}</span>
          </li>
          <li className="flex items-center gap-3">
            <IdCard className="h-5 w-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Membresía:</span>
            <span className="text-slate-200 font-medium">{selectedCliente.plan}</span>
          </li>
          <li className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Estado:</span>
            <span
              className={`font-medium ${
                selectedCliente.estado === "Activo"
                  ? "text-emerald-400"
                  : "text-orange-400"
              }`}
            >
              {selectedCliente.estado}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
