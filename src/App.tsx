import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Login from "./pages/Auth/Login";
import ChangePassword from "./pages/Auth/ChangePassword";
import Home from "./pages/Home";
import AsistenciaModule from "./pages/Asistencia/Asistencia";
import CheckIn from "./pages/Asistencia/CheckIn";
import Suscripcion from "./pages/Suscripcion/Suscripcion";
import Clientes from "./pages/Clientes/Clientes";
import Empleados from "./pages/Empleados/Empleados";
import Perfil from "./pages/Empleados/Perfil";
import MiHistorial from "./pages/Empleados/MiHistorial";
import Reportes from "./pages/Reportes/Reportes";
import IngresosReport from "./pages/Reportes/IngresosReport";
import GestionMembresias from "./pages/Membresias/GestionMembresias";
import NotificacionesConfig from "./pages/Configuracion/NotificacionesConfig";
import { ProtectedRoute } from "./ProtectedRoute";
import { Notification } from "./components/Notification";

export default function App() {
  return (
    <>
      <Routes>
        {/* 🔓 Público */}
        <Route path="/login" element={<Login />} />
        
        {/* 🔓 Check-in de asistencia (público para clientes) */}
        <Route path="/asistencia/check-in" element={<CheckIn />} />

        {/* 🔐 Cambiar contraseña */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* 🧱 Layout principal (todas las rutas protegidas) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="asistencia" element={<AsistenciaModule />} />
          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="mi-historial" element={<MiHistorial />} />

          <Route
            path="empleados"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <Empleados />
              </ProtectedRoute>
            }
          />
          <Route
            path="membresias"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <GestionMembresias />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_RECEPCIONISTA"]}>
                <Reportes />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes/ingresos"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <IngresosReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="configuracion/notificaciones"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <NotificacionesConfig />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ Notificación animada global */}
      <Notification />

      {/* 🔔 Toast global existente */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171B22",
            color: "#fff",
            border: "1px solid #22C55E33",
            fontSize: "0.9rem",
          },
        }}
      />
    </>
  );
}
