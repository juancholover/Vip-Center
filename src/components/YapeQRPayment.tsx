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
    setLoading(true);
    const loadingToast = toast.loading('Verificando estado del pago...');
    
    try {
      const token = useAuthStore.getState().accessToken;
      
      // Llamar al backend para verificar el pago manualmente
      const response = await fetch(`http://localhost:8080/api/pagos/${clienteId}/verificar-pago-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          membresiaId,
          planDias,
          monto,
          planNombre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al verificar el pago');
      }

      const data = await response.json();
      
      toast.dismiss(loadingToast);
      toast.success('✅ Pago verificado - Membresía asignada exitosamente');
      
      // Llamar al callback de éxito
      onSuccess({
        message: data.message || 'Pago verificado exitosamente',
        status: data.status,
        clienteId,
        qrAcceso: data.qrCodeBase64,
      });

    } catch (error) {
      toast.dismiss(loadingToast);
      const msg = error instanceof Error ? error.message : 'Error al verificar el pago';
      toast.error(msg);
      console.error('Error al verificar pago:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-8 w-full max-w-5xl">
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
          <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Información */}
            <div className="space-y-4">
              {/* Payment Info */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">
                    S/ {monto.toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold text-slate-200">{planNombre}</div>
                  <div className="text-sm text-slate-400 mt-1">{planDias} días de membresía</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-5">
                <div className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  <span>Instrucciones de Pago:</span>
                </div>
                <ol className="text-sm text-slate-300 space-y-2 text-left list-decimal list-inside">
                  <li>Abre tu app <strong className="text-white">Yape</strong></li>
                  <li>Toca <strong className="text-white">"Escanear QR"</strong></li>
                  <li>Apunta la cámara al código QR</li>
                  <li>Confirma el pago en tu app</li>
                  <li>Luego presiona <strong className="text-emerald-400">"Verificar Pago"</strong></li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={checkPaymentStatus}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span className="text-lg">✅</span>
                  <span>{loading ? 'Verificando...' : 'Verificar Pago'}</span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyPaymentUrl}
                    className="py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📋</span>
                    <span>Copiar Enlace</span>
                  </button>
                  <button
                    onClick={() => generateQRCode()}
                    className="py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Nuevo QR</span>
                  </button>
                </div>
              </div>

              {/* Alternative Payment Option */}
              <div className="pt-4 border-t border-white/10">
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
            </div>

            {/* Columna Derecha: QR Code */}
            <div className="flex flex-col items-center justify-center">
              {/* QR Display */}
              <div className="bg-white p-8 rounded-3xl mb-4 relative group shadow-2xl border-4 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code para pago Yape"
                  className="w-64 h-64 mx-auto cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => setShowQRZoom(true)}
                />
                {/* Overlay con icono de zoom */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                     onClick={() => setShowQRZoom(true)}>
                  <div className="bg-white/95 rounded-full p-4 text-3xl shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    🔍
                  </div>
                </div>
                
                {/* Esquinas decorativas */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-l-4 border-t-4 border-purple-500 rounded-tl-xl"></div>
                <div className="absolute -top-3 -right-3 w-8 h-8 border-r-4 border-t-4 border-purple-500 rounded-tr-xl"></div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 border-l-4 border-b-4 border-purple-500 rounded-bl-xl"></div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-r-4 border-b-4 border-purple-500 rounded-br-xl"></div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20 w-full">
                <p className="text-sm text-purple-300 mb-2 flex items-center justify-center gap-2 font-semibold">
                  🔍 <strong>Haz clic en el QR para ampliarlo</strong>
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span>🖱️ Click para zoom</span>
                  <span>·</span>
                  <span>⌨️ ESC para cerrar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-white/10">
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