import { useState, useRef } from "react";
import { useClientesStore } from "../../store/useClientesStore";
import Recibo from "./Recibo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FormNuevaProps {
  planSeleccionado: {
    nombre: string;
    precio: number;
    descripcion: string;
  };
}

export default function FormNueva({ planSeleccionado }: FormNuevaProps) {
  const { selectedCliente, createSuscripcion } = useClientesStore();
  const [descripcion, setDescripcion] = useState("");
  const reciboRef = useRef<HTMLDivElement>(null);

  const handleGuardar = () => {
    if (!selectedCliente) return;
    createSuscripcion(selectedCliente.dni, planSeleccionado.nombre as any);
  };

  const handleDownloadPDF = async () => {
    if (!reciboRef.current || !selectedCliente) return;

    const canvas = await html2canvas(reciboRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 20; // márgenes
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // Nombre dinámico
    const fecha = new Date().toISOString().split("T")[0];
    const fileName = `Recibo-${selectedCliente.nombre.replace(/\s+/g, "_")}-${fecha}.pdf`;

    pdf.save(fileName);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bloque izquierdo - Formulario */}
      <div className="space-y-6 bg-[#0F1318] p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">
          Nueva Suscripción
        </h2>

        {/* Info del plan */}
        <div className="bg-[#1F2430] p-4 rounded-lg border border-white/10">
          <h3 className="text-slate-100 font-semibold">
            {planSeleccionado.nombre}
          </h3>
          <p className="text-slate-400 text-sm mb-2">
            {planSeleccionado.descripcion}
          </p>
          <p className="text-green-400 font-bold">
            ${planSeleccionado.precio}
          </p>
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-slate-400 text-sm block mb-1">
            Observaciones / Descripción
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded-lg bg-[#0F1318] border border-white/10 px-3 py-2 text-sm text-slate-200"
            placeholder="Ej. pago en efectivo, incluye promo, etc."
          />
        </div>

        <button
          onClick={handleGuardar}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium w-full"
        >
          Guardar Suscripción
        </button>
      </div>

      {/* Bloque derecho - Recibo */}
      <div>
        {selectedCliente ? (
          <>
            <div ref={reciboRef}>
              <Recibo
                cliente={selectedCliente}
                plan={planSeleccionado.nombre}
                precio={planSeleccionado.precio}
                descripcion={descripcion}
              />
            </div>

            {/* Botón descargar PDF */}
            <div className="mt-4 text-center">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
              >
                Descargar Recibo en PDF
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-400">
            ⚠️ Selecciona un cliente para ver y descargar el recibo.
          </p>
        )}
      </div>
    </div>
  );
}
