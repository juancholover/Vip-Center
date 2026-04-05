import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Tag } from "lucide-react";
import GestionMembresias from "./GestionMembresias";
import GestionDescuentos from "./GestionDescuentos";

export default function MembresiasMain() {
  const [tabActiva, setTabActiva] = useState<"planes" | "descuentos">("planes");

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Gestión de Membresías</h1>
            <p className="text-xs text-slate-400">Administra planes y descuentos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setTabActiva("planes")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tabActiva === "planes"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Dumbbell className="h-4 w-4 inline mr-1.5" />
          Planes de Membresía
        </button>
        <button
          onClick={() => setTabActiva("descuentos")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            tabActiva === "descuentos"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Tag className="h-4 w-4 inline mr-1.5" />
          Descuentos
        </button>
      </div>

      {/* Contenido según tab */}
      <motion.div
        key={tabActiva}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tabActiva === "planes" && <GestionMembresias />}
        {tabActiva === "descuentos" && <GestionDescuentos />}
      </motion.div>
    </div>
  );
}
