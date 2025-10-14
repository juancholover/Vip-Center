import { useState, useRef, useEffect } from "react";
import { crearPagoConYape } from "../api/pagosApi";
import { ClientesApi, Cliente } from "../api/clientesApi";
import { toast } from "react-hot-toast";

type Props = {
  clienteId: number;
  monto: number;
  planNombre: string;
  planDias: number;
  emailCliente?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefonoInicial?: string;
  onClose?: () => void;
  onSuccess?: (res: PagoResponse) => void;
};

type PagoResponse = {
  status?: string | number;
  message?: string;
  [k: string]: unknown;
};

export default function YapePayment({ clienteId, monto, planNombre, planDias, emailCliente, nombre, apellido, dni, telefonoInicial, onClose, onSuccess }: Props) {
  const [phone, setPhone] = useState(telefonoInicial || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<Cliente[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<number | null>(null);
  const [createAnyway, setCreateAnyway] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const searchTimer = useRef<number | null>(null);

  const handlePay = async () => {
    if (phone.length !== 9 || otp.length !== 6) {
      toast.error("Número o OTP inválido");
      return;
    }

    setLoading(true);
    try {
      let clienteIdReal = clienteId;
      // Si clienteId es 0 => intentar buscar duplicados por dni/telefono
      if (!clienteIdReal || clienteIdReal === 0) {
        try {
          setCheckingDuplicates(true);
          const query = (dni && dni.trim()) || phone || (emailCliente ? emailCliente.split('@')[0] : '');
          const found = query ? await ClientesApi.buscar(query) : [];
          setDuplicates(found || []);
          setCheckingDuplicates(false);

          if (found && found.length > 0 && !selectedDuplicateId && !createAnyway) {
            // informar al usuario que hay coincidencias y pedir selección
            toast.error('Se encontraron clientes similares. Selecciona uno o pulsa "Crear nuevo" para continuar.');
            return; // detener flujo hasta que el usuario elija
          }

          if (selectedDuplicateId) {
            clienteIdReal = selectedDuplicateId;
          }
        } catch (e) {
          setCheckingDuplicates(false);
          console.error('Error buscando duplicados', e);
          // continuar si la búsqueda falla
        }

        // Si se indicó crear anyway o no hubo duplicados, crear nuevo cliente
        if ((!clienteIdReal || clienteIdReal === 0) && (createAnyway || (duplicates.length === 0))) {
          // En producción pedimos confirmación explícita
          const isProd = Boolean((import.meta as { env?: Record<string, unknown> }).env?.PROD);
          if (isProd && !createAnyway && !showConfirmCreate) {
            // mostrar modal de confirmación y detener flujo
            setShowConfirmCreate(true);
            setLoading(false);
            return;
          }
          try {
            const nuevo = await ClientesApi.crear({
              nombre: nombre || (emailCliente && emailCliente.split('@')[0]) || 'Cliente',
              apellido: apellido || '',
              telefono: phone || '',
                dni: dni || undefined,
                email: emailCliente,
                notas: 'Creado desde flujo Yape (frontend)'
              });
            clienteIdReal = nuevo.id;
          } catch (ce) {
              // no bloquear el pago si creación falla, pero avisar
              const msg = (ce instanceof Error) ? ce.message : String(ce);
              toast.error('No se pudo crear cliente automáticamente: ' + msg);
          }
        }
      }

      // Intentar usar SDK de MercadoPago si está cargado
      // En el frontend debe cargarse: <script src="https://sdk.mercadopago.com/js/v2"></script>
      // Aquí hacemos un guard para no romper si no está.
      // Token generado por SDK de MercadoPago (si está disponible)
      let token: string;
      const MPGlobal = (window as unknown) as { MercadoPago?: unknown; [key: string]: unknown };
      const MP = MPGlobal.MercadoPago;
      if (MP && typeof MP === 'function') {
        const publicKey = (import.meta as { env?: Record<string, unknown> }).env?.VITE_MERCADOPAGO_PUBLIC_KEY || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mp = new (MP as any)(publicKey, { locale: 'es-PE' });
        const yape = mp.yape({ otp, phoneNumber: phone });
        const created = await yape.create();
        token = created?.id ?? '';
      } else {
        // SDK no cargado: usar token de prueba (dev)
        token = `TEST_TOKEN_${phone}_${otp}`;
      }

      const body = {
        token,
        clienteId: clienteIdReal,
        planNombre,
        planDias,
        monto,
        emailCliente: emailCliente || "noemail@vipcenter.fit",
      };

      const res = await crearPagoConYape(body) as PagoResponse;
      const status = res?.status ?? null;
      if (status === 'approved' || status === 'APROBADO' || status === 200) {
        toast.success('Pago aprobado exitosamente');
        if (onSuccess) onSuccess(res);
      } else if (status === 'rejected') {
        toast.error('Pago rechazado: ' + (res.message ?? 'Sin detalle'));
      } else {
        toast('Pago procesado: ' + (res.message ?? JSON.stringify(res)));
      }
      if (onClose) onClose();
    } catch (err: unknown) {
      const msg = (err instanceof Error) ? err.message : String(err);
      toast.error(msg || 'Error al procesar pago con Yape');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    // el usuario confirma crear el cliente aun con posibles duplicados
    setCreateAnyway(true);
    setShowConfirmCreate(false);
    // reintentar el pago
    await handlePay();
  };

  // Debounced live search cuando el usuario escribe el teléfono o dni
  useEffect(() => {
    // limpiar timer previo
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }

    const query = (dni && dni.trim()) || phone;
    if (!query || query.trim().length < 2) {
      setDuplicates([]);
      return;
    }

    searchTimer.current = window.setTimeout(async () => {
      try {
        setCheckingDuplicates(true);
        const found = await ClientesApi.buscar(query.trim());
        setDuplicates(found || []);
      } catch (e) {
        console.error('Error en búsqueda debounced', e);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 450);

    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
        searchTimer.current = null;
      }
    };
  }, [phone, dni]);

  return (
    <>
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
      <div className="bg-[#0F1318] p-6 rounded-xl w-[420px] text-white border border-white/10">
        <h3 className="text-lg font-bold mb-3">Pagar con Yape</h3>
        <p className="text-sm text-slate-400 mb-4">Ingresa número de celular (9 dígitos) y el código OTP que ves en la app Yape.</p>

        <label className="block text-xs text-slate-400">Número celular</label>
        <input className="mt-1 mb-3 w-full p-2 rounded bg-[#081018] border border-white/5" value={phone} onChange={e=>setPhone(e.target.value)} />

        <label className="block text-xs text-slate-400">OTP (6 dígitos)</label>
        <input className="mt-1 mb-4 w-full p-2 rounded bg-[#081018] border border-white/5" value={otp} onChange={e=>setOtp(e.target.value)} />

        {/* Detección de duplicados */}
        {checkingDuplicates && <div className="text-xs text-slate-400 mb-2">Buscando clientes similares...</div>}
        {duplicates.length > 0 && (
          <div className="mb-3 p-2 border border-white/5 rounded bg-[#071018] max-h-32 overflow-auto">
            <div className="text-sm text-slate-300 mb-2">Se encontraron clientes similares. Selecciona uno para usarlo:</div>
            {duplicates.map(d => (
              <div key={d.id} className={`p-2 rounded hover:bg-white/5 ${selectedDuplicateId===d.id? 'bg-white/5': ''}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{d.nombre} {d.apellido} <span className="text-xs text-slate-400">(ID {d.id})</span></div>
                    <div className="text-xs text-slate-400">{d.telefono} · {d.dni}</div>
                  </div>
                  <div>
                    <button onClick={()=>setSelectedDuplicateId(d.id)} className="px-3 py-1 rounded bg-emerald-600 text-xs">Usar</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={()=>setCreateAnyway(true)} className="px-3 py-1 rounded bg-white/5">Crear nuevo de todas formas</button>
              <button onClick={()=>{ setDuplicates([]); setCreateAnyway(true); }} className="px-3 py-1 rounded bg-emerald-600">No hay duplicados — Crear</button>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-white/5">Cancelar</button>
          <button onClick={handlePay} disabled={loading} className="px-4 py-2 rounded bg-emerald-600">{loading? 'Procesando...':'Pagar S/ '+monto.toFixed(2)}</button>
        </div>
      </div>
    </div>
    {showConfirmCreate && (
      <ConfirmCreateModal onCancel={()=>setShowConfirmCreate(false)} onConfirm={handleConfirmCreate} />
    )}
    </>
  );
}


// Confirm modal (renderizado fuera del cuerpo principal si showConfirmCreate)
function ConfirmCreateModal({onCancel, onConfirm}:{onCancel:()=>void; onConfirm:()=>void}){
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-60">
      <div className="bg-[#0F1318] p-6 rounded-xl w-[420px] text-white border border-white/10">
        <h4 className="font-bold mb-2">Confirmar creación de cliente</h4>
        <p className="text-sm text-slate-400 mb-4">Se encontraron posibles clientes duplicados. ¿Deseas crear igualmente un nuevo cliente en el sistema?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 rounded bg-white/5">Cancelar</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded bg-emerald-600">Crear y continuar</button>
        </div>
      </div>
    </div>
  );
}
