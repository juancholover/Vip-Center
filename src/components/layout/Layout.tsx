import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import PasswordChangeAlert from "../ui/PasswordChangeAlert";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F1318] text-white">
      <Topbar />
      
      {/* Alerta flotante para cambio de contraseña obligatorio */}
      <PasswordChangeAlert />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
