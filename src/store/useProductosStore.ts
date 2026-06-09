import { create } from "zustand";
import { Producto } from "../api/productosApi";

interface ProductosState {
  productos: Producto[];
  loading: boolean;
  error: string | null;

  setProductos: (productos: Producto[]) => void;
  agregarProducto: (producto: Producto) => void;
  actualizarProducto: (id: number, producto: Producto) => void;
  desactivarProducto: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProductosStore = create<ProductosState>((set) => ({
  productos: [],
  loading: false,
  error: null,

  setProductos: (productos) => set({ productos }),

  agregarProducto: (producto) =>
    set((state) => ({ productos: [...state.productos, producto] })),

  actualizarProducto: (id, producto) =>
    set((state) => ({
      productos: state.productos.map((p) => (p.id === id ? producto : p)),
    })),

  desactivarProducto: (id) =>
    set((state) => ({
      productos: state.productos.map((p) =>
        p.id === id ? { ...p, activo: false } : p
      ),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
