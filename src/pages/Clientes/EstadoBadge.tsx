import type { EstadoCliente } from "../../api/clientesApi";

export default function EstadoBadge({ estado }: { estado: EstadoCliente }) {
  const map: Record<
    EstadoCliente,
    { bg: string; text: string; label: string; animate?: string }
  > = {
    activo: {
      bg: "bg-emerald-500/15 border-emerald-400/30",
      text: "text-emerald-300",
      label: "Activo",
    },
    vencido: {
      bg: "bg-red-500/15 border-red-400/30",
      text: "text-red-300",
      label: "Vencido",
      animate: "animate-pulse-red",
    },
    sin_membresia: {
      bg: "bg-slate-500/15 border-slate-400/30",
      text: "text-slate-300",
      label: "Sin membresía",
    },
    qr_deshabilitado: {
      bg: "bg-yellow-500/15 border-yellow-400/30",
      text: "text-yellow-300",
      label: "QR deshabilitado",
      animate: "animate-pulseAlert",
    },
  };

  const style = map[estado] ?? map.sin_membresia;

  return (
    <span
      className={`px-2 py-0.5 text-[11px] rounded-full border ${style.bg} ${style.text} ${
        style.animate ?? ""
      }`}
    >
      {style.label}
    </span>
  );
}
