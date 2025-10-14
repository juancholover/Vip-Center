export type Plan = { nombre: string; precio: number; dias: number; badge?: string };

export const PLANES: Plan[] = [
  { nombre: "Mensual",  precio: 81,  dias: 30,  badge: "10% OFF" },
  { nombre: "3 Meses",  precio: 240, dias: 90,  badge: "11% OFF" },
  { nombre: "6 Meses",  precio: 460, dias: 180, badge: "17% OFF" },
  { nombre: "12 Meses", precio: 820, dias: 365, badge: "24% OFF" },
  // 👉 Para agregar otro: { nombre: "15 Días", precio: 50, dias: 15 }
];
