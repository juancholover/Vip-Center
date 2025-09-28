import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const dataBarras = [
  { mes: "Ene", renovaciones: 200, cancelaciones: 20 },
  { mes: "Feb", renovaciones: 180, cancelaciones: 15 },
  { mes: "Mar", renovaciones: 220, cancelaciones: 25 },
  { mes: "Abr", renovaciones: 190, cancelaciones: 18 },
  { mes: "May", renovaciones: 240, cancelaciones: 22 },
];

const dataPie = [
  { name: "Activas", value: 1247 },
  { name: "Vencidas", value: 89 },
  { name: "Por vencer", value: 156 },
];

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

export default function SuscripcionesReport() {
  return (
    <div className="space-y-6">
      {/* Cards resumen */}
      <div className="grid grid-cols-5 gap-6">
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Suscripciones Activas</h3>
          <p className="text-2xl font-bold text-emerald-500">1,247</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Suscripciones Vencidas</h3>
          <p className="text-2xl font-bold text-red-500">89</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Próximas a Vencer</h3>
          <p className="text-2xl font-bold text-yellow-500">156</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Renovaciones del Mes</h3>
          <p className="text-2xl font-bold text-emerald-400">203</p>
        </div>
        <div className="bg-[#0F1318] p-4 rounded-lg text-center">
          <h3 className="text-sm text-slate-400">Cancelaciones</h3>
          <p className="text-2xl font-bold text-red-400">34</p>
        </div>
      </div>

      {/* Gráfico de renovaciones */}
      <div className="bg-[#0F1318] p-6 rounded-lg">
        <h3 className="text-slate-300 mb-4">Renovaciones y Cancelaciones</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataBarras}>
            <XAxis dataKey="mes" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="renovaciones" fill="#00C49F" />
            <Bar dataKey="cancelaciones" fill="#FF4D4D" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0F1318] p-6 rounded-lg">
          <h3 className="text-slate-300 mb-4">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataPie}
                dataKey="value"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {dataPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0F1318] p-6 rounded-lg">
          <h3 className="text-slate-300 mb-4">Distribución de Tipos de Membresía</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Básico", value: 500 },
                  { name: "Premium", value: 300 },
                  { name: "Anual", value: 200 },
                ]}
                dataKey="value"
                outerRadius={90}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FFD93D" />
                <Cell fill="#FF8042" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
