import { useState } from "react";
import { motion } from "framer-motion";
import { X, Edit, QrCode as QrCodeIcon } from "lucide-react";
import EstadoBadge from "./EstadoBadge";
import QRCode from "react-qr-code";
import ModalQRSimple from "../../components/ModalQRSimple";
import type { Cliente } from "../../api/clientesApi";

interface ClienteFichaModalProps {
  cliente: Cliente;
  onClose: () => void;
  onEdit: (id: number) => void;
}

export default function ClienteFichaModal({ cliente, onClose, onEdit }: ClienteFichaModalProps) {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
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
            <p className="text-slate-500">Email</p>
            <p className="font-medium">{cliente.email || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Fecha de registro</p>
            <p className="font-medium">
              {cliente.fechaRegistro
                ? new Date(cliente.fechaRegistro).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Fecha de vencimiento</p>
            <p className="font-medium">
              {cliente.fechaVencimiento
                ? (() => {
                    const [year, month, day] = cliente.fechaVencimiento.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                      .toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                  })()
                : "—"}
            </p>
          </div>
        </div>

        {/* 🔹 Membresía Actual */}
        {cliente.membresiaActual ? (
          <div className="mb-4 p-4 rounded-lg border border-slate-700 bg-slate-800/50">
            <p className="text-slate-500 text-sm mb-2">Membresía Actual</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: cliente.membresiaActual.color || "#3B82F6",
                    boxShadow: `0 0 10px ${cliente.membresiaActual.color || "#3B82F6"}50`
                  }}
                ></div>
                <div>
                  <p className="font-semibold text-white">{cliente.membresiaActual.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {cliente.membresiaActual.duracionDias} días
                  </p>
                </div>
              </div>
              {cliente.fechaVencimiento && (() => {
                const [year, month, day] = cliente.fechaVencimiento.split('-');
                const fechaVenc = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                fechaVenc.setHours(23, 59, 59, 999); // Fin del día de vencimiento
                
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0); // Inicio del día actual
                
                const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                const estaProximoAVencer = diasRestantes <= 7 && diasRestantes > 0;
                const yaVencio = diasRestantes < 0;

                return (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Vence el</p>
                    <p className={`text-sm font-medium ${
                      yaVencio ? "text-red-400" : 
                      estaProximoAVencer ? "text-yellow-400 animate-pulse" : 
                      "text-emerald-400"
                    }`}>
                      {fechaVenc.toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    {estaProximoAVencer && (
                      <p className="text-xs text-yellow-400 mt-1">
                        ⚠️ Vence en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}
                      </p>
                    )}
                    {yaVencio && (
                      <p className="text-xs text-red-400 mt-1">
                        ❌ Vencida hace {Math.abs(diasRestantes)} {Math.abs(diasRestantes) === 1 ? "día" : "días"}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-lg border border-red-700/50 bg-red-900/20">
            <p className="text-red-400 text-sm font-medium">⚠️ Sin membresía activa</p>
            <p className="text-red-300/70 text-xs mt-1">
              Este cliente no tiene una membresía asignada. El acceso está deshabilitado.
            </p>
          </div>
        )}

        {/* 🔹 Estado y QR */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Estado actual</p>
            <EstadoBadge estado={cliente.estado} />
          </div>

          {cliente.qrAcceso && (
            <div className="text-center">
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowQRModal(true)}
              >
                <QRCode
                  value={cliente.qrAcceso}
                  size={90}
                  bgColor="transparent"
                  fgColor="#22c55e"
                />
                <p className="text-xs text-slate-500 mt-1">Click para ampliar</p>
              </div>
            </div>
          )}
        </div>

        {/*  Botones */}
        <div className="flex justify-end gap-3 mt-6">
          {cliente.qrAcceso && (
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <QrCodeIcon className="w-4 h-4" /> Ver QR Completo
            </button>
          )}
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

    {/* Modal de QR Ampliado */}
    {showQRModal && cliente.qrAcceso && (
      <ModalQRSimple
        visible={true}
        cliente={{
          nombre: cliente.nombre,
          apellido: cliente.apellido,
        }}
        qrToken={cliente.qrAcceso}
        onClose={() => setShowQRModal(false)}
      />
    )}
    </>
  );
}
