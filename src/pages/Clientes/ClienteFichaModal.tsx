import { motion } from "framer-motion";
import { X, Edit } from "lucide-react";
import EstadoBadge from "./EstadoBadge";
import QRCode from "react-qr-code";
import type { Cliente } from "../../api/clientesApi";

interface ClienteFichaModalProps {
  cliente: Cliente;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export default function ClienteFichaModal({ cliente, onClose, onEdit }: ClienteFichaModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0F1318] border border-white/10 rounded-xl p-6 w-[480px] text-white shadow-lg relative"
      >
        {/* 🔹 Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
              {cliente.nombre.charAt(0)}
              {cliente.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-400">
                {cliente.nombre} {cliente.apellido}
              </h2>
              <p className="text-xs text-slate-400">Ficha del cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🔸 Datos principales */}
        <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-700 pb-4 mb-4">
          <div>
            <p className="text-slate-500">Nombre</p>
            <p className="font-medium">{cliente.nombre}</p>
          </div>
          <div>
            <p className="text-slate-500">Apellido</p>
            <p className="font-medium">{cliente.apellido}</p>
          </div>
          <div>
            <p className="text-slate-500">Teléfono</p>
            <p className="font-medium">{cliente.telefono || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">DNI</p>
            <p className="font-medium">{cliente.dni || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500">Email</p>
            <p className="font-medium">{cliente.email || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Fecha de registro</p>
            <p className="font-medium">
              {cliente.fechaRegistro
                ? new Date(cliente.fechaRegistro).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Fecha de vencimiento</p>
            <p className="font-medium">
              {cliente.fechaVencimiento
                ? new Date(cliente.fechaVencimiento).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* 🔹 Estado y QR */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Estado actual</p>
            <EstadoBadge estado={cliente.estado} />
          </div>

          {cliente.qrAcceso && (
            <div className="text-center">
              <QRCode
                value={cliente.qrAcceso}
                size={90}
                bgColor="transparent"
                fgColor="#22c55e"
              />
              <p className="text-xs text-slate-500 mt-1">QR de acceso</p>
            </div>
          )}
        </div>

        {/* 🔸 Notas */}
        <div className="mt-4">
          <p className="text-slate-500 text-sm mb-1">Notas</p>
          <p className="text-slate-300 text-sm whitespace-pre-line">
            {cliente.notas || "Sin notas registradas"}
          </p>
        </div>

        {/* 🔘 Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onEdit(cliente.id)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Edit className="w-4 h-4" /> Editar
          </button>
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm text-white font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
