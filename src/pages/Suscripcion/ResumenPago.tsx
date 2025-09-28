import logo from "../../assets/logo.svg";
import { useClientesStore } from "../../store/useClientesStore";

interface Props {
  plan: string;
  precio: number;
}

export default function ResumenPago({ plan, precio }: Props) {
  const { selectedCliente } = useClientesStore();
  if (!selectedCliente) return null;

  return (
    <div className="bg-[#0F1318] border border-white/10 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={logo} className="h-8 w-8" />
          <h3 className="text-slate-200 font-semibold">Recibo</h3>
        </div>
        <p className="text-xs text-slate-400">
          Fecha: {new Date().toLocaleDateString()}
        </p>
      </div>
      <p><b>Cliente:</b> {selectedCliente.nombre}</p>
      <p><b>Membresía:</b> {plan}</p>
      <p><b>Total:</b> ${precio}</p>
      <button className="mt-3 w-full py-2 rounded-lg bg-emerald-600 text-white text-sm">
        Confirmar Suscripción
      </button>
    </div>
  );
}
