import { useState } from "react";
import { useClientesStore } from "../../store/useClientesStore";
import FormNueva from "./FormNueva";
import FormRenovar from "./FormRenovar";

const planes = [
  {
    nombre: "Básico",
    precio: 50,
    descripcion: "Acceso ilimitado al gimnasio. Ideal para quienes entrenan sin clases extra.",
  },
  {
    nombre: "Premium",
    precio: 80,
    descripcion: "Acceso al gimnasio + clases grupales. Perfecto para mejorar en comunidad.",
  },
  {
    nombre: "Anual",
    precio: 500,
    descripcion: "Acceso completo todo el año + entrenador personal. Mejor precio por largo plazo.",
  },
];

export default function Suscripcion() {
  const [modo, setModo] = useState<"nueva" | "renovar">("nueva");
  const [planSeleccionado, setPlanSeleccionado] = useState(planes[0]);
  const { clientes, selectedCliente, setSelectedCliente } = useClientesStore();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setModo("nueva")}
          className={`px-4 py-2 rounded-lg font-medium ${
            modo === "nueva"
              ? "bg-emerald-600 text-white"
              : "bg-[#0F1318] text-slate-300 hover:bg-[#1F2430]"
          }`}
        >
          Nueva Suscripción
        </button>
        <button
          onClick={() => setModo("renovar")}
          className={`px-4 py-2 rounded-lg font-medium ${
            modo === "renovar"
              ? "bg-emerald-600 text-white"
              : "bg-[#0F1318] text-slate-300 hover:bg-[#1F2430]"
          }`}
        >
          Renovar Suscripción
        </button>
      </div>

      {/* Selector de Cliente */}
      <div>
        <label className="text-slate-400 text-sm block mb-1">
          Seleccionar Cliente
        </label>
        <select
          className="w-80 rounded-lg bg-[#0F1318] border border-white/10 px-3 py-2 text-sm text-slate-200"
          value={selectedCliente?.dni || ""}
          onChange={(e) => {
            const cliente = clientes.find((c) => c.dni === e.target.value);
            if (cliente) setSelectedCliente(cliente);
          }}
        >
          <option value="">-- Seleccionar --</option>
          {clientes.map((c) => (
            <option key={c.dni} value={c.dni}>
              {c.nombre} - {c.dni}
            </option>
          ))}
        </select>
      </div>

      {/* Bloques de Planes */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-slate-200">
          Seleccionar Membresía
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              onClick={() => setPlanSeleccionado(plan)}
              className={`cursor-pointer p-4 rounded-lg border transition ${
                planSeleccionado.nombre === plan.nombre
                  ? "border-emerald-500 bg-emerald-600/20"
                  : "border-white/10 bg-[#0F1318] hover:bg-[#1F2430]"
              }`}
            >
              <h4 className="text-lg font-semibold text-slate-100">
                {plan.nombre}
              </h4>
              <p className="text-slate-400 text-sm mb-2">{plan.descripcion}</p>
              <p className="text-green-400 font-bold">${plan.precio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario según tab */}
      {modo === "nueva" ? (
        <FormNueva planSeleccionado={planSeleccionado} />
      ) : (
        <FormRenovar planSeleccionado={planSeleccionado} />
      )}
    </div>
  );
}
