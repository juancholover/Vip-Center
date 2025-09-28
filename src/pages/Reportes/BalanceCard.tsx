interface Props {
  title: string;
  value: string;
}

export default function BalanceCard({ title, value }: Props) {
  return (
    <div className="bg-[#0F1318] p-4 rounded-xl shadow-md border border-white/10">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-xl font-bold text-white">{value}</h3>
    </div>
  );
}
