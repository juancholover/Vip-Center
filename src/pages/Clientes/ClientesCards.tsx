import { TrendingUp, Users, UserCheck, UserX, Activity } from "lucide-react";
import { type Cliente } from "../../store/useClientesStore";

function isVencido(plan: string, fecha: string): boolean {
  const [day, month, year] = fecha.split("/").map((n) => parseInt(n, 10));
  const fechaRegistro = new Date(year, month - 1, day);
  const ahora = new Date();
  if (plan === "Mensual") {
    const vencimiento = new Date(fechaRegistro);
    vencimiento.setMonth(vencimiento.getMonth() + 1);
    return ahora > vencimiento;
  }
  if (plan === "Anual") {
    const vencimiento = new Date(fechaRegistro);
    vencimiento.setFullYear(vencimiento.getFullYear() + 1);
    return ahora > vencimiento;
  }
  return false;
}

interface Props {
  clientes: Cliente[];
}

export default function ClientesCards({ clientes }: Props) {
  const totalClientes = clientes.length;
  const activos = clientes.filter((c) => c.estado === "Activo" && !isVencido(c.plan, c.fecha)).length;
  const inactivos = clientes.filter((c) => c.estado === "Inactivo").length;
  const vencidos = clientes.filter((c) => isVencido(c.plan, c.fecha)).length;
  const retencion = totalClientes ? ((activos / totalClientes) * 100).toFixed(0) : "0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card icon={<Users />} value={totalClientes} label="Total Clientes" color="emerald" />
      <Card icon={<TrendingUp />} value="+15%" label="Clientes Nuevos" color="blue" />
      <Card icon={<UserCheck />} value={activos} label="Activos" color="green" />
      <Card icon={<UserX />} value={inactivos} label="Inactivos" color="orange" />
      <Card icon={<Activity />} value={vencidos} label="Vencidos" color="pink" />
      <Card icon={<Users />} value={`${retencion}%`} label="Tasa Retención" color="purple" />
    </div>
  );
}

function Card({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode; // 👈 más seguro que JSX.Element
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-[#0F1318] p-4 rounded-lg border border-white/10">
      <div className={`h-5 w-5 text-${color}-400 mb-2`}>{icon}</div>
      <p className={`text-${color}-400 text-lg font-semibold`}>{value}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );
}

