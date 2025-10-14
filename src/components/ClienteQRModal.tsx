import { useState } from "react";
import { X, Download, Share2, Copy, CheckCircle, QrCode, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

interface ClienteQRModalProps {
  clienteId: number;
  clienteNombre: string;
  clienteApellido: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  qrToken: string;
  onClose: () => void;
}

export default function ClienteQRModal({
  clienteId,
  clienteNombre,
  clienteApellido,
  clienteTelefono,
  clienteEmail,
  qrToken,
  onClose,
}: ClienteQRModalProps) {
  const [qrAmpliado, setQrAmpliado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Construir URL de check-in
  const checkInUrl = `${window.location.origin}/asistencia/check-in?token=${qrToken}`;

  // Generar URL del QR usando una API pública
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    checkInUrl
  )}`;

  const qrImageUrlLarge = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(
    checkInUrl
  )}`;

  // Copiar URL al portapapeles
  const copiarUrl = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopiado(true);
      toast.success("URL copiada al portapapeles");
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = checkInUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiado(true);
      toast.success("URL copiada al portapapeles");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Descargar QR como imagen
  const descargarQR = async () => {
    try {
      const response = await fetch(qrImageUrlLarge);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_Asistencia_${clienteNombre}_${clienteApellido}_${clienteId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR descargado exitosamente");
    } catch (err) {
      toast.error("Error al descargar QR");
    }
  };

  // Compartir por WhatsApp
  const compartirWhatsApp = () => {
    const mensaje = `🏋️ *VIP CENTER FIT* 🏋️

¡Hola ${clienteNombre}!

Aquí está tu código QR de asistencia personal 📲

✅ Escanea este código cada vez que llegues al gimnasio para registrar tu asistencia automáticamente.

🔗 *Link directo:*
${checkInUrl}

💡 *Tip:* Guarda este mensaje o toma captura del QR para tenerlo siempre a mano.

¡Nos vemos en el gym! 💪`;

    const telefono = clienteTelefono?.replace(/[^0-9]/g, "") || "";
    const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Enviar por Email
  const enviarEmail = () => {
    const asunto = "Tu QR de Asistencia - VIP CENTER FIT";
    const cuerpo = `Hola ${clienteNombre},

Aquí está tu código QR personal para registrar tu asistencia en VIP CENTER FIT.

Cómo usarlo:
1. Escanea el código QR con la cámara de tu celular
2. Se abrirá una página web automáticamente
3. Tu asistencia quedará registrada al instante

Link directo:
${checkInUrl}

Guarda este email o toma una captura del QR para tenerlo siempre disponible.

¡Te esperamos en el gym!

---
VIP CENTER FIT
Tu gimnasio de confianza 💪`;

    const mailtoUrl = `mailto:${clienteEmail}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1A1F25] rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-[#1A1F25] border-b border-white/10 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
                <QrCode className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">QR de Asistencia</h2>
                <p className="text-slate-400 text-sm">
                  {clienteNombre} {clienteApellido}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 grid place-items-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <img
                src={qrImageUrl}
                alt="QR de Asistencia"
                className="w-full h-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setQrAmpliado(true)}
              />
            </div>

            {/* Info */}
            <div className="bg-[#0F1318] rounded-xl p-4 space-y-2">
              <p className="text-emerald-400 font-medium text-sm">✅ QR Personal de Asistencia</p>
              <p className="text-slate-400 text-xs">
                Este código es único y personal. Escanéalo cada vez que llegues al gimnasio para
                registrar tu asistencia automáticamente.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={descargarQR}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>

              <button
                onClick={copiarUrl}
                className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiado ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar URL
                  </>
                )}
              </button>
            </div>

            {/* Compartir */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-slate-400 text-sm mb-3">Enviar QR al cliente:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={compartirWhatsApp}
                  disabled={!clienteTelefono}
                  className="py-3 px-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  WhatsApp
                </button>

                <button
                  onClick={enviarEmail}
                  disabled={!clienteEmail}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
              {(!clienteTelefono || !clienteEmail) && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  {!clienteTelefono && !clienteEmail
                    ? "Agrega teléfono y email para enviar"
                    : !clienteTelefono
                    ? "Agrega teléfono para enviar por WhatsApp"
                    : "Agrega email para enviar por correo"}
                </p>
              )}
            </div>

            {/* URL del QR (para copiar manualmente) */}
            <div className="bg-[#0F1318] rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-2">URL de check-in:</p>
              <code className="text-emerald-400 text-xs break-all block">{checkInUrl}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de QR ampliado */}
      {qrAmpliado && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setQrAmpliado(false)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setQrAmpliado(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <img
                src={qrImageUrlLarge}
                alt="QR Ampliado"
                className="w-full h-auto"
              />
            </div>
            <p className="text-white text-center mt-4 text-sm">
              Click fuera del QR o presiona ESC para cerrar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
