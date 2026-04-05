import { X, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import { useRef } from "react";

interface ModalQRSimpleProps {
  visible: boolean;
  onClose: () => void;
  cliente: {
    nombre: string;
    apellido: string;
  };
  qrToken: string; // El UUID del cliente (qr_acceso)
}

export default function ModalQRSimple({
  visible,
  onClose,
  cliente,
  qrToken,
}: ModalQRSimpleProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  
  if (!visible) return null;

  const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.trim();

  // Descargar QR como imagen usando el SVG de react-qr-code
  const descargarQR = async () => {
    try {
      if (!qrRef.current) return;
      
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      // Convertir SVG a imagen con FONDO BLANCO Y MARCO
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Tamaño con margen blanco generoso
      const qrSize = 300;
      const margin = 80; // Margen blanco grande
      canvas.width = qrSize + (margin * 2);
      canvas.height = qrSize + (margin * 2);

      img.onload = () => {
        if (ctx) {
          // Fondo blanco completo
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Dibujar QR centrado con margen
          ctx.drawImage(img, margin, margin, qrSize, qrSize);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `QR_${nombreCompleto.replace(/\s+/g, "_")}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success("QR descargado exitosamente");
            }
          });
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Error al descargar QR:", error);
      toast.error("Error al descargar QR");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1F25] rounded-2xl border border-white/10 max-w-3xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold text-xl">Pago Exitoso</h2>
            <p className="text-emerald-100 text-sm mt-1">{nombreCompleto}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/20 grid place-items-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Contenido Horizontal */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* QR Code con fondo blanco y marco */}
            <div className="bg-white p-12 rounded-xl shadow-2xl border-4 border-white flex items-center justify-center" ref={qrRef}>
              <QRCode
                value={qrToken}
                size={300}
                level="L"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            {/* Información y botón */}
            <div className="space-y-4">
              {/* Mensaje */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 font-semibold text-sm mb-2">
                  Código QR de acceso
                </p>
                <p className="text-xs text-emerald-300/80 leading-relaxed">
                  Presenta este código en recepción para ingresar al gimnasio.
                  Puedes descargarlo o tomarlo en captura de pantalla.
                </p>
              </div>

              {/* Botón de descarga */}
              <button
                onClick={descargarQR}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Descargar QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
