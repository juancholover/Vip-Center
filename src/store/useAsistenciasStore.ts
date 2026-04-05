import { create } from "zustand";
import { AsistenciaApi, Asistencia } from "../api/asistenciaApi";
import { toast } from "react-hot-toast";

interface AsistenciasState {
  asistencias: Asistencia[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
  
  // Acciones
  cargarAsistencias: () => Promise<void>;
  eliminarAsistencia: (id: number) => Promise<void>;
  refrescar: () => Promise<void>;
}

export const useAsistenciasStore = create<AsistenciasState>((set, get) => ({
  asistencias: [],
  loading: false,
  error: null,
  lastUpdate: 0,

  // 📊 Cargar asistencias del día
  cargarAsistencias: async () => {
    try {
      set({ loading: true, error: null });
      const data = await AsistenciaApi.obtenerAsistenciasHoy();
      console.log("📊 Asistencias recibidas:", data);
      set({ 
        asistencias: data, 
        loading: false,
        lastUpdate: Date.now() 
      });
    } catch (err) {
      console.error("Error al cargar asistencias:", err);
      set({ 
        error: "Error al cargar asistencias", 
        loading: false 
      });
    }
  },

  // 🗑️ Eliminar asistencia
  eliminarAsistencia: async (id: number) => {
    try {
      await AsistenciaApi.eliminarAsistencia(id);
      toast.success("Asistencia eliminada correctamente");
      // Recargar lista después de eliminar
      await get().cargarAsistencias();
    } catch (err) {
      console.error("Error al eliminar asistencia:", err);
      toast.error("Error al eliminar asistencia");
      throw err;
    }
  },

  // 🔄 Refrescar (alias para cargarAsistencias)
  refrescar: async () => {
    await get().cargarAsistencias();
  },
}));
