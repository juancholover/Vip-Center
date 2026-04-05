import { useState } from "react";

interface RangeTabsProps {
  onChange: (range: "dia" | "semana" | "mes" | "anio") => void;
  defaultValue?: "dia" | "semana" | "mes" | "anio";
}

export default function RangeTabs({ onChange, defaultValue = "mes" }: RangeTabsProps) {
  const [active, setActive] = useState<"dia" | "semana" | "mes" | "anio">(defaultValue);

  const tabs: { label: string; value: "dia" | "semana" | "mes" | "anio" }[] = [
    { label: "Día", value: "dia" },
    { label: "Semana", value: "semana" },
    { label: "Mes", value: "mes" },
    { label: "Año", value: "anio" },
  ];

  const handleClick = (v: typeof active) => {
    setActive(v);
    onChange(v);
  };

  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => handleClick(t.value)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            active === t.value
              ? "bg-emerald-600 text-white"
              : "bg-[#0F1318] text-slate-300 hover:bg-[#1F2430]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
