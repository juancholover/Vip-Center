import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Asistencia from "./pages/Asistencia/Asistencia";
import Suscripcion from "./pages/Suscripcion/Suscripcion";
import Clientes from "./pages/Clientes/Clientes";

// Reportes
import Reportes from "./pages/Reportes/Reportes"; 
import IngresosReport from "./pages/Reportes/IngresosReport";
import SuscripcionesReport from "./pages/Suscripcion/SuscripcionesReport";
import AsistenciaReport from "./pages/Asistencia/AsistenciaReport";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/asistencia" element={<Asistencia />} />
        <Route path="/suscripcion" element={<Suscripcion />} />
        <Route path="/clientes" element={<Clientes />} />

        {/* Reportes con tabs */}
        <Route path="/reportes" element={<Reportes />}>
          <Route path="ingresos" element={<IngresosReport />} />
          <Route path="suscripciones" element={<SuscripcionesReport />} />
          <Route path="asistencia" element={<AsistenciaReport />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
