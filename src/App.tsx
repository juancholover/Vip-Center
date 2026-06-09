import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Login from "./pages/Auth/Login";
import ChangePassword from "./pages/Auth/ChangePassword";
import Home from "./pages/Home";
import AsistenciaModule from "./pages/Asistencia/Asistencia";
import Suscripcion from "./pages/Suscripcion/Suscripcion";
import Clientes from "./pages/Clientes/Clientes";
import Empleados from "./pages/Empleados/Empleados";
import Perfil from "./pages/Empleados/Perfil";
import ReportesCompleto from "./pages/Reportes/ReportesCompleto";
import MembresiasMain from "./pages/Membresias/MembresiasMain";
import NotificacionesConfig from "./pages/Configuracion/NotificacionesConfig";
import ControlAcceso from "./pages/ControlAcceso";
import Recepcion from "./pages/Recepcion/Recepcion";
import ClientesInactivos from "./pages/Clientes/ClientesInactivos";
import Productos from "./pages/Inventario/Productos";
import VentasSuplementos from "./pages/Inventario/VentasSuplementos";
import Stock from "./pages/Inventario/Stock";
import ReportesSuplementos from "./pages/Inventario/ReportesSuplementos";
import SeleccionModulo from "./pages/SeleccionModulo";
import { ProtectedRoute } from "./ProtectedRoute";
import { Notification } from "./components/Notification";

export default function App() {
  return (
    <>
      <Routes>
        {/* 🔓 Público */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 Selección de módulo */}
        <Route
          path="/seleccion"
          element={
            <ProtectedRoute>
              <SeleccionModulo />
            </ProtectedRoute>
          }
        />

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
          {/* ═══════════════════════════════════════ */}
          {/* BLOQUE A: GESTIÓN (existing routes)     */}
          {/* ═══════════════════════════════════════ */}
          <Route index element={<Home />} />
          <Route path="asistencia" element={<AsistenciaModule />} />
          <Route path="control-acceso" element={<ControlAcceso />} />
          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="perfil" element={<Perfil />} />

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
                <MembresiasMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_RECEPCIONISTA"]}>
                <ReportesCompleto />
              </ProtectedRoute>
            }
          />
          <Route
            path="recepcion"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_RECEPCIONISTA"]}>
                <Recepcion />
              </ProtectedRoute>
            }
          />
          <Route
            path="clientes-inactivos"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <ClientesInactivos />
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

          {/* ═══════════════════════════════════════ */}
          {/* BLOQUE B: INVENTARIO (supplements)       */}
          {/* ═══════════════════════════════════════ */}
          <Route
            path="inventario/productos"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_RECEPCIONISTA"]}>
                <Productos />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventario/ventas"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_RECEPCIONISTA"]}>
                <VentasSuplementos />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventario/stock"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventario/reportes"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <ReportesSuplementos />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ Notificación animada global */}
      <Notification />

      {/* 🔔 Toast minimalista formal */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            style: {
              background: '#F0FDF4',
              color: '#065F46',
              border: '1px solid #10B98120',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#F0FDF4',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #EF444420',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06)',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
          },
          loading: {
            style: {
              background: '#EFF6FF',
              color: '#1E3A8A',
              border: '1px solid #3B82F620',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
            },
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#EFF6FF',
            },
          },
        }}
      />
    </>
  );
}
