import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
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

export default function ClientesCharts({ clientes }: Props) {
  const activos = clientes.filter((c) => c.estado === "Activo" && !isVencido(c.plan, c.fecha)).length;
  const inactivos = clientes.filter((c) => c.estado === "Inactivo").length;
  const vencidos = clientes.filter((c) => isVencido(c.plan, c.fecha)).length;

  const dataLine = [
    { mes: "Ene", clientes: 40 },
    { mes: "Feb", clientes: 60 },
    { mes: "Mar", clientes: 80 },
    { mes: "Abr", clientes: 70 },
    { mes: "May", clientes: 100 },
    { mes: "Jun", clientes: 120 },
    { mes: "Jul", clientes: 140 },
  ];

  const dataPie = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos },
    { name: "Vencidos", value: vencidos },
  ];
  const COLORS = ["#34d399", "#f97316", "#6366f1"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#0F1318] p-4 rounded-lg border border-white/10">
        <h2 className="text-slate-200 text-sm font-medium mb-3">Evolución de Clientes Registrados</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataLine}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="mes" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="clientes" stroke="#34d399" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[#0F1318] p-4 rounded-lg border border-white/10">
        <h2 className="text-slate-200 text-sm font-medium mb-3">Distribución de Clientes</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {dataPie.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
