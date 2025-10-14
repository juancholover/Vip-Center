import { useState, useRef, useEffect } from "react";
import { crearPreferencia } from "../../api/pagosApi";
import { toast } from "react-hot-toast";
import { ClientesApi, Cliente } from "../../api/clientesApi";
import { MembresiasApi, Membresia } from "../../api/membresiasApi";
import PaymentLinks from "../../components/PaymentLinks";
import YapeQRPayment from "../../components/YapeQRPayment";

export default function Suscripcion() {
  const STORAGE_KEY = 'vip_center_form_suscripcion';

  const [tipo, setTipo] = useState<"nueva" | "renovacion">("nueva");
  const [planIndex, setPlanIndex] = useState(0);
  const [descuento, setDescuento] = useState(0);
  
  // Cargar planes desde API
  const [planes, setPlanes] = useState<Membresia[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  // Cargar planes al montar el componente
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

    cargarPlanes();
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
      fechaNacimiento: "",
      genero: "",
      direccion: "",
      distrito: "",
      telefonoEmergencia: "",
      ocupacion: "",
      comoConocio: "",
      observaciones: "",
      esExtranjero: false,
      paisOrigen: "",
      tipoDocumento: "dni",
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
  const searchTimer = useRef<number | null>(null);

  // ✅ Estado para guardar el ID del cliente creado (evita duplicados)
  const [clienteCreado, setClienteCreado] = useState<{
    id: number;
    nombre: string;
    telefono: string;
    email: string;
  } | null>(null);

  const plan = planes[planIndex] || null;
  const total = plan ? +(plan.precioEfectivo * (1 - descuento / 100)).toFixed(2) : 0;

  // Función para resetear el formulario
  const resetForm = () => {
    const formVacio = {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      dni: "",
      clienteIdExistente: "",
      fechaNacimiento: "",
      genero: "",
      direccion: "",
      distrito: "",
      telefonoEmergencia: "",
      ocupacion: "",
      comoConocio: "",
      observaciones: "",
      esExtranjero: false,
      paisOrigen: "",
      tipoDocumento: "dni",
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

  // Validaciones
  const validarDNI = (dni: string, tipoDoc: string): { valido: boolean; mensaje: string } => {
    if (!dni.trim()) return { valido: true, mensaje: "" }; // Opcional
    
    switch (tipoDoc) {
      case "dni":
        if (!/^\d{8}$/.test(dni)) {
          return { valido: false, mensaje: "DNI debe tener exactamente 8 dígitos" };
        }
        break;
      case "pasaporte":
        if (dni.length < 6 || dni.length > 12) {
          return { valido: false, mensaje: "Pasaporte debe tener entre 6 y 12 caracteres" };
        }
        break;
      case "carnet_extranjeria":
        if (!/^[A-Z0-9]{9,12}$/.test(dni)) {
          return { valido: false, mensaje: "Carnet de extranjería debe tener entre 9 y 12 caracteres alfanuméricos" };
        }
        break;
    }
    return { valido: true, mensaje: "" };
  };

  const validarTelefono = (telefono: string, esExtranjero: boolean): { valido: boolean; mensaje: string } => {
    if (!telefono.trim()) return { valido: true, mensaje: "" }; // Opcional
    
    if (esExtranjero) {
      // Formato internacional: +código(1-4 dígitos) seguido de 6-15 dígitos
      if (!/^\+\d{1,4}\d{6,15}$/.test(telefono)) {
        return { valido: false, mensaje: "Formato: +código_país seguido del número (ej: +5491234567890)" };
      }
    } else {
      // Perú: 9 dígitos empezando con 9
      if (!/^9\d{8}$/.test(telefono)) {
        return { valido: false, mensaje: "Teléfono peruano debe tener 9 dígitos empezando con 9" };
      }
    }
    return { valido: true, mensaje: "" };
  };

  // Estados para mostrar mensajes de validación
  const [validationErrors, setValidationErrors] = useState<{
    dni: string;
    telefono: string;
    telefonoEmergencia: string;
  }>({
    dni: "",
    telefono: "",
    telefonoEmergencia: "",
  });

  // Estados para el modal de enlaces de pago
  const [showPaymentLinks, setShowPaymentLinks] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    url: string;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
    metodoPago: 'yape' | 'tarjeta' | 'todos';
  } | null>(null);

  // Estados para el modal de QR Yape
  const [showYapeQR, setShowYapeQR] = useState(false);
  const [yapeQRData, setYapeQRData] = useState<{
    clienteId: number;
    clienteEmail: string;
  } | null>(null);

  const handleGeneratePaymentLink = async (metodoPago: 'yape' | 'tarjeta' | 'todos' = 'yape') => {
    try {
      // 1) Si es nueva, crea el cliente (solo si no se ha creado antes)
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
          if (!form.nombre.trim() || !form.apellido.trim() || (!form.esExtranjero && !form.telefono.trim())) {
            toast.error("Complete los campos obligatorios (*)");
            return;
          }

          // Validar formatos
          const validacionDNI = validarDNI(form.dni, form.tipoDocumento);
          const validacionTelefono = validarTelefono(form.telefono, form.esExtranjero);
          const validacionTelEmergencia = validarTelefono(form.telefonoEmergencia, form.esExtranjero);

          if (!validacionDNI.valido || !validacionTelefono.valido || !validacionTelEmergencia.valido) {
            toast.error("Corrija los errores de validación antes de continuar");
            return;
          }

          // ✅ Validación de teléfono único REMOVIDA
          // El backend ya valida duplicados correctamente con normalización
          // La búsqueda del frontend daba falsos positivos

          const nuevo = await ClientesApi.crear({
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            dni: form.dni.trim(),
            notas: `
Información adicional:
${form.fechaNacimiento ? `- Fecha nacimiento: ${form.fechaNacimiento}` : ''}
${form.genero ? `- Género: ${form.genero}` : ''}
${form.direccion ? `- Dirección: ${form.direccion}` : ''}
${form.distrito ? `- Distrito: ${form.distrito}` : ''}
${form.telefonoEmergencia ? `- Tel. emergencia: ${form.telefonoEmergencia}` : ''}
${form.ocupacion ? `- Ocupación: ${form.ocupacion}` : ''}
${form.comoConocio ? `- Cómo nos conoció: ${form.comoConocio}` : ''}
${form.esExtranjero ? `- Extranjero de: ${form.paisOrigen}` : ''}
${form.tipoDocumento !== 'dni' ? `- Tipo documento: ${form.tipoDocumento}` : ''}
${form.observaciones ? `- Observaciones: ${form.observaciones}` : ''}
          `.trim(),
          });
          clienteId = nuevo.id;
          clienteNombre = `${form.nombre.trim()} ${form.apellido.trim()}`;
          clienteTelefono = form.telefono.trim();
          clienteEmail = form.email.trim();

          // ✅ Guardar el cliente creado para reutilizarlo
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
          return;
        }
        clienteId = Number(form.clienteIdExistente);
        clienteNombre = `${form.nombre.trim()} ${form.apellido.trim()}`;
        clienteTelefono = form.telefono.trim();
        clienteEmail = form.email.trim();
      }

      // 2) Crear preferencia de pago con método preferido
      const response = await crearPreferencia({
        clienteId,
        planNombre: plan.nombre,
        planDias: plan.duracionDias,
        monto: total,
        emailCliente: clienteEmail || "noemail@vipcenter.fit",
        metodoPagoPreferido: metodoPago,
        membresiaId: plan.id, // ✅ Vincular membresía con el pago
      });

      // 3) Mostrar modal con enlaces de pago
      setPaymentData({
        url: response.initPoint,
        clienteNombre,
        clienteTelefono,
        clienteEmail,
        metodoPago,
      });
      setShowPaymentLinks(true);
      toast.success(`Enlace de pago generado exitosamente${metodoPago === 'yape' ? ' (optimizado para Yape)' : ''}`);

    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : String(e);
      toast.error(msg || "Error al generar enlace de pago");
    }
  };

  const handleShowYapeQR = async () => {
    try {
      // 1) Si es nueva, crea el cliente (solo si no se ha creado antes)
      let clienteId: number;
      let clienteEmail = '';

      if (tipo === "nueva") {
        // ✅ Si ya se creó un cliente en esta sesión, reutilizarlo
        if (clienteCreado) {
          clienteId = clienteCreado.id;
          clienteEmail = clienteCreado.email;
        } else {
          // Validar campos obligatorios
          if (!form.nombre.trim() || !form.apellido.trim() || (!form.esExtranjero && !form.telefono.trim())) {
            toast.error("Complete los campos obligatorios (*)");
            return;
          }

          // Validar formatos
          const validacionDNI = validarDNI(form.dni, form.tipoDocumento);
          const validacionTelefono = validarTelefono(form.telefono, form.esExtranjero);
          const validacionTelEmergencia = validarTelefono(form.telefonoEmergencia, form.esExtranjero);

          if (!validacionDNI.valido || !validacionTelefono.valido || !validacionTelEmergencia.valido) {
            toast.error("Corrija los errores de validación antes de continuar");
            return;
          }

          // ✅ Validación de teléfono único REMOVIDA
          // El backend ya valida duplicados correctamente con normalización
          // La búsqueda del frontend daba falsos positivos

          const nuevo = await ClientesApi.crear({
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            dni: form.dni.trim(),
            notas: `
Información adicional:
${form.fechaNacimiento ? `- Fecha nacimiento: ${form.fechaNacimiento}` : ''}
${form.genero ? `- Género: ${form.genero}` : ''}
${form.direccion ? `- Dirección: ${form.direccion}` : ''}
${form.distrito ? `- Distrito: ${form.distrito}` : ''}
${form.telefonoEmergencia ? `- Tel. emergencia: ${form.telefonoEmergencia}` : ''}
${form.ocupacion ? `- Ocupación: ${form.ocupacion}` : ''}
${form.comoConocio ? `- Cómo nos conoció: ${form.comoConocio}` : ''}
${form.esExtranjero ? `- Extranjero de: ${form.paisOrigen}` : ''}
${form.tipoDocumento !== 'dni' ? `- Tipo documento: ${form.tipoDocumento}` : ''}
${form.observaciones ? `- Observaciones: ${form.observaciones}` : ''}
          `.trim(),
          });
          clienteId = nuevo.id;
          clienteEmail = form.email.trim();

          // ✅ Guardar el cliente creado para reutilizarlo
          setClienteCreado({
            id: clienteId,
            nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
            telefono: form.telefono.trim(),
            email: clienteEmail,
          });
        }
      } else {
        if (!form.clienteIdExistente) {
          toast.error("Ingresa el ID del cliente existente");
          return;
        }
        clienteId = Number(form.clienteIdExistente);
        clienteEmail = form.email.trim();
      }

      // 2) Mostrar modal de QR Yape
      setYapeQRData({
        clienteId,
        clienteEmail,
      });
      setShowYapeQR(true);

    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : String(e);
      toast.error(msg || "Error al preparar pago con QR");
    }
  };

  const handleYapeQRSuccess = (response: { message?: string; [k: string]: unknown }) => {
    toast.success(`Pago completado: ${response.message || 'Exitoso'}`);
    setShowYapeQR(false);
    setYapeQRData(null);
    
    // Limpiar formulario o redirigir
    resetForm();
  };

  return (
    <>
    <div className="p-6 text-white">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center text-black font-bold">V</div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-widest">VIP <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-white">CENTER FIT</span></h1>
            <p className="text-xs text-slate-400 tracking-[0.25em]">GESTIÓN DE MEMBRESÍAS</p>
          </div>
        </div>
      </div>

      {/* Tipo */}
      <div className="grid md:grid-cols-2 gap-4 mb-6 bg-[#1A1F25] p-4 rounded-xl border border-white/10">
        {([
            { id: "nueva", label: "Nueva Membresía", desc: "Cliente nuevo", emoji: "✨" },
            { id: "renovacion", label: "Renovar Membresía", desc: "Cliente existente", emoji: "🔄" },
          ] as { id: 'nueva'|'renovacion'; label: string; desc: string; emoji: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${tipo === t.id
              ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_18px_rgba(34,197,94,.35)]"
              : "border-white/10 hover:border-emerald-400/60"}`}
          >
            <div className="text-2xl">{t.emoji}</div>
            <div className="font-semibold">{t.label}</div>
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
              {/* Campos principales */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre *" value={form.nombre} onChange={(v)=>setForm({...form, nombre:v})}/>
                <Input label="Apellido *" value={form.apellido} onChange={(v)=>setForm({...form, apellido:v})}/>
              </div>

              {/* Tipo de documento y nacionalidad */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo Documento</label>
                  <select
                    className="bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500"
                    value={form.tipoDocumento}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value;
                      setForm({...form, tipoDocumento: nuevoTipo});
                      // Limpiar validación al cambiar tipo
                      setValidationErrors(prev => ({...prev, dni: ""}));
                    }}
                  >
                    <option value="dni">DNI</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="carnet_extranjeria">Carnet Extranjería</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.esExtranjero}
                      onChange={(e) => setForm({...form, esExtranjero: e.target.checked})}
                      className="rounded"
                    />
                    Extranjero
                  </label>
                </div>
                {form.esExtranjero && (
                  <Input label="País Origen" value={form.paisOrigen} onChange={(v)=>setForm({...form, paisOrigen:v})}/>
                )}
              </div>

              {/* Documento y teléfono con validación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input 
                    label={`${form.tipoDocumento === 'dni' ? 'DNI' : form.tipoDocumento === 'pasaporte' ? 'Pasaporte' : 'Carnet Extranjería'}`}
                    value={form.dni} 
                    onChange={(v) => {
                      setForm({...form, dni: v});
                      const validacion = validarDNI(v, form.tipoDocumento);
                      setValidationErrors(prev => ({...prev, dni: validacion.mensaje}));
                    }}
                  />
                  {validationErrors.dni && (
                    <p className="text-red-400 text-xs mt-1">⚠️ {validationErrors.dni}</p>
                  )}
                </div>
                <div>
                  <Input 
                    label={form.esExtranjero ? "Teléfono (+código país)" : "Teléfono *"} 
                    value={form.telefono} 
                    onChange={(v) => {
                      setForm({...form, telefono: v});
                      const validacion = validarTelefono(v, form.esExtranjero);
                      setValidationErrors(prev => ({...prev, telefono: validacion.mensaje}));
                    }}
                  />
                  {validationErrors.telefono && (
                    <p className="text-red-400 text-xs mt-1">⚠️ {validationErrors.telefono}</p>
                  )}
                  {!form.esExtranjero && form.telefono.length > 0 && form.telefono.length < 9 && (
                    <p className="text-yellow-400 text-xs mt-1">💡 Teléfono peruano debe tener 9 dígitos</p>
                  )}
                </div>
              </div>

              {/* Email y fecha de nacimiento */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" value={form.email} onChange={(v)=>setForm({...form, email:v})}/>
                <Input label="Fecha Nacimiento" type="date" value={form.fechaNacimiento} onChange={(v)=>setForm({...form, fechaNacimiento:v})}/>
              </div>

              {/* Género y ocupación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Género</label>
                  <select
                    className="bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500"
                    value={form.genero}
                    onChange={(e) => setForm({...form, genero: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>
                <Input label="Ocupación" value={form.ocupacion} onChange={(v)=>setForm({...form, ocupacion:v})}/>
              </div>

              {/* Dirección y distrito */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Dirección" value={form.direccion} onChange={(v)=>setForm({...form, direccion:v})}/>
                <Input label="Distrito" value={form.distrito} onChange={(v)=>setForm({...form, distrito:v})}/>
              </div>

              {/* Teléfono de emergencia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input 
                    label="Teléfono Emergencia" 
                    value={form.telefonoEmergencia} 
                    onChange={(v) => {
                      setForm({...form, telefonoEmergencia: v});
                      const validacion = validarTelefono(v, form.esExtranjero);
                      setValidationErrors(prev => ({...prev, telefonoEmergencia: validacion.mensaje}));
                    }}
                  />
                  {validationErrors.telefonoEmergencia && (
                    <p className="text-red-400 text-xs mt-1">⚠️ {validationErrors.telefonoEmergencia}</p>
                  )}
                  {!form.esExtranjero && form.telefonoEmergencia.length > 0 && form.telefonoEmergencia.length < 9 && (
                    <p className="text-yellow-400 text-xs mt-1">💡 Teléfono debe tener 9 dígitos</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">¿Cómo nos conoció?</label>
                  <select
                    className="bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500"
                    value={form.comoConocio}
                    onChange={(e) => setForm({...form, comoConocio: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="redes_sociales">Redes Sociales</option>
                    <option value="google">Google</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="volante">Volante/Publicidad</option>
                    <option value="paso_por_aqui">Pasó por aquí</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Observaciones</label>
                <textarea
                  className="bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500 resize-none"
                  rows={2}
                  value={form.observaciones}
                  onChange={(e) => setForm({...form, observaciones: e.target.value})}
                  placeholder="Lesiones, restricciones médicas, objetivos específicos..."
                />
              </div>

              <div className="text-xs text-slate-500 border-t border-white/10 pt-2">
                * Campos obligatorios
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input label="Buscar (DNI / Teléfono / Nombre)" value={searchQuery} onChange={(v)=>{
                    setSearchQuery(v);
                    // debounce usando useRef
                    if (searchTimer.current) {
                      clearTimeout(searchTimer.current);
                      searchTimer.current = null;
                    }
                    // solo buscar si tiene al menos 2 caracteres
                    if (!v || v.trim().length < 2) {
                      setSearchResults([]);
                      return;
                    }
                    // programar búsqueda
                    searchTimer.current = window.setTimeout(async () => {
                      try {
                        setSearchLoading(true);
                        const res = await ClientesApi.buscar(v.trim());
                        setSearchResults(res || []);
                      } catch (err) {
                        console.error('Error buscando clientes', err);
                        setSearchResults([]);
                      } finally {
                        setSearchLoading(false);
                      }
                    }, 400);
                  }} />
                  <div className="text-xs text-slate-400 mt-2">Resultados:</div>
                  <div className="mt-2 max-h-40 overflow-auto">
                    {searchLoading && <div className="text-xs text-slate-400">Buscando...</div>}
                    {!searchLoading && searchResults.map(r=> (
                      <button key={r.id} onClick={()=>{
                        // seleccionar cliente
                        setForm({...form, clienteIdExistente: String(r.id), nombre: r.nombre||'', apellido: r.apellido||'', email: r.email||'', telefono: r.telefono||'', dni: r.dni||''});
                        setSearchResults([]);
                        setSearchQuery('');
                      }} className="w-full text-left p-2 hover:bg-white/5 rounded">
                        <div className="font-semibold">{r.nombre || r.nombreCompleto} {r.apellido}</div>
                        <div className="text-xs text-slate-400">ID: {r.id} · {r.telefono} · {r.dni}</div>
                      </button>
                    ))}
                    {!searchLoading && searchResults.length===0 && <div className="text-xs text-slate-500">Sin resultados</div>}
                  </div>
                </div>
                <div className="text-xs text-slate-400 col-span-2">* También puedes ingresar directamente el ID si lo conoces.</div>
            </div>
          )}
        </div>

        {/* Planes + Descuentos + Resumen */}
        <div className="space-y-6">
          <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-sm border-b border-emerald-400/40 pb-2 mb-4">
              Planes de Membresía
            </h3>
            
            {loadingPlanes ? (
              <div className="text-center py-8 text-slate-400">
                Cargando planes...
              </div>
            ) : planes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No hay planes disponibles
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {planes.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setPlanIndex(idx)}
                    className={`p-4 rounded-lg border-2 text-left relative transition-all ${
                      planIndex === idx ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:border-emerald-400/60"
                    }`}
                    style={{
                      borderColor: planIndex === idx && p.color ? p.color : undefined
                    }}
                  >
                    {p.tieneDescuento && (
                      <span className="absolute -top-3 right-2 text-[10px] bg-emerald-400 text-black font-bold px-2 py-1 rounded-full shadow">
                        {p.porcentajeDescuento.toFixed(0)}% OFF
                      </span>
                    )}
                    <div className="font-bold uppercase">{p.nombre}</div>
                    <div className="text-xs text-slate-400">{p.duracionDias} días</div>
                    {p.tieneDescuento && p.precio !== p.precioEfectivo && (
                      <div className="text-xs text-slate-500 line-through">S/ {p.precio.toFixed(2)}</div>
                    )}
                    <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                      S/ {p.precioEfectivo.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-sm border-b border-emerald-400/40 pb-2 mb-4">
              Descuento adicional
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[0,5,7,10].map(d => (
                <button key={d}
                  onClick={()=>setDescuento(d)}
                  className={`py-3 rounded-lg border-2 ${descuento===d? "border-emerald-400 bg-emerald-400/10":"border-white/10 hover:border-emerald-400/60"}`}
                >
                  <div className="text-lg font-bold">{d}%</div>
                  <div className="text-[11px] text-slate-400">{d===0?"Sin desc.": "Aplicado"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1F25] p-5 rounded-xl border border-white/10">
            <h3 className="text-emerald-400 font-semibold tracking-wider uppercase text-sm border-b border-emerald-400/40 pb-2 mb-3">
              Resumen
            </h3>
            <div className="space-y-2 text-sm">
              {plan && (
                <>
                  <ResumenRow label="Plan" value={`${plan.nombre} (${plan.duracionDias} días)`}/>
                  <ResumenRow label="Precio base" value={`S/ ${plan.precioEfectivo.toFixed(2)}`}/>
                  <ResumenRow label="Descuento" value={`-${(plan.precioEfectivo * (descuento/100)).toFixed(2)}`}/>
                  <div className="border-t border-emerald-400/40 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">TOTAL</span>
                    <span className="text-2xl font-extrabold text-emerald-400">S/ {total.toFixed(2)}</span>
                  </div>
                </>
              )}
              {!plan && (
                <div className="text-center text-slate-400 py-4">
                  Selecciona un plan
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {/* Opción principal: QR para escanear */}
              <button
                onClick={handleShowYapeQR}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                📲 Generar QR de Yape (Escanear)
              </button>
              
              {/* Opciones de enlace */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGeneratePaymentLink('yape')}
                  className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  📱 Link Yape
                </button>
                <button
                  onClick={() => handleGeneratePaymentLink('todos')}
                  className="py-2 rounded-lg border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10 font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  💳 Link Completo
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400 text-center">
              <div className="font-medium text-purple-400">🔥 QR Recomendado para pagos presenciales</div>
              <div className="mt-1">Los enlaces son para enviar por WhatsApp/Email</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {showPaymentLinks && paymentData && (
      <PaymentLinks
        paymentUrl={paymentData.url}
        clienteNombre={paymentData.clienteNombre}
        clienteTelefono={paymentData.clienteTelefono}
        clienteEmail={paymentData.clienteEmail}
        monto={total}
        planNombre={plan.nombre}
        metodoPago={paymentData.metodoPago}
        onClose={() => {
          setShowPaymentLinks(false);
          setPaymentData(null);
        }}
      />
    )}
    
    {showYapeQR && yapeQRData && plan && (
      <YapeQRPayment
        clienteId={yapeQRData.clienteId}
        monto={total}
        planNombre={plan.nombre}
        planDias={plan.duracionDias}
        emailCliente={yapeQRData.clienteEmail}
        membresiaId={plan.id}
        onClose={() => {
          setShowYapeQR(false);
          setYapeQRData(null);
        }}
        onSuccess={handleYapeQRSuccess}
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
