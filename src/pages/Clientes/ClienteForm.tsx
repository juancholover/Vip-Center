import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import type { Cliente, CrearClienteRequest } from "../../api/clientesApi";
import { ClientesApi } from "../../api/clientesApi";

interface Props {
  cliente?: Cliente | null; // null → crear nuevo
  onClose: () => void;
  onSuccess: () => Promise<void>; // para recargar lista después
}

export default function ClienteForm({ cliente, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CrearClienteRequest>({
    nombre: "",
    apellido: "",
    telefono: "",
    dni: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Si hay cliente → modo edición
  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        dni: cliente.dni ?? "",
        email: cliente.email ?? "",
      });
    } else {
      setForm({
        nombre: "",
        apellido: "",
        telefono: "",
        dni: "",
        email: "",
      });
    }
  }, [cliente]);

  // 📝 Manejo de inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 💾 Guardar cliente (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cliente) {
        // modo edición
        await ClientesApi.actualizar(cliente.id, form);
        toast.success("Cliente actualizado correctamente ✅");
      } else {
        // modo creación
        await ClientesApi.crear(form);
        toast.success("Cliente creado correctamente ✅");
      }
      await onSuccess(); // recargar tabla
      onClose();
    } catch {
      toast.error("Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center px-4">
      <div className="w-full max-w-xl rounded-xl bg-[#171B22] border border-white/10 p-6 relative animate-fadeIn">
        {/* ✖ Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4 text-emerald-400">
          {cliente ? "Editar Cliente" : "Nuevo Cliente"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="text-xs text-slate-400">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="text-xs text-slate-400">Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              className="w-full mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs text-slate-400">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              className="w-full mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="text-xs text-slate-400">DNI (Opcional)</label>
            <input
              name="dni"
              value={form.dni}
              onChange={handleChange}
              className="w-full mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 bg-[#0F1318] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-medium disabled:opacity-60 transition"
            >
              {loading
                ? "Guardando..."
                : cliente
                ? "Guardar cambios"
                : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
