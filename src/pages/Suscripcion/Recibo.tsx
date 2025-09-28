import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import logo from "../../assets/logo2.svg"; 

interface ReciboProps {
  cliente: {
    nombre: string;
    dni: string;
  };
  plan: string;
  descripcion?: string;
  precio: number;
}

const Recibo = forwardRef<HTMLDivElement, ReciboProps>(
  ({ cliente, plan, descripcion, precio }, ref) => {
    const fecha = new Date().toLocaleDateString();
    const factura = Math.floor(Math.random() * 999999);

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 rounded-lg shadow-md max-w-2xl mx-auto text-sm"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="h-10 w-10" />
            <div>
              <h2 className="text-lg font-bold">VIP Center Fit</h2>
              <p className="text-xs text-gray-600">Av. Principal 123, Ciudad</p>
              <p className="text-xs text-gray-600">contacto@vipcenterfit.com</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p>Factura Nº: {factura}</p>
            <p>Fecha: {fecha}</p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Cliente</h3>
          <p>
            <b>Nombre:</b> {cliente.nombre}
          </p>
          <p>
            <b>DNI/Teléfono:</b> {cliente.dni}
          </p>
        </div>

        {/* Detalles */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Detalles de Suscripción</h3>
          <ul className="list-disc list-inside text-sm">
            <li>Membresía seleccionada: {plan}</li>
            <li>Acceso ilimitado a gimnasio</li>
            <li>Clases grupales y entrenador personal</li>
          </ul>
        </div>

        {/* Observaciones */}
        {descripcion && (
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Observaciones</h3>
            <p>{descripcion}</p>
          </div>
        )}

        {/* QR */}
        <div className="mb-6 text-center flex flex-col items-center">
            <h3 className="font-semibold mb-2">Escanear para pagar</h3>
        <div className="flex justify-center">
        <QRCodeSVG
             value={`${cliente.nombre}-${plan}-${precio}`}
             size={150}
             fgColor="#000000"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="flex justify-between border-t border-gray-300 pt-3 font-medium">
          <p>Total a pagar</p>
          <p>${precio.toFixed(2)}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>¡Gracias por ser parte de nuestra comunidad!</p>
        </div>
      </div>
    );
  }
);

Recibo.displayName = "Recibo";

export default Recibo;
