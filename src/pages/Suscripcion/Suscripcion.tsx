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
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Gestión de Suscripciones</h1>
        
        {/* Tabs minimalistas */}
        <div className="flex gap-1 bg-[#0F1318] rounded p-1">
          <button
            onClick={() => setModo("nueva")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              modo === "nueva"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Nuevo Cliente
          </button>
          <button
            onClick={() => setModo("renovar")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              modo === "renovar"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Renovar Membresía
          </button>
        </div>
      </div>

      {/* Selector de Cliente - Solo visible en modo renovar */}
      {modo === "renovar" && (
        <div className="bg-[#0F1318] border border-white/10 rounded p-3">
          <label className="text-slate-400 text-xs block mb-1.5">
            Buscar Cliente
          </label>
          <select
            className="w-full rounded bg-[#171B22] border border-white/10 px-3 py-1.5 text-sm text-slate-200"
            value={selectedCliente?.dni || ""}
            onChange={(e) => {
              const cliente = clientes.find((c) => c.dni === e.target.value);
              if (cliente) setSelectedCliente(cliente);
            }}
          >
            <option value="">-- Seleccionar cliente existente --</option>
            {clientes.map((c) => (
              <option key={c.dni} value={c.dni}>
                {c.nombre} - DNI: {c.dni} • Estado: {c.estado}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Planes de Membresía - Grid compacto */}
      <div className="bg-[#0F1318] border border-white/10 rounded p-4">
        <h3 className="text-sm font-semibold mb-3 text-white">
          Seleccionar Membresía
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {planes.map((plan) => (
            <button
              key={plan.nombre}
              onClick={() => setPlanSeleccionado(plan)}
              className={`text-left p-3 rounded border transition ${
                planSeleccionado.nombre === plan.nombre
                  ? "border-emerald-500 bg-emerald-600/10"
                  : "border-white/10 hover:border-emerald-500/50 hover:bg-[#171B22]"
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <h4 className="text-sm font-semibold text-white">
                  {plan.nombre}
                </h4>
                <span className="text-emerald-400 font-bold text-sm">
                  ${plan.precio}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {plan.descripcion}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario según modo */}
      {modo === "nueva" ? (
        <FormNueva planSeleccionado={planSeleccionado} />
      ) : (
        <FormRenovar planSeleccionado={planSeleccionado} />
      )}
    </div>
  );
}
