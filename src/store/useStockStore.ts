import { create } from "zustand";
import { Producto } from "../api/productosApi";
import { EntradaStockResponse } from "../api/stockApi";

interface StockState {
  alertas: Producto[];
  entradasRecientes: EntradaStockResponse[];
  loading: boolean;
  error: string | null;

  setAlertas: (alertas: Producto[]) => void;
  setEntradasRecientes: (entradas: EntradaStockResponse[]) => void;
  agregarEntrada: (entrada: EntradaStockResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStockStore = create<StockState>((set) => ({
  alertas: [],
  entradasRecientes: [],
  loading: false,
  error: null,

  setAlertas: (alertas) => set({ alertas }),
  setEntradasRecientes: (entradas) => set({ entradasRecientes: entradas }),

  agregarEntrada: (entrada) =>
    set((state) => ({
      entradasRecientes: [entrada, ...state.entradasRecientes],
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
