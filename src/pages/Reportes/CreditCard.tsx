export default function CreditCard() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-sm">Credit Card</h3>
      <p className="text-lg font-bold mt-2">3475 7381 3759 ****</p>
      <div className="flex justify-between text-xs mt-6">
        <span>Total Balance</span>
        <span>$3,215,352</span>
      </div>
      <div className="flex justify-between text-xs mt-2">
        <span>Exp Date</span>
        <span>04/24</span>
      </div>
    </div>
  );
}
