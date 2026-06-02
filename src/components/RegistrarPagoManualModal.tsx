import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { registrarPagoManual, MetodoPagoManual } from "../api/pagosApi";

interface Props {
  clienteId: number;
  monto: number;
  planNombre: string;
  planDias: number;
  membresiaId: number;
  onClose: () => void;
  onSuccess: (info: any) => void;
}

export default function RegistrarPagoManualModal({
  clienteId,
  monto,
  planNombre,
  planDias,
  membresiaId,
  onClose,
  onSuccess,
}: Props) {
  const [metodoPago, setMetodoPago] = useState<MetodoPagoManual>("Efectivo");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registrarPagoManual(clienteId, {
        membresiaId,
        planDias,
        monto,
        planNombre,
        metodoPago,
      });
      toast.success(`Pago de S/ ${monto} registrado exitosamente (${metodoPago}).`);
      
      onSuccess({ ...response, clienteId: response.clienteId || clienteId, success: true, method: metodoPago });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#171B22] border border-white/10 rounded-xl p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Registrar Pago Manual</h2>

        <div className="bg-[#0F1318] p-4 rounded-lg border border-white/5 mb-4">
          <p className="text-sm text-slate-400">Plan a suscribir:</p>
          <p className="text-base font-semibold text-emerald-400">{planNombre} ({planDias} días)</p>
          <div className="mt-2 border-t border-white/5 pt-2 flex justify-between">
            <span className="text-slate-400 text-sm">Monto Total:</span>
            <span className="text-white font-bold">S/ {monto}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPagoManual)}
              className="w-full bg-[#0F1318] border border-white/10 rounded-lg p-2.5 text-white"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}