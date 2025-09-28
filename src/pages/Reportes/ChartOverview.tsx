    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", income: 400, expense: 240 },
  { month: "Feb", income: 600, expense: 200 },
  { month: "Mar", income: 800, expense: 500 },
  { month: "Apr", income: 700, expense: 400 },
  { month: "May", income: 1000, expense: 600 },
  { month: "Jun", income: 900, expense: 450 },
];

export default function ChartOverview() {
  return (
    <div className="bg-[#0F1318] p-4 rounded-xl shadow-md border border-white/10 h-72">
      <h3 className="text-white font-semibold mb-4">Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#facc15" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
