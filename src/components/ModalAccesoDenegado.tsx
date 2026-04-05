import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { VerificarAccesoResponse } from '../api/accesoApi';

interface ModalAccesoDenegadoProps {
  visible: boolean;
  onClose: () => void;
  cliente: VerificarAccesoResponse | null;
}

const MENSAJES_MOTIVO: Record<string, { titulo: string; descripcion: string }> = {
  MEMBRESIA_VENCIDA: {
    titulo: 'Membresía Vencida',
    descripcion: 'La membresía ha expirado. Por favor renueva para acceder.'
  },
  QR_DESHABILITADO: {
    titulo: 'QR Deshabilitado',
    descripcion: 'El código QR está deshabilitado. Contacta recepción.'
  },
  SIN_MEMBRESIA: {
    titulo: 'Sin Membresía Activa',
    descripcion: 'No tienes una membresía activa. Adquiere una para acceder.'
  },
  CLIENTE_NO_ENCONTRADO: {
    titulo: 'Cliente No Encontrado',
    descripcion: 'El código QR no está registrado en el sistema.'
  },
  QR_INVALIDO: {
    titulo: 'QR Inválido',
    descripcion: 'El código QR escaneado no es válido.'
  }
};

const ModalAccesoDenegado: React.FC<ModalAccesoDenegadoProps> = ({
  visible,
  onClose,
  cliente
}) => {
  // Auto-cerrar después de 5 segundos
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible || !cliente) return null;

  const mensajeInfo = MENSAJES_MOTIVO[cliente.motivo] || {
    titulo: 'Acceso Denegado',
    descripcion: 'No se puede permitir el acceso en este momento.'
  };

  const iniciales = cliente.cliente?.nombre
    ? `${cliente.cliente.nombre.charAt(0)}${cliente.cliente.apellido?.charAt(0) || ''}`
    : '?';

  const mostrarBotonRenovar = 
    cliente.motivo === 'MEMBRESIA_VENCIDA' || 
    cliente.motivo === 'SIN_MEMBRESIA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn animate-shake">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Contenido */}
        <div className="flex flex-col items-center text-white">
          {/* Ícono Error */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-red-100 text-lg font-semibold mb-6">{mensajeInfo.titulo}</p>

          {/* Información del Cliente */}
          {cliente.cliente && (
            <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {iniciales}
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold">{cliente.cliente.nombre}</h3>
                  {cliente.cliente.apellido && (
                    <p className="text-red-100">{cliente.cliente.apellido}</p>
                  )}
                </div>
              </div>

              {/* Info Membresía */}
              {cliente.cliente.membresia && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-100">Membresía:</span>
                    <span className="font-semibold">{cliente.cliente.membresia.tipo}</span>
                  </div>
                  {cliente.cliente.membresia.fechaVencimiento && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Venció:</span>
                      <span className="font-semibold">{cliente.cliente.membresia.fechaVencimiento}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-red-100">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      cliente.cliente.membresia.estado === 'VENCIDA' 
                        ? 'bg-red-900 text-white' 
                        : 'bg-red-800 text-white'
                    }`}>
                      {cliente.cliente.membresia.estado}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <p className="text-center text-red-50 mb-6 text-sm">
            {mensajeInfo.descripcion}
          </p>

          {/* Botones de Acción */}
          <div className="flex gap-3 w-full">
            {mostrarBotonRenovar && (
              <button
                onClick={() => {
                  // Aquí puedes agregar lógica para redirigir a renovación
                  console.log('Redirigir a renovación para cliente:', cliente.cliente?.id);
                  onClose();
                }}
                className="flex-1 bg-white text-red-600 py-3 px-6 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Renovar Ahora
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/30 transition-colors border-2 border-white/30"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Countdown visual */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/50 animate-[shrink_5s_linear]"
            style={{
              animation: 'shrink 5s linear'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ModalAccesoDenegado;
