import { create } from "zustand";

export interface Cliente {
  nombre: string;
  dni: string;
  fecha: string; // fecha de registro
  plan: "VIP" | "Mensual" | "Anual" | "Clases";
  estado: "Activo" | "Inactivo";
  asistencia: string;
  foto?: string;
  membresia?: "Básico" | "Premium" | "Anual"; // 👈 nueva propiedad
}

interface ClientesState {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  addCliente: (c: Cliente) => void;
  updateCliente: (dni: string, data: Partial<Cliente>) => void;
  removeCliente: (dni: string) => void;
  setSelectedCliente: (cliente: Cliente) => void;
  createSuscripcion: (dni: string, membresia: Cliente["membresia"]) => void;
  renovarSuscripcion: (dni: string, membresia?: Cliente["membresia"]) => void;
}

export const useClientesStore = create<ClientesState>((set) => ({
  clientes: [
    {
      nombre: "Carlos Eduardo Mendoza",
      dni: "74125896",
      fecha: "15/01/2025",
      plan: "VIP",
      estado: "Activo",
      asistencia: "Hoy - 18:30",
      foto: "https://i.pravatar.cc/150?u=74125896",
      membresia: "Premium",
    },
    {
      nombre: "María Isabel González",
      dni: "68453271",
      fecha: "03/02/2025",
      plan: "Mensual",
      estado: "Activo",
      asistencia: "Ayer - 07:15",
      foto: "https://i.pravatar.cc/150?u=68453271",
      membresia: "Básico",
    },
  ],
  selectedCliente: null,

  addCliente: (c) =>
    set((state) => ({
      clientes: [...state.clientes, c],
    })),

  updateCliente: (dni, data) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.dni === dni ? { ...c, ...data } : c
      ),
    })),

  removeCliente: (dni) =>
    set((state) => ({
      clientes: state.clientes.filter((c) => c.dni !== dni),
    })),

  setSelectedCliente: (cliente) => set(() => ({ selectedCliente: cliente })),

  // 👉 Nueva suscripción (crea o asigna membresía)
  createSuscripcion: (dni, membresia) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.dni === dni
          ? {
              ...c,
              membresia,
              estado: "Activo",
              fecha: new Date().toLocaleDateString(),
            }
          : c
      ),
    })),

  // 👉 Renovar suscripción (puede cambiar membresía o dejar la misma)
  renovarSuscripcion: (dni, membresia) =>
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.dni === dni
          ? {
              ...c,
              membresia: membresia ?? c.membresia,
              estado: "Activo",
              fecha: new Date().toLocaleDateString(),
            }
          : c
      ),
    })),
    
}));
