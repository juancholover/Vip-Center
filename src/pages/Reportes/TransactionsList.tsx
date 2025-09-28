const transactions = [
  { name: "Matheus Ferrero", type: "Transfer in", amount: "+$54.08", positive: true },
  { name: "Floyd Miles", type: "Transfer to", amount: "-$39.65", positive: false },
  { name: "Jerome Bell", type: "Transfer to", amount: "-$29.78", positive: false },
  { name: "Ralph Edwards", type: "Transfer to", amount: "-$46.61", positive: false },
];

export default function TransactionsList() {
  return (
    <div className="bg-[#0F1318] p-4 rounded-xl shadow-md border border-white/10">
      <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
      <ul className="space-y-3">
        {transactions.map((t, i) => (
          <li key={i} className="flex justify-between text-sm text-slate-300">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-slate-400">{t.type}</p>
            </div>
            <span className={t.positive ? "text-emerald-400" : "text-red-400"}>
              {t.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
