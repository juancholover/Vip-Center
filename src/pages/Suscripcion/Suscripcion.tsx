import { useState, useEffect } from "react";
import { crearPreferencia } from "../../api/pagosApi";
import { toast } from "react-hot-toast";
import { ClientesApi, Cliente } from "../../api/clientesApi";
import { MembresiasApi, Membresia } from "../../api/membresiasApi";
import { DescuentosApi, Descuento } from "../../api/descuentosApi";
import PaymentLinks from "../../components/PaymentLinks";
import RegistrarPagoManualModal from "../../components/RegistrarPagoManualModal";
import ModalQRSimple from "../../components/ModalQRSimple";
import { CreditCard, Banknote, Search, Smartphone } from "lucide-react";

export default function Suscripcion() {
  const STORAGE_KEY = 'vip_center_form_suscripcion';

  const [tipo, setTipo] = useState<"nueva" | "renovacion">("nueva");
  const [planIndex, setPlanIndex] = useState(0);
  const [descuento, setDescuento] = useState(0);
  
  // Cargar planes desde API
  const [planes, setPlanes] = useState<Membresia[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  // Cargar descuentos desde API
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loadingDescuentos, setLoadingDescuentos] = useState(true);

  // Cargar planes y descuentos al montar el componente
  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        setLoadingPlanes(true);
        const planesActivos = await MembresiasApi.listarActivas();
        setPlanes(planesActivos);
      } catch (err) {
        console.error("Error al cargar planes:", err);
        toast.error("Error al cargar planes de membresía");
        setPlanes([]);
      } finally {
        setLoadingPlanes(false);
      }
    };

    const cargarDescuentos = async () => {
      try {
        setLoadingDescuentos(true);
        const descuentosActivos = await DescuentosApi.listarActivos();
        // Agregar descuento 0% al inicio si no existe
        const tieneDescuentoCero = descuentosActivos.some(d => d.porcentaje === 0);
        if (!tieneDescuentoCero) {
          setDescuentos([
            { id: 0, nombre: "Sin descuento", porcentaje: 0, orden: 0, estado: true },
            ...descuentosActivos
          ]);
        } else {
          setDescuentos(descuentosActivos);
        }
      } catch (err) {
        console.error("Error al cargar descuentos:", err);
        toast.error("Error al cargar descuentos");
        // Fallback a descuentos por defecto
        setDescuentos([
          { id: 0, nombre: "Sin descuento", porcentaje: 0, orden: 0, estado: true },
        ]);
      } finally {
        setLoadingDescuentos(false);
      }
    };

    cargarPlanes();
    cargarDescuentos();
  }, []);

  // ✅ Cargar datos guardados de sessionStorage al iniciar
  const cargarDatosGuardados = () => {
    try {
      const datosGuardados = sessionStorage.getItem(STORAGE_KEY);
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        return datos;
      }
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
    return {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      dni: "",
      clienteIdExistente: "",
    };
  };

  const [form, setForm] = useState(cargarDatosGuardados());

  // ✅ Guardar datos en sessionStorage cada vez que cambian
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (error) {
      console.error("Error al guardar datos:", error);
    }
  }, [form]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // ✅ Estado para guardar el ID del cliente creado (evita duplicados)
  const [clienteCreado, setClienteCreado] = useState<{
    id: number;
    nombre: string;
    telefono: string;
    email: string;
  } | null>(null);

  const plan = planes[planIndex] || null;
  const total = plan ? +(plan.precio * (1 - descuento / 100)).toFixed(2) : 0;

  // Función para resetear el formulario
  const resetForm = () => {
    const formVacio = {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      dni: "",
      clienteIdExistente: "",
    };
    setForm(formVacio);
    // ✅ Resetear también el cliente creado
    setClienteCreado(null);
    // ✅ Limpiar sessionStorage
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error al limpiar datos:", error);
    }
  };

  // Validación de teléfono peruano con formato +51 9XX XXX XXX
  const validarTelefono = (telefono: string): { valido: boolean; mensaje: string } => {
    if (!telefono.trim()) return { valido: true, mensaje: "" }; // Opcional
    
    // Formato: +51 9XX XXX XXX (con espacios)
    const formatoCompleto = /^\+51\s9\d{2}\s\d{3}\s\d{3}$/;
    if (!formatoCompleto.test(telefono)) {
      return { valido: false, mensaje: "Formato requerido: +51 9XX XXX XXX" };
    }
    return { valido: true, mensaje: "" };
  };

  // Función para formatear teléfono automáticamente
  const formatearTelefono = (valor: string): string => {
    // Remover todo excepto dígitos y el símbolo +
    let limpio = valor.replace(/[^\d+]/g, '');
    
    // Si no empieza con +51, agregarlo
    if (!limpio.startsWith('+51')) {
      // Si empieza con 51, agregar +
      if (limpio.startsWith('51')) {
        limpio = '+' + limpio;
      }
      // Si empieza con 9, agregar +51
      else if (limpio.startsWith('9')) {
        limpio = '+51' + limpio;
      }
      // Si está vacío o no válido, agregar +51
      else if (!limpio.startsWith('+')) {
        limpio = '+51' + limpio;
      }
    }
    
    // Extraer solo los dígitos después del +51
    const digitos = limpio.substring(3);
    
    // Formatear: +51 9XX XXX XXX
    if (digitos.length === 0) {
      return '+51 ';
    } else if (digitos.length <= 3) {
      return `+51 ${digitos}`;
    } else if (digitos.length <= 6) {
      return `+51 ${digitos.substring(0, 3)} ${digitos.substring(3)}`;
    } else {
      return `+51 ${digitos.substring(0, 3)} ${digitos.substring(3, 6)} ${digitos.substring(6, 9)}`;
    }
  };

  // Función para extraer solo los 9 dígitos del teléfono
  const extraerDigitosTelefono = (telefonoFormateado: string): string => {
    // Remover +51 y espacios, dejar solo los 9 dígitos
    return telefonoFormateado.replace(/^\+51\s/, '').replace(/\s/g, '');
  };

  // Estados para mostrar mensajes de validación
  const [validationErrors, setValidationErrors] = useState<{
    telefono: string;
  }>({
    telefono: "",
  });

  // Estados para el modal de enlaces de pago
  const [showPaymentLinks, setShowPaymentLinks] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    url: string;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
  } | null>(null);

  const [showRegistrarManual, setShowRegistrarManual] = useState(false);
  const [manualPagoData, setManualPagoData] = useState<{
    clienteId: number;
  } | null>(null);

  // Estados para el modal de QR de acceso exitoso
  const [showModalQRExito, setShowModalQRExito] = useState(false);
  const [datosQRExito, setDatosQRExito] = useState<{
    cliente: {
      nombre: string;
      apellido: string;
    };
    qrToken: string;
    preferenceId?: string;
  } | null>(null);

  // Funciones para el modal de búsqueda de clientes
  const buscarClientes = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      toast.error("Ingrese al menos 3 caracteres para buscar");
      return;
    }

    try {
      setSearchLoading(true);
      const resultados = await ClientesApi.buscar(searchQuery.trim());
      setSearchResults(resultados);

      if (resultados.length === 0) {
        toast("No se encontraron clientes", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      toast.error("Error al buscar clientes");
    } finally {
      setSearchLoading(false);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    const telefonoFormateado = cliente.telefono ? formatearTelefono(cliente.telefono) : '';
    setForm({
      ...form,
      clienteIdExistente: String(cliente.id),
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      email: cliente.email || '',
      telefono: telefonoFormateado,
    });
    // Limpiar búsqueda
    setSearchQuery("");
    setSearchResults([]);
    toast.success(`Cliente seleccionado: ${cliente.nombre} ${cliente.apellido}`);
  };

  const resolverClienteParaPago = async (): Promise<{
    clienteId: number;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
  } | null> => {
    let clienteId: number;
    let clienteNombre = '';
    let clienteTelefono = '';
    let clienteEmail = '';

    if (tipo === "nueva") {
        // ✅ Si ya se creó un cliente en esta sesión, reutilizarlo
        if (clienteCreado) {
          clienteId = clienteCreado.id;
          clienteNombre = clienteCreado.nombre;
          clienteTelefono = clienteCreado.telefono;
          clienteEmail = clienteCreado.email;
        } else {
          // Validar campos obligatorios
          if (!form.nombre.trim() || !form.apellido.trim() || !form.telefono.trim()) {
            toast.error("Complete los campos obligatorios: Nombre, Apellido y Teléfono");
            return null;
          }

          const validacionTelefono = validarTelefono(form.telefono);
          if (!validacionTelefono.valido) {
            toast.error(validacionTelefono.mensaje);
            return null;
          }

          const telefonoLimpio = extraerDigitosTelefono(form.telefono);
          const nuevo = await ClientesApi.crear({
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            telefono: telefonoLimpio,
            email: form.email.trim(),
            dni: form.dni?.trim(),
          });
          clienteId = nuevo.id;
          clienteNombre = `${form.nombre.trim()} ${form.apellido.trim()}`;
          clienteTelefono = telefonoLimpio;
          clienteEmail = form.email.trim();
          setClienteCreado({
            id: clienteId,
            nombre: clienteNombre,
            telefono: clienteTelefono,
            email: clienteEmail,
          });
        }
    } else {
      if (!form.clienteIdExistente) {
        toast.error("Ingresa el ID del cliente existente");
        return null;
      }
      clienteId = Number(form.clienteIdExistente);
      clienteNombre = `${form.nombre.trim()} ${form.apellido.trim()}`;
      clienteTelefono = form.telefono.includes("+51")
        ? extraerDigitosTelefono(form.telefono)
        : form.telefono.trim();
      clienteEmail = form.email.trim();
    }

    return { clienteId, clienteNombre, clienteTelefono, clienteEmail };
  };

  const handleGeneratePaymentLink = async () => {
    if (!plan) {
      toast.error("Selecciona un plan");
      return;
    }
    try {
      const cliente = await resolverClienteParaPago();
      if (!cliente) return;

      const response = await crearPreferencia({
        clienteId: cliente.clienteId,
        planNombre: plan.nombre,
        planDias: plan.duracionDias,
        monto: total,
        emailCliente: cliente.clienteEmail || "noemail@vipcenter.fit",
        membresiaId: plan.id,
      });

      setPaymentData({
        url: response.initPoint,
        clienteNombre: cliente.clienteNombre,
        clienteTelefono: cliente.clienteTelefono,
        clienteEmail: cliente.clienteEmail,
      });
      setShowPaymentLinks(true);
      toast.success("Enlace de pago con tarjeta generado");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Error al generar enlace de pago");
    }
  };

  const handleOpenRegistrarManual = async () => {
    if (!plan) {
      toast.error("Selecciona un plan");
      return;
    }
    try {
      const cliente = await resolverClienteParaPago();
      if (!cliente) return;
      setManualPagoData({ clienteId: cliente.clienteId });
      setShowRegistrarManual(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Error al preparar registro de pago");
    }
  };

  const handlePagoSuccess = async (response: { message?: string; clienteId?: number; preferenceId?: string }) => {
    setShowRegistrarManual(false);
    setManualPagoData(null);

    // Obtener QR del cliente y mostrar modal de éxito
    if (response.clienteId) {
      try {
        // Obtener el cliente completo para obtener su qr_acceso
        const cliente = await ClientesApi.obtener(response.clienteId as number);
        
        if (cliente.qrAcceso) {
          setDatosQRExito({
            cliente: {
              nombre: form.nombre,
              apellido: form.apellido,
            },
            qrToken: cliente.qrAcceso,
            preferenceId: response.preferenceId,
          });
          setShowModalQRExito(true);
        } else {
          toast.error('Pago exitoso pero el cliente no tiene QR de acceso. Consulta en recepción.');
        }
      } catch (error) {
        console.error('Error al obtener datos del cliente:', error);
        toast.error('Pago exitoso pero no se pudo obtener el QR. Consulta en recepción.');
      }
    }

    // Limpiar formulario
    resetForm();
  };

  return (
    <>
    <div className="p-6 text-white">
      {/* Header */}


      {/* Tipo */}
      <div className="grid md:grid-cols-2 gap-3 mb-6 bg-[#1A1F25] p-3 rounded-xl border border-white/10">
        {([
            { id: "nueva", label: "Nueva Suscripción", desc: "Cliente nuevo", emoji: "✨" },
            { id: "renovacion", label: "Renovar Suscripción", desc: "Cliente existente", emoji: "🔄"},
          ] as { id: 'nueva'|'renovacion'; label: string; desc: string; emoji: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${tipo === t.id
              ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_18px_rgba(34,197,94,.35)]"
              : "border-white/10 hover:border-emerald-400/60"}`}
          >
            <div className="text-xl">{t.emoji}</div>
            <div className="font-semibold text-sm">{t.label}</div>
            <div className="text-xs text-slate-400">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Datos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">
              {tipo === "nueva" ? "Datos del Cliente" : "Buscar Cliente"}
            </h3>
            {tipo === "nueva" && (
              <div className="text-xs text-slate-500">
                {(() => {
                  const camposCompletos = [
                    form.nombre.trim(),
                    form.apellido.trim(),
                    form.telefono.trim() || form.esExtranjero,
                  ].filter(Boolean).length;
                  const totalObligatorios = 3;
                  const porcentaje = Math.round((camposCompletos / totalObligatorios) * 100);
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span>{porcentaje}%</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="border-b border-emerald-400/40 mb-4"></div>

          {tipo === "nueva" ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                  <span>Complete los datos y <strong>genere el link de pago</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                  <span><strong>Yape/Plin/Efectivo:</strong> pago en recepción con QR del gimnasio</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                  <span>El sistema genera su QR automáticamente después del pago</span>
                </div>
              </div>

              {/* Nombre y apellido */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre *" value={form.nombre} onChange={(v)=>setForm({...form, nombre:v})}/>
                <Input label="Apellido *" value={form.apellido} onChange={(v)=>setForm({...form, apellido:v})}/>
              </div>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input 
                    label="Teléfono *" 
                    value={form.telefono} 
                    onChange={(v) => {
                      // Formatear automáticamente el teléfono
                      const telefonoFormateado = formatearTelefono(v);
                      setForm({...form, telefono: telefonoFormateado});
                      const validacion = validarTelefono(telefonoFormateado);
                      setValidationErrors(prev => ({...prev, telefono: validacion.mensaje}));
                    }}
                    placeholder="+51 927 073 965"
                  />
                  {validationErrors.telefono && (
                    <p className="text-red-400 text-xs mt-1">⚠️ {validationErrors.telefono}</p>
                  )}
                  {form.telefono.length > 0 && !validationErrors.telefono && form.telefono !== '+51 ' && (
                    <p className="text-emerald-400 text-xs mt-1">✓ Formato correcto</p>
                  )}
                </div>
              </div>

              {/* DNI y Email */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="DNI (Opcional)" value={form.dni || ''} onChange={(v)=>setForm({...form, dni:v})} placeholder="Ej. 74581236" />
                <Input label="Email" value={form.email} onChange={(v)=>setForm({...form, email:v})}/>
              </div>

              <div className="text-xs text-slate-500 border-t border-white/10 pt-2">
                * Campos obligatorios
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Cliente seleccionado */}
              {clienteSeleccionado ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                        {clienteSeleccionado.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400 font-medium">Cliente seleccionado:</p>
                        <h3 className="text-lg font-semibold text-white">
                          {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                        </h3>
                        {clienteSeleccionado.telefono && (
                          <p className="text-sm text-gray-300 flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> {clienteSeleccionado.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setClienteSeleccionado(null);
                        setSearchQuery("");
                        setSearchResults([]);
                        setForm({
                          ...form,
                          clienteIdExistente: "",
                          nombre: "",
                          apellido: "",
                          email: "",
                          telefono: "",
                        });
                      }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-red-500/50"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Buscador inline */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-2">
                      Buscar Cliente por Nombre o Teléfono
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            buscarClientes();
                          }
                        }}
                        placeholder="Escribe al menos 3 caracteres..."
                        className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
                        autoFocus
                      />
                      <button
                        onClick={buscarClientes}
                        disabled={searchLoading || searchQuery.trim().length < 3}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        {searchLoading ? "Buscando..." : <><Search className="w-4 h-4" /> Buscar</>}
                      </button>
                    </div>
                    {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                      <p className="text-amber-400 text-xs mt-2">
                        Escribe al menos 3 caracteres para buscar
                      </p>
                    )}
                  </div>

                  {/* Resultados de búsqueda */}
                  {searchResults.length > 0 && (
                    <div>
                      <p className="text-gray-300 mb-3 text-sm flex items-center gap-2">
                        <Search className="w-4 h-4" /> {searchResults.length} cliente(s) encontrado(s):
                      </p>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {searchResults.map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => seleccionarCliente(cliente)}
                            className="bg-[#0f172a] rounded-lg p-3 hover:bg-[#1e293b] transition cursor-pointer border border-gray-700 hover:border-purple-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                  {cliente.nombre.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold text-sm">
                                    {cliente.nombre} {cliente.apellido}
                                  </h4>
                                  {cliente.telefono && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Smartphone className="w-3 h-3" /> {cliente.telefono}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        cliente.estado === "activo"
                                          ? "bg-green-500/20 text-green-300"
                                          : cliente.estado === "vencido"
                                          ? "bg-red-500/20 text-red-300"
                                          : "bg-gray-500/20 text-gray-300"
                                      }`}
                                    >
                                      {cliente.estado}
                                    </span>
                                    {cliente.qrActivo && (
                                      <span className="text-emerald-400 text-xs">✓ QR Activo</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seleccionarCliente(cliente);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
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
                  {!searchLoading && searchResults.length === 0 && searchQuery.trim().length >= 3 && (
                    <div className="text-center py-6 text-gray-400 bg-[#0f172a] rounded-lg border border-gray-700">
                      <div className="flex justify-center mb-3">
                        <Search className="w-12 h-12 text-gray-500" />
                      </div>
                      <p className="font-medium">No se encontraron clientes</p>
                      <p className="text-sm mt-1">
                        Intenta con otro término de búsqueda
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="text-xs text-slate-400 border-t border-white/10 pt-2">
                * Busca al cliente por nombre o teléfono para renovar su membresía.
              </div>
            </div>
          )}
        </div>

        {/* Planes + Descuentos + Resumen */}
        <div className="space-y-4">
          <div className="bg-[#1A1F25] p-4 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-xs border-b border-emerald-400/40 pb-2 mb-3">
              Planes de Membresía
            </h3>
            
            {loadingPlanes ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Cargando planes...
              </div>
            ) : planes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No hay planes disponibles
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {planes.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setPlanIndex(idx)}
                    className={`p-3 rounded-lg border-2 text-left relative transition-all ${
                      planIndex === idx ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:border-emerald-400/60"
                    }`}
                    style={{
                      borderColor: planIndex === idx && p.color ? p.color : undefined
                    }}
                  >
                    <div className="font-bold uppercase text-sm">{p.nombre}</div>
                    <div className="text-xs text-slate-400">{p.duracionDias} días</div>
                    <div className="mt-2 text-xl font-extrabold text-emerald-400">
                      S/ {p.precio.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1A1F25] p-4 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-xs border-b border-emerald-400/40 pb-2 mb-3">
              Descuento adicional
            </h3>
            {loadingDescuentos ? (
              <div className="text-center text-slate-400 py-3 text-sm">Cargando descuentos...</div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {descuentos.map(desc => (
                  <button key={desc.id}
                    onClick={()=>setDescuento(desc.porcentaje)}
                    className={`py-2 rounded-lg border-2 ${descuento===desc.porcentaje? "border-emerald-400 bg-emerald-400/10":"border-white/10 hover:border-emerald-400/60"}`}
                  >
                    <div className="text-base font-bold">{desc.porcentaje}%</div>
                    <div className="text-[10px] text-slate-400">{desc.porcentaje===0?"Sin desc.": "Aplicado"}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1A1F25] p-4 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-xs border-b border-emerald-400/40 pb-2 mb-2">
              Resumen
            </h3>
            <div className="space-y-1.5 text-sm">
              {plan && (
                <>
                  <ResumenRow label="Plan" value={`${plan.nombre} (${plan.duracionDias} días)`}/>
                  <ResumenRow label="Precio base" value={`S/ ${plan.precio.toFixed(2)}`}/>
                  <ResumenRow label="Descuento" value={`-${(plan.precio * (descuento/100)).toFixed(2)}`}/>
                  <div className="border-t border-emerald-400/40 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold text-sm">TOTAL</span>
                    <span className="text-xl font-extrabold text-emerald-400">S/ {total.toFixed(2)}</span>
                  </div>
                </>
              )}
              {!plan && (
                <div className="text-center text-slate-400 py-3 text-sm">
                  Selecciona un plan
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={handleOpenRegistrarManual}
                disabled={!plan}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Banknote className="w-5 h-5" />
                Registrar pago manual (Yape / Plin / Efectivo)
              </button>
              <button
                onClick={handleGeneratePaymentLink}
                disabled={!plan}
                className="w-full py-3 rounded-lg border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                Generar enlace de pago (Tarjeta — Mercado Pago)
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400 text-center">
              El enlace de tarjeta se puede enviar por WhatsApp o email
            </p>
          </div>
        </div>
      </div>
    </div>

    {showPaymentLinks && paymentData && plan && (
      <PaymentLinks
        paymentUrl={paymentData.url}
        clienteNombre={paymentData.clienteNombre}
        clienteTelefono={paymentData.clienteTelefono}
        clienteEmail={paymentData.clienteEmail}
        monto={total}
        planNombre={plan.nombre}
        onClose={() => {
          setShowPaymentLinks(false);
          setPaymentData(null);
        }}
      />
    )}
    
    {showRegistrarManual && manualPagoData && plan && (
      <RegistrarPagoManualModal
        clienteId={manualPagoData.clienteId}
        monto={total}
        planNombre={plan.nombre}
        planDias={plan.duracionDias}
        membresiaId={plan.id}
        onClose={() => {
          setShowRegistrarManual(false);
          setManualPagoData(null);
        }}
        onSuccess={handlePagoSuccess}
      />
    )}

    {/* Modal de QR de Acceso Exitoso */}
    {showModalQRExito && datosQRExito && (
      <ModalQRSimple
        visible={showModalQRExito}
        onClose={() => {
          setShowModalQRExito(false);
          setDatosQRExito(null);
        }}
        cliente={datosQRExito.cliente}
        qrToken={datosQRExito.qrToken}
        preferenceId={datosQRExito.preferenceId}
      />
    )}
    </>
  );
}

function Input({label, value, onChange, type = "text", placeholder}:{
  label:string; 
  value:string; 
  onChange:(v:string)=>void; 
  type?: string; 
  placeholder?: string;
}) {
  return (
    <label className="text-xs text-slate-400 block">
      {label}
      <input
        type={type}
        className="mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function ResumenRow({label, value}:{label:string; value:string}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 font-medium">{value}</span>
    </div>
  );
}
