import { Card, CardContent } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

const dataLine = [
  { day: "10/05", ingresos: 3000 },
  { day: "11/05", ingresos: 4200 },
  { day: "12/05", ingresos: 2800 },
  { day: "13/05", ingresos: 5100 },
  { day: "14/05", ingresos: 3900 },
  { day: "15/05", ingresos: 4600 },
  { day: "16/05", ingresos: 5200 },
];

const dataPie = [
  { name: "Básico", value: 8200 },
  { name: "Premium", value: 12400 },
  { name: "Anual", value: 5600 },
];

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

const historial = [
  { cliente: "María Torres", fecha: "15/09/2025", plan: "Premium", metodo: "Tarjeta", monto: "$120", estado: "✔ Confirmado" },
  { cliente: "Carlos Pérez", fecha: "14/09/2025", plan: "Básico", metodo: "Efectivo", monto: "$50", estado: "✔ Confirmado" },
  { cliente: "Lucía Gómez", fecha: "13/09/2025", plan: "Anual", metodo: "Transferencia", monto: "$500", estado: "✔ Confirmado" },
];

export default function IngresosReport() {
  return (
    <div className="p-6 space-y-6">
      {/* Cards superiores */}
      <div className="grid grid-cols-4 gap-6">
        <Card><CardContent className="p-4"><h2 className="text-lg font-bold">$45,680</h2><p className="text-slate-400">Total Ingresos</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2 className="text-lg font-bold">$15,240</h2><p className="text-slate-400">Pagos Confirmados</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2 className="text-lg font-bold">$2,180</h2><p className="text-slate-400">Pagos Pendientes</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2 className="text-lg font-bold">324</h2><p className="text-slate-400">Transacciones</p></CardContent></Card>
      </div>

      {/* Tendencia de ingresos */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-slate-200 font-semibold mb-4">Tendencia de Ingresos (últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataLine}>
              <XAxis dataKey="day" stroke="#888" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ingresos" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bloque inferior */}
      <div className="grid grid-cols-2 gap-6">
        {/* Historial */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-slate-200 font-semibold mb-4">Historial de Ingresos</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Método</th>
                  <th className="pb-2">Monto</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-2">{row.cliente}</td>
                    <td>{row.fecha}</td>
                    <td>{row.plan}</td>
                    <td>{row.metodo}</td>
                    <td>{row.monto}</td>
                    <td>{row.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-slate-200 font-semibold mb-4">Ingresos por tipo de plan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dataPie} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
