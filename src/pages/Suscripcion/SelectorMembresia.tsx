interface Props {
  plan: string | null;
  setPlan: (p: string) => void;
  setPrecio: (n: number) => void;
}

export default function SelectorMembresia({ plan, setPlan, setPrecio }: Props) {
  const planes = [
    { titulo: "Básico", precio: 50, beneficios: ["Acceso ilimitado a gimnasio"] },
    { titulo: "Premium", precio: 120, beneficios: ["Clases + Entrenador personal"] },
    { titulo: "Anual", precio: 200, beneficios: ["Descuento 15% + Acceso total"] },
  ];

  return (
    <div className="bg-[#0F1318] border border-white/10 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Seleccionar Membresía</h3>
      <div className="flex flex-col gap-2">
        {planes.map((p) => (
          <button
            key={p.titulo}
            onClick={() => {
              setPlan(p.titulo);
              setPrecio(p.precio);
            }}
            className={`px-3 py-2 rounded-lg text-sm text-left ${
              plan === p.titulo
                ? "bg-emerald-600 text-white"
                : "bg-[#1F2430] text-slate-300 hover:bg-[#2a2f3c]"
            }`}
          >
            <b>{p.titulo}</b> - ${p.precio}
          </button>
        ))}
      </div>
    </div>
  );
}
