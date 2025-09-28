import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="h-screen w-screen bg-[#151A1F] text-slate-100 flex flex-col">
      <Topbar onMenuClick={() => {}} /> {/* si tienes versión móvil, aquí pasas el handler */}
      <div className="h-[calc(100vh-3.5rem)] flex relative">
        <Sidebar isOpen={false} onClose={() => {}} /> {/* idem, si usas sidebar responsive */}
        
        <main className="flex-1 bg-[#171B22] p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // clave distinta en cada ruta
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full rounded-2xl border border-white/5 bg-[#151A1F] p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
