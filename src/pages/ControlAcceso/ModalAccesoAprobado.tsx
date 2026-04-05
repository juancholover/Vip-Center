import { type VerificarAccesoResponse } from "../../api/accesoApi";
import { CheckCircle, Calendar, Clock, FileText } from "lucide-react";

interface Props {
  visible: boolean;
  cliente: VerificarAccesoResponse;
}

export default function ModalAccesoAprobado({ visible, cliente }: Props) {
  if (!visible || !cliente.cliente) return null;

  const { cliente: clienteData } = cliente;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
        {/* Ícono de éxito */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4 animate-bounce">
            <CheckCircle className="w-24 h-24 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            ACCESO PERMITIDO
          </h2>
          <p className="text-lg text-white/90">BIENVENIDO</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
            {clienteData.foto ? (
              <img
                src={clienteData.foto}
                alt={clienteData.nombreCompleto}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-6xl text-white font-bold">
                {clienteData.nombre.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Nombre del cliente */}
        <h3 className="text-2xl font-semibold text-white text-center mb-6">
          {clienteData.nombreCompleto}
        </h3>

        {/* Información de membresía */}
        {clienteData.membresia && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 space-y-2 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Membresía:</span>
              </span>
              <span className="font-semibold">{clienteData.membresia.tipo}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Vence:</span>
              </span>
              <span className={
                clienteData.membresia.diasRestantes && clienteData.membresia.diasRestantes < 7
                  ? "font-semibold text-yellow-300"
                  : "font-semibold"
              }>
                {clienteData.membresia.fechaVencimiento}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Ingreso:</span>
              </span>
              <span className="font-semibold">
                {new Date().toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Estado:</span>
              </span>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ACTIVO
              </span>
            </div>
          </div>
        )}

        {/* Mensaje de cierre automático */}
        <div className="mt-6 text-center text-white/80 text-sm">
          Se cerrará automáticamente...
        </div>
      </div>
    </div>
  );
}
