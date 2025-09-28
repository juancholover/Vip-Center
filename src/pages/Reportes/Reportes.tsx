import { useState } from "react";
import BalanceCard from "./BalanceCard";
import ChartOverview from "./ChartOverview";
import ActivityChart from "./ActivityChart";
import PaymentList from "./PaymentList";
import CreditCard from "./CreditCard";
import TransactionsList from "./TransactionsList";

// Reportes adicionales
import SuscripcionesReport from "../Suscripcion/SuscripcionesReport";
import AsistenciaReport from "../Asistencia/AsistenciaReport";

export default function Reportes() {
  const [tab, setTab] = useState<"ingresos" | "suscripciones" | "asistencia">("ingresos");

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("ingresos")}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === "ingresos" ? "bg-emerald-600 text-white" : "bg-[#0F1318] text-slate-300"
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => setTab("suscripciones")}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === "suscripciones" ? "bg-emerald-600 text-white" : "bg-[#0F1318] text-slate-300"
          }`}
        >
          Suscripciones
        </button>
        <button
          onClick={() => setTab("asistencia")}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === "asistencia" ? "bg-emerald-600 text-white" : "bg-[#0F1318] text-slate-300"
          }`}
        >
          Asistencia
        </button>
      </div>

      {/* Contenido dinámico */}
      {tab === "ingresos" && (
        <>
          {/* Cards superiores */}
          <div className="grid grid-cols-4 gap-6">
            <BalanceCard title="Balance" value="$41,210" />
            <BalanceCard title="Income" value="$41,210" />
            <BalanceCard title="Expenses" value="$41,210" />
            <BalanceCard title="Savings" value="$41,210" />
          </div>

          {/* Bloque central */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <ChartOverview />
              <ActivityChart />
            </div>
            <div className="space-y-6">
              <CreditCard />
              <PaymentList />
            </div>
          </div>

          {/* Transacciones recientes */}
          <TransactionsList />
        </>
      )}

      {tab === "suscripciones" && <SuscripcionesReport />}
      {tab === "asistencia" && <AsistenciaReport />}
    </div>
  );
}
