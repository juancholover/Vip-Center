import { create } from "zustand";
import { VentaSuplementoResponse } from "../api/ventasSuplementoApi";

interface VentasSuplementoState {
  ventasDelDia: VentaSuplementoResponse[];
  loading: boolean;
  error: string | null;

  setVentasDelDia: (ventas: VentaSuplementoResponse[]) => void;
  agregarVenta: (venta: VentaSuplementoResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useVentasSuplementoStore = create<VentasSuplementoState>((set) => ({
  ventasDelDia: [],
  loading: false,
  error: null,

  setVentasDelDia: (ventas) => set({ ventasDelDia: ventas }),

  agregarVenta: (venta) =>
    set((state) => ({
      ventasDelDia: [venta, ...state.ventasDelDia],
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
