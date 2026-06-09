import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import PasswordChangeAlert from "../ui/PasswordChangeAlert";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#0F1318] text-white">
      <Sidebar />

      {/* Contenido principal — offset por el ancho del sidebar */}
      <div className="flex-1 lg:ml-56 transition-all duration-300">
        {/* Alerta flotante para cambio de contraseña obligatorio */}
        <PasswordChangeAlert />

        <main className="min-h-screen overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
