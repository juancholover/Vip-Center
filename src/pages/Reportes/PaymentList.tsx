const payments = [
  { name: "Account", value: "$3,241/$10,000" },
  { name: "Software", value: "$241/$250" },
  { name: "Rent House", value: "$1,541/$2,000" },
  { name: "Food", value: "$141/$1,000" },
];

export default function PaymentList() {
  return (
    <div className="bg-[#0F1318] p-4 rounded-xl shadow-md border border-white/10">
      <h3 className="text-white font-semibold mb-4">Payment</h3>
      <ul className="space-y-2">
        {payments.map((p, i) => (
          <li key={i} className="flex justify-between text-sm text-slate-300">
            <span>{p.name}</span>
            <span>{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
