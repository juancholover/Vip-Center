import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

interface YapeQRPaymentProps {
  clienteId: number;
  monto: number;
  planNombre: string;
  planDias: number;
  emailCliente: string;
  membresiaId?: number; // ✅ ID de la membresía
  onClose: () => void;
  onSuccess: (response: { message?: string; [k: string]: unknown }) => void;
}

export default function YapeQRPayment({
  clienteId,
  monto,
  planNombre,
  planDias,
  emailCliente,
  membresiaId,
  onClose,
  onSuccess,
}: YapeQRPaymentProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showQRZoom, setShowQRZoom] = useState(false);

  // Manejo de tecla ESC para cerrar el modal ampliado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQRZoom) {
        setShowQRZoom(false);
      }
    };

    if (showQRZoom) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showQRZoom]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Generar preferencia de pago que incluye QR
      const token = useAuthStore.getState().accessToken;
      const response = await fetch('http://localhost:8080/api/pagos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clienteId,
          planNombre,
          planDias,
          monto,
          emailCliente: emailCliente || "noemail@vipcenter.fit",
          membresiaId, // ✅ Incluir membresía en la solicitud
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar QR de pago');
      }

      const data = await response.json();
      
      if (data.qrCodeBase64) {
        setQrCode(data.qrCodeBase64);
        setPaymentUrl(data.initPoint);
        toast.success('QR generado - ¡Escanea con Yape!');
      } else {
        throw new Error('No se pudo generar el código QR');
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPaymentUrl = async () => {
    if (!paymentUrl) return;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast.success('Enlace de pago copiado');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Enlace de pago copiado');
    }
  };

  const checkPaymentStatus = async () => {
    toast.success('Verificando estado del pago...');
    
    // En una implementación real, harías una llamada al backend para verificar
    // el estado del pago usando el preferenceId
    
    // Simulación de pago exitoso para pruebas
    setTimeout(() => {
      onSuccess({
        message: 'Pago verificado exitosamente',
        status: 'approved',
        amount: monto,
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center text-white font-bold text-lg">
              📱
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pago con Yape</h2>
              <p className="text-sm text-slate-400">Escanea el QR con tu app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Payment Info */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">S/ {monto.toFixed(2)}</div>
            <div className="text-sm text-slate-300">{planNombre}</div>
            <div className="text-xs text-slate-500">{planDias} días</div>
          </div>
        </div>

        {/* QR Code Section */}
        {!qrCode ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-3xl">📲</div>
            </div>
            <p className="text-slate-300 mb-4">Genera el código QR para pagar con Yape</p>
            <button
              onClick={generateQRCode}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Generando...' : '🔥 Generar QR de Yape'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            {/* QR Display */}
            <div className="bg-white p-6 rounded-2xl mb-4 mx-auto w-fit relative group shadow-xl border-4 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code para pago Yape"
                className="w-48 h-48 mx-auto cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => setShowQRZoom(true)}
              />
              {/* Overlay con icono de zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                   onClick={() => setShowQRZoom(true)}>
                <div className="bg-white/95 rounded-full p-3 text-2xl shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  🔍
                </div>
              </div>
              
              {/* Esquinas decorativas */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-purple-500 rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-purple-500 rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-purple-500 rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-purple-500 rounded-br-lg"></div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-4 border border-purple-500/20">
              <p className="text-sm text-purple-300 mb-2 flex items-center justify-center gap-2">
                🔍 <strong>Haz clic en el QR para ampliarlo</strong>
              </p>
              <p className="text-xs text-slate-400 text-center">
                El QR se hará más grande para facilitar el escaneo
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                <span>🖱️ Click para zoom</span>
                <span>⌨️ ESC para cerrar</span>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
              <div className="text-purple-400 font-semibold mb-2">📱 Instrucciones:</div>
              <ol className="text-sm text-slate-300 space-y-1 text-left list-decimal list-inside">
                <li>Abre tu app <strong>Yape</strong></li>
                <li>Toca <strong>"Escanear QR"</strong></li>
                <li>Apunta la cámara al código de arriba</li>
                <li>Confirma el pago en tu app</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={checkPaymentStatus}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                ✅ Verificar Pago
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopyPaymentUrl}
                  className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
                >
                  📋 Copiar Enlace
                </button>
                <button
                  onClick={() => generateQRCode()}
                  className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
                >
                  🔄 Nuevo QR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Payment Option */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 text-center mb-2">
            ¿No tienes Yape instalado?
          </p>
          <button
            onClick={handleCopyPaymentUrl}
            disabled={!paymentUrl}
            className="w-full py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            💳 Usar otros métodos de pago
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de QR Ampliado */}
      {showQRZoom && qrCode && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setShowQRZoom(false)}
        >
          <div className="relative max-w-lg w-full animate-in zoom-in duration-300">
            {/* Botón cerrar mejorado */}
            <button
              onClick={() => setShowQRZoom(false)}
              className="absolute -top-14 right-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white hover:text-gray-300 text-2xl font-bold transition-all duration-200 hover:scale-110"
              title="Cerrar QR ampliado"
            >
              ×
            </button>
            
            {/* QR Ampliado con animación */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-200">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code ampliado para pago Yape"
                className="w-full max-w-sm mx-auto"
                onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic en la imagen
              />
              
              {/* Pulso animado alrededor del QR */}
              <div className="absolute inset-4 border-4 border-purple-500 rounded-3xl animate-pulse opacity-30"></div>
            </div>
            
            {/* Información adicional mejorada */}
            <div className="text-center mt-6">
              <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/20">
                <div className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                  S/ {monto.toFixed(2)}
                </div>
                <div className="text-xl mb-2">{planNombre}</div>
                <div className="text-sm opacity-80 mb-3">{planDias} días de membresía</div>
                <div className="flex items-center justify-center gap-2 text-emerald-300">
                  <span className="animate-pulse">📱</span>
                  <span>Escanea con tu app Yape</span>
                </div>
              </div>
            </div>
            
            {/* Instrucciones mejoradas */}
            <div className="text-center mt-4 space-y-2">
              <p className="text-white/90 text-sm font-medium">
                🎯 Acerca tu cámara al QR code
              </p>
              <p className="text-white/60 text-xs">
                Toca fuera del QR para cerrar · ESC para salir
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}