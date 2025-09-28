import { useState } from "react";
import { useClientesStore } from "../../store/useClientesStore";
import ClientesHeader from "./ClientesHeader";
import ClientesCards from "./ClientesCards";
import ClientesCharts from "./ClientesCharts";
import ClientesTable from "./ClientesTable";

export default function Clientes() {
  const { clientes } = useClientesStore();
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className="space-y-6">
      <ClientesHeader setBusqueda={setBusqueda} />
      <ClientesCards clientes={clientes} />
      <ClientesCharts clientes={clientes} />
      <ClientesTable clientes={clientes} filtro={filtro} setFiltro={setFiltro} busqueda={busqueda} />
    </div>
  );
}
