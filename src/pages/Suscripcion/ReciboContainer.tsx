import { useRef } from "react";
import { useClientesStore } from "../../store/useClientesStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Recibo from "./Recibo";

interface ReciboContainerProps {
  plan: string;
  precio: number;
  descripcion?: string; // 👈 agregamos la descripción
}

export default function ReciboContainer({ plan, precio, descripcion }: ReciboContainerProps) {
  const { selectedCliente } = useClientesStore();
  const reciboRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reciboRef.current) return;

    const canvas = await html2canvas(reciboRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("recibo.pdf");
  };

  if (!selectedCliente) {
    return (
      <p className="text-slate-400">
        ⚠️ Selecciona un cliente para generar el recibo.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Render del Recibo */}
      <Recibo
        ref={reciboRef}
        cliente={{
          nombre: selectedCliente.nombre,
          dni: selectedCliente.dni,

        }}
        plan={plan}
        precio={precio}
        descripcion={descripcion} // 👈 pasa la descripción
      />

      {/* Botón de descarga */}
      <button
        onClick={handleDownloadPDF}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
      >
        Descargar PDF
      </button>
    </div>
  );
}
