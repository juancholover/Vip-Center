import { Cliente } from "../../api/clientesApi";
import { Search, Calendar, Phone, X, User } from "lucide-react";

interface Props {
  visible: boolean;
  onClose: () => void;
  terminoBusqueda: string;
  setTerminoBusqueda: (valor: string) => void;
  onBuscar: () => void;
  resultados: Cliente[];
  buscando: boolean;
  onSeleccionar: (cliente: Cliente) => void;
  clienteSeleccionado: Cliente | null;
  onCancelarSeleccion: () => void;
}

export default function ModalBusquedaCliente({
  visible,
  onClose,
  terminoBusqueda,
  setTerminoBusqueda,
  onBuscar,
  resultados,
  buscando,
  onSeleccionar,
  clienteSeleccionado,
  onCancelarSeleccion,
}: Props) {
  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminoBusqueda.trim().length >= 3) {
      onBuscar();
    }
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case "activo":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "vencido":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      case "inactivo":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#1e293b] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6" /> Búsqueda de Cliente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Cliente seleccionado */}
        {clienteSeleccionado && (
          <div className="mb-6 bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                  {clienteSeleccionado.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Cliente seleccionado:</p>
                  <h3 className="text-lg font-semibold text-white">
                    {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                  </h3>
                  {clienteSeleccionado.telefono && (
                    <p className="text-sm text-gray-300 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {clienteSeleccionado.telefono}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onCancelarSeleccion}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-red-500/50"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario de búsqueda */}
        {!clienteSeleccionado && (
          <>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  placeholder="Ingrese nombre o teléfono del cliente (mín. 3 caracteres)"
                  className="flex-1 px-4 py-3 bg-[#0f172a] text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={buscando || terminoBusqueda.trim().length < 3}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {buscando ? "Buscando..." : <><Search className="w-4 h-4" /> Buscar</>}
                </button>
              </div>
              {terminoBusqueda.trim().length > 0 && terminoBusqueda.trim().length < 3 && (
                <p className="text-amber-400 text-sm mt-2">
                  Escribe al menos 3 caracteres para buscar
                </p>
              )}
            </form>

            {/* Resultados */}
            {resultados.length > 0 && (
              <div>
                <p className="text-gray-300 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> {resultados.length} cliente(s) encontrado(s):
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {resultados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="bg-[#0f172a] rounded-xl p-4 hover:bg-[#1e293b] transition cursor-pointer border border-gray-700 hover:border-purple-500"
                      onClick={() => onSeleccionar(cliente)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Nombre */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                              {cliente.nombre.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {cliente.nombre} {cliente.apellido}
                              </h3>
                              {cliente.telefono && (
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {cliente.telefono}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Membresía */}
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Estado:
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold border ${getEstadoColor(
                                cliente.estado
                              )}`}
                            >
                              {cliente.estado || "Sin información"}
                            </span>
                            {cliente.qrActivo && (
                              <span className="text-emerald-400 text-xs">✓ QR Activo</span>
                            )}
                          </div>
                        </div>

                        {/* Botón de selección */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeleccionar(cliente);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                        >
                          Seleccionar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sin resultados */}
            {!buscando && resultados.length === 0 && terminoBusqueda.trim().length >= 3 && (
              <div className="text-center py-8 text-gray-400">
                <div className="flex justify-center mb-4">
                  <Search className="w-16 h-16 text-gray-500" />
                </div>
                <p>No se encontraron clientes</p>
                <p className="text-sm mt-2">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            )}
          </>
        )}

        {/* Botón cerrar */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
