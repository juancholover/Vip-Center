import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dataAsistencia = [
  { dia: "Lun", total: 120 },
  { dia: "Mar", total: 180 },
  { dia: "Mié", total: 200 },
  { dia: "Jue", total: 160 },
  { dia: "Vie", total: 220 },
  { dia: "Sáb", total: 250 },
  { dia: "Dom", total: 150 },
];

export default function AsistenciaReport() {
  return (
    <div className="space-y-6">
      {/* Cards resumen */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Total Asistencias</h3>
          <p className="text-2xl font-bold text-emerald-500">8,750</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Nuevos Clientes</h3>
          <p className="text-2xl font-bold text-blue-400">145</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Clientes Ausentes (7+ días)</h3>
          <p className="text-2xl font-bold text-red-400">89</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Tasa de Retención</h3>
          <p className="text-2xl font-bold text-emerald-400">92%</p>
        </div>
      </div>

      {/* Tendencia de asistencia */}
      <div className="bg-[#0F1318] p-6 rounded-lg">
        <h3 className="text-slate-300 mb-4">Tendencia de Asistencia (7 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataAsistencia}>
            <XAxis dataKey="dia" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#00C49F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Clientes */}
      <div className="bg-[#0F1318] p-6 rounded-lg">
        <h3 className="text-slate-300 mb-4">Top 5 Clientes Más Constantes</h3>
        <ul className="space-y-2">
          <li className="flex justify-between text-slate-300">
            <span>Carlos Mendoza</span>
            <span className="text-emerald-500">28 días</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>María González</span>
            <span className="text-emerald-500">26 días</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>Roberto Silva</span>
            <span className="text-emerald-500">24 días</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>Ana Rodríguez</span>
            <span className="text-emerald-500">22 días</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>Diego Morales</span>
            <span className="text-emerald-500">20 días</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
