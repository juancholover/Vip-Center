import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Layout from "./components/layout/Layout";
import { Toaster } from "react-hot-toast";

// Páginas
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import Asistencia from "./pages/Asistencia/Asistencia";
import Suscripcion from "./pages/Suscripcion/Suscripcion";
import Clientes from "./pages/Clientes/Clientes";

// Reportes
import IngresosReport from "./pages/Reportes/IngresosReport";

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0F1318] text-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400 animate-pulse">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Login libre */}
        <Route path="/login" element={<Login />} />

        {/* Layout protegido */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="reportes/ingresos" element={<IngresosReport />} />
        </Route>

        {/* Redirección global */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#171B22", color: "#fff" },
        }}
      />
    </>
  );
}
