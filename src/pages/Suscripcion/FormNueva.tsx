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
    createSuscripcion(selectedCliente.dni, planSeleccionado.nombre as "Básico" | "Premium" | "Anual");
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bloque izquierdo - Formulario compacto */}
      <div className="space-y-3 bg-[#0F1318] p-4 rounded border border-white/10">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
          📋 Registro de Nuevo Cliente + Primer Pago
        </h2>

        {/* Resumen del plan seleccionado */}
        <div className="bg-[#171B22] p-3 rounded border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-semibold text-sm">
              {planSeleccionado.nombre}
            </h3>
            <span className="text-emerald-400 font-bold text-sm">
              ${planSeleccionado.precio}
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            {planSeleccionado.descripcion}
          </p>
        </div>

        {/* Campo de observaciones */}
        <div>
          <label className="text-slate-400 text-xs block mb-1">
            Observaciones / Notas
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded bg-[#171B22] border border-white/10 px-3 py-1.5 text-sm text-slate-200"
            placeholder="Ej: Descuento estudiante, pago en efectivo..."
          />
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm font-medium w-full transition"
        >
          💳 Registrar Cliente y Generar QR
        </button>

        {/* Indicaciones del flujo */}
        <div className="bg-blue-600/10 border border-blue-600/30 rounded p-3 text-xs text-blue-300 space-y-1">
          <p className="font-semibold">📍 Flujo:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-400">
            <li>Cliente paga con Yape escaneando QR de pasarela</li>
            <li>Sistema confirma pago vía webhook</li>
            <li>Se genera QR único de acceso permanente</li>
            <li>Cliente recibe su QR por WhatsApp/impreso</li>
          </ol>
        </div>
      </div>

      {/* Bloque derecho - Vista previa del recibo */}
      <div>
        {selectedCliente ? (
          <div className="space-y-3">
            <div ref={reciboRef}>
              <Recibo
                cliente={selectedCliente}
                plan={planSeleccionado.nombre}
                precio={planSeleccionado.precio}
                descripcion={descripcion}
              />
            </div>

            {/* Botón de descarga compacto */}
            <button
              onClick={handleDownloadPDF}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition"
            >
              📥 Descargar Recibo PDF
            </button>
          </div>
        ) : (
          <div className="bg-[#0F1318] border border-white/10 rounded p-6 text-center">
            <p className="text-slate-400 text-sm">
              ⚠️ Selecciona un cliente para generar el recibo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
