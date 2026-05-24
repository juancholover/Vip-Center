import { useState } from "react";
import { toast } from "react-hot-toast";

interface PaymentLinksProps {
  paymentUrl: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string;
  monto: number;
  planNombre: string;
  onClose: () => void;
}

export default function PaymentLinks({
  paymentUrl,
  clienteNombre,
  clienteTelefono,
  clienteEmail,
  monto,
  planNombre,
  onClose,
}: PaymentLinksProps) {
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  // Mensaje personalizado para WhatsApp
  const whatsappMessage = `¡Hola ${clienteNombre}! 👋

Te enviamos el enlace de pago para tu membresía en VIP CENTER FIT:

📋 Plan: ${planNombre}
💰 Monto: S/ ${monto.toFixed(2)}

🔗 Enlace de pago seguro (tarjeta — Mercado Pago):
${paymentUrl}

✅ Este enlace es válido por 24 horas
⏰ Una vez realizado el pago, recibirás tu confirmación inmediatamente

¡Gracias por confiar en nosotros! 💪
VIP CENTER FIT - Tu mejor versión te espera`;

  // Mensaje personalizado para Email
  const emailSubject = `Enlace de Pago - ${planNombre} - VIP CENTER FIT`;
  const emailBody = `Estimado/a ${clienteNombre},

Esperamos que te encuentres muy bien. Te enviamos el enlace de pago para procesar tu membresía:

DETALLES DE TU MEMBRESÍA:
- Plan seleccionado: ${planNombre}
- Monto total: S/ ${monto.toFixed(2)}

ENLACE DE PAGO SEGURO:
${paymentUrl}

INSTRUCCIONES:
1. Haz clic en el enlace de pago
2. Completa la transacción con tarjeta de forma segura
3. Recibirás tu confirmación automáticamente

IMPORTANTE:
- Este enlace es válido por 24 horas
- El pago es procesado de forma 100% segura por MercadoPago
- Una vez completado el pago, podrás acceder inmediatamente a nuestras instalaciones

Si tienes alguna consulta, no dudes en contactarnos.

¡Te esperamos en VIP CENTER FIT!

Saludos cordiales,
Equipo VIP CENTER FIT
`;

  const handleWhatsApp = () => {
    setEnviandoWhatsApp(true);
    try {
      // Crear enlace de WhatsApp con mensaje predefinido
      const whatsappUrl = `https://wa.me/${clienteTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Enlace de WhatsApp abierto');
    } catch {
      toast.error('Error al abrir WhatsApp');
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  const handleEmail = () => {
    setEnviandoEmail(true);
    try {
      // Crear enlace mailto con asunto y cuerpo predefinidos
      const mailtoUrl = `mailto:${clienteEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
      toast.success('Cliente de email abierto');
    } catch {
      toast.error('Error al abrir cliente de email');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleCopyWhatsAppMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      toast.success('Mensaje de WhatsApp copiado');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = whatsappMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Mensaje de WhatsApp copiado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center text-black font-bold text-lg">
              🔗
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Enlace de Pago — Tarjeta</h2>
              <p className="text-sm text-slate-400">Comparte el enlace de Mercado Pago con el cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Cliente Info */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-emerald-400 font-semibold mb-2">Información del Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Cliente:</span>
              <div className="text-white font-medium">{clienteNombre}</div>
            </div>
            <div>
              <span className="text-slate-400">Plan:</span>
              <div className="text-white font-medium">{planNombre}</div>
            </div>
            <div>
              <span className="text-slate-400">Teléfono:</span>
              <div className="text-white font-medium">{clienteTelefono}</div>
            </div>
            <div>
              <span className="text-slate-400">Monto:</span>
              <div className="text-emerald-400 font-bold text-lg">S/ {monto.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Payment URL Display */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-emerald-400 font-semibold mb-2">Enlace de Pago</h3>
          <div className="flex items-center gap-2 p-3 bg-slate-900 rounded border border-white/10">
            <div className="flex-1 text-sm text-slate-300 break-all">
              {paymentUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-medium transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Sharing Options */}
        <div className="space-y-4">
          <h3 className="text-emerald-400 font-semibold">Opciones de Envío</h3>
          
          {/* WhatsApp Option */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 grid place-items-center text-white text-sm">
                  📱
                </div>
                <div>
                  <div className="font-semibold text-white">WhatsApp</div>
                  <div className="text-xs text-slate-400">Enviar mensaje con enlace</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyWhatsAppMessage}
                  className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
                >
                  Copiar Mensaje
                </button>
                <button
                  onClick={handleWhatsApp}
                  disabled={enviandoWhatsApp}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white text-sm rounded font-medium transition-colors"
                >
                  {enviandoWhatsApp ? 'Abriendo...' : 'Enviar WhatsApp'}
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-white/5 max-h-20 overflow-y-auto">
              {whatsappMessage.substring(0, 150)}...
            </div>
          </div>

          {/* Email Option */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 grid place-items-center text-white text-sm">
                  📧
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-xs text-slate-400">Abrir cliente de correo</div>
                </div>
              </div>
              <button
                onClick={handleEmail}
                disabled={enviandoEmail || !clienteEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm rounded font-medium transition-colors"
              >
                {enviandoEmail ? 'Abriendo...' : 'Enviar Email'}
              </button>
            </div>
            <div className="text-xs text-slate-400">
              Para: {clienteEmail || 'No se proporcionó email'}
            </div>
          </div>

          {/* Manual Copy Option */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 grid place-items-center text-white text-sm">
                  📋
                </div>
                <div>
                  <div className="font-semibold text-white">Copiar Enlace</div>
                  <div className="text-xs text-slate-400">Para envío manual</div>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded font-medium transition-colors"
              >
                Copiar URL
              </button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-yellow-500 text-lg">⚠️</div>
            <div className="text-sm">
              <div className="font-semibold text-yellow-500 mb-1">Importante:</div>
              <ul className="text-slate-300 space-y-1 text-xs">
                <li>• El enlace de pago es válido por 24 horas</li>
                <li>• Una vez realizado el pago, el cliente recibirá confirmación automática</li>
                <li>• Solo acepta pago con tarjeta vía Mercado Pago</li>
                <li>• Para Yape/Plin/Efectivo use &quot;Registrar pago manual&quot; en recepción</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}