import { create } from "zustand";
import { Empleado, Rol, Permiso } from "../api/empleadosApi";

interface EmpleadosStore {
  // Estado
  empleados: Empleado[];
  roles: Rol[];
  permisos: Permiso[];
  empleadoSeleccionado: Empleado | null;
  rolSeleccionado: Rol | null;
  loading: boolean;
  error: string | null;

  // Acciones - Empleados
  setEmpleados: (empleados: Empleado[]) => void;
  agregarEmpleado: (empleado: Empleado) => void;
  actualizarEmpleado: (id: number, empleado: Empleado) => void;
  eliminarEmpleado: (id: number) => void;
  setEmpleadoSeleccionado: (empleado: Empleado | null) => void;

  // Acciones - Roles
  setRoles: (roles: Rol[]) => void;
  agregarRol: (rol: Rol) => void;
  actualizarRol: (id: number, rol: Rol) => void;
  eliminarRol: (id: number) => void;
  setRolSeleccionado: (rol: Rol | null) => void;

  // Acciones - Permisos
  setPermisos: (permisos: Permiso[]) => void;

  // Utilidades
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useEmpleadosStore = create<EmpleadosStore>((set) => ({
  // Estado inicial
  empleados: [],
  roles: [],
  permisos: [],
  empleadoSeleccionado: null,
  rolSeleccionado: null,
  loading: false,
  error: null,

  // Acciones - Empleados
  setEmpleados: (empleados) => set({ empleados }),
  
  agregarEmpleado: (empleado) =>
    set((state) => ({ empleados: [...state.empleados, empleado] })),
  
  actualizarEmpleado: (id, empleado) =>
    set((state) => ({
      empleados: state.empleados.map((e) => (e.id === id ? empleado : e)),
    })),
  
  eliminarEmpleado: (id) =>
    set((state) => ({
      empleados: state.empleados.filter((e) => e.id !== id),
    })),
  
  setEmpleadoSeleccionado: (empleado) => set({ empleadoSeleccionado: empleado }),

  // Acciones - Roles
  setRoles: (roles) => set({ roles }),
  
  agregarRol: (rol) =>
    set((state) => ({ roles: [...state.roles, rol] })),
  
  actualizarRol: (id, rol) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? rol : r)),
    })),
  
  eliminarRol: (id) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
    })),
  
  setRolSeleccionado: (rol) => set({ rolSeleccionado: rol }),

  // Acciones - Permisos
  setPermisos: (permisos) => set({ permisos }),

  // Utilidades
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
