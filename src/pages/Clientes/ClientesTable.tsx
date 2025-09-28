import { useNavigate } from "react-router-dom";
import { useClientesStore, type Cliente } from "../../store/useClientesStore";

function isVencido(plan: string, fecha: string): boolean {
  const [day, month, year] = fecha.split("/").map((n) => parseInt(n, 10));
  const fechaRegistro = new Date(year, month - 1, day);
  const ahora = new Date();
  if (plan === "Mensual") {
    const vencimiento = new Date(fechaRegistro);
    vencimiento.setMonth(vencimiento.getMonth() + 1);
    return ahora > vencimiento;
  }
  if (plan === "Anual") {
    const vencimiento = new Date(fechaRegistro);
    vencimiento.setFullYear(vencimiento.getFullYear() + 1);
    return ahora > vencimiento;
  }
  return false;
}

interface Props {
  clientes: Cliente[];
  filtro: string;
  setFiltro: (f: string) => void;
  busqueda: string;
}

export default function ClientesTable({ clientes, filtro, setFiltro, busqueda }: Props) {
  const navigate = useNavigate();
  const { setSelectedCliente } = useClientesStore();

  const clientesFiltrados = clientes.filter((c) => {
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni.includes(busqueda);

    if (!coincideBusqueda) return false;
    if (filtro === "Todos") return true;
    if (filtro === "Activos") return c.estado === "Activo" && !isVencido(c.plan, c.fecha);
    if (filtro === "Inactivos") return c.estado === "Inactivo";
    if (filtro === "Vencidos") return isVencido(c.plan, c.fecha);
    return true;
  });

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3">
        {["Todos", "Activos", "Inactivos", "Vencidos"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              filtro === f
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-[#0F1318] text-slate-300 border-white/10 hover:bg-[#1F2430]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#0F1318] mt-3">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="bg-[#171B22] text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Fecha Registro</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Asistencia</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.dni} className="border-t border-white/10 hover:bg-[#1F2430]">
                <td className="px-4 py-3 flex items-center gap-2">
                  <img src={c.foto} alt={c.nombre} className="h-8 w-8 rounded-full object-cover" />
                  <span>{c.nombre}</span>
                </td>
                <td className="px-4 py-3">{c.dni}</td>
                <td className="px-4 py-3">{c.fecha}</td>
                <td className="px-4 py-3">{c.plan}</td>
                <td className="px-4 py-3">
                  {c.estado === "Activo" && !isVencido(c.plan, c.fecha) ? (
                    <span className="text-emerald-400">Activo</span>
                  ) : isVencido(c.plan, c.fecha) ? (
                    <span className="text-blue-400">Vencido</span>
                  ) : (
                    <span className="text-orange-400">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3">{c.asistencia}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelectedCliente(c);
                      navigate("/asistencia");
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
                  >
                    Ver Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
