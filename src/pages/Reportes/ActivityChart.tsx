import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", earning: 1200, spent: 800 },
  { day: "Tue", earning: 1000, spent: 700 },
  { day: "Wed", earning: 1500, spent: 900 },
  { day: "Thu", earning: 1400, spent: 1000 },
  { day: "Fri", earning: 1700, spent: 1100 },
  { day: "Sat", earning: 2000, spent: 1500 },
  { day: "Sun", earning: 1800, spent: 1200 },
];

export default function ActivityChart() {
  return (
    <div className="bg-[#0F1318] p-4 rounded-xl shadow-md border border-white/10 h-72">
      <h3 className="text-white font-semibold mb-4">Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="earning" fill="#22c55e" />
          <Bar dataKey="spent" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
