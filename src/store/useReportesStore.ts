import { create } from "zustand";

/** Tipos */
export type Plan = "Básico" | "Premium" | "Anual";
export type MetodoPago = "Efectivo" | "Tarjeta" | "Transferencia";
export type EstadoPago = "Completado" | "Pendiente" | "Cancelado";

export interface Pago {
  id: string;
  fechaISO: string;          // 2025-09-28
  clienteNombre: string;
  clienteDni: string;
  plan: Plan;
  metodo: MetodoPago;
  monto: number;
  estado: EstadoPago;
}

export interface Asistencia {
  fechaISO: string;          // día de asistencia
  clienteNombre: string;
  clienteDni: string;
}

/** Utils */
const fmt = (n: number) =>
  n.toLocaleString("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const today = new Date();
const daysAgo = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString().slice(0, 10);
};

/** Datos de ejemplo (estables) */
const pagosSeed: Pago[] = [
  { id: "p1", fechaISO: daysAgo(1),  clienteNombre: "Carlos Mendoza",  clienteDni: "74125896", plan: "Premium", metodo: "Tarjeta",       monto: 120, estado: "Completado" },
  { id: "p2", fechaISO: daysAgo(2),  clienteNombre: "María González",   clienteDni: "68453271", plan: "Básico",  metodo: "Efectivo",     monto: 50,  estado: "Completado" },
  { id: "p3", fechaISO: daysAgo(5),  clienteNombre: "Roberto Silva",    clienteDni: "52789134", plan: "Anual",   metodo: "Transferencia",monto: 500, estado: "Completado" },
  { id: "p4", fechaISO: daysAgo(7),  clienteNombre: "Ana Rodríguez",    clienteDni: "41967823", plan: "Básico",  metodo: "Tarjeta",       monto: 50,  estado: "Completado" },
  { id: "p5", fechaISO: daysAgo(9),  clienteNombre: "Diego Morales",    clienteDni: "73519864", plan: "Premium", metodo: "Tarjeta",       monto: 120, estado: "Completado" },
  { id: "p6", fechaISO: daysAgo(12), clienteNombre: "Laura Torres",     clienteDni: "71346852", plan: "Básico",  metodo: "Efectivo",     monto: 50,  estado: "Completado" },
  { id: "p7", fechaISO: daysAgo(14), clienteNombre: "Pedro Ramírez",    clienteDni: "71634982", plan: "Premium", metodo: "Transferencia",monto: 120, estado: "Pendiente"   },
  { id: "p8", fechaISO: daysAgo(16), clienteNombre: "Jorge Santos",     clienteDni: "70634982", plan: "Anual",   metodo: "Tarjeta",       monto: 500, estado: "Completado" },
  { id: "p9", fechaISO: daysAgo(20), clienteNombre: "Andrea Álvarez",   clienteDni: "70611111", plan: "Premium", metodo: "Tarjeta",       monto: 120, estado: "Completado" },
  { id: "p10",fechaISO: daysAgo(25), clienteNombre: "Luis Cárdenas",    clienteDni: "70999999", plan: "Básico",  metodo: "Efectivo",     monto: 50,  estado: "Cancelado"   },
];

const asistenciasSeed: Asistencia[] = Array.from({ length: 120 }).map((_, i) => ({
  fechaISO: daysAgo(Math.floor(Math.random() * 30)),
  clienteNombre: ["Carlos Mendoza","María González","Roberto Silva","Ana Rodríguez","Diego Morales","Laura Torres"][Math.floor(Math.random()*6)],
  clienteDni: String(70000000 + Math.floor(Math.random()*999999)),
}));

/** Estado y selectores */
interface ReportesState {
  pagos: Pago[];
  asistencias: Asistencia[];

  // ingresos
  totalIngresos: () => number;
  ingresosDelMes: () => number;
  promedioPorCliente: () => number;
  pagosCompletados: () => number;
  ingresosUltimos30: () => { day: string; total: number }[];
  ingresosPorPlan: () => { name: Plan; value: number }[];
  totalesPorMetodo: () => { metodo: MetodoPago; total: number }[];
  historialPagos: () => Pago[];

  // suscripciones
  renovacionesVsCancelaciones12m: () => { mes: string; renovaciones: number; cancelaciones: number }[];
  distribucionEstadoSuscripcion: () => { name: string; value: number }[];
  proximasAVencer: () => { cliente: string; plan: Plan; venceEnDias: number; estado: "Activo"|"Por vencer" }[];
  distribucionTiposMembresia: () => { name: Plan; value: number }[];

  // asistencia
  totalAsistencias: () => number;
  nuevosClientesMes: () => number;       // mock
  ausentes7d: () => number;              // mock
  retencion: () => number;               // mock %
  asistenciaUltimos30: () => { day: string; total: number }[];
  topConstantes: () => { nombre: string; dias: number }[];
  ausentesLista: () => { nombre: string; dias: number; ultimaVisita: string; estado: "Ausente" }[];
  asistenciasRecientes: () => { nombre: string; hora: string; membresia: Plan; estado: "Activo" }[];
}

export const useReportesStore = create<ReportesState>(() => ({
  pagos: pagosSeed,
  asistencias: asistenciasSeed,

  // ====== Ingresos ======
  totalIngresos: () => pagosSeed.filter(p=>p.estado==="Completado").reduce((a,b)=>a+b.monto,0),
  ingresosDelMes: () => {
    const m = new Date().toISOString().slice(0,7); // yyyy-mm
    return pagosSeed.filter(p=>p.estado==="Completado" && p.fechaISO.startsWith(m)).reduce((a,b)=>a+b.monto,0);
  },
  promedioPorCliente: () => {
    const map = new Map<string, number>();
    pagosSeed.filter(p=>p.estado==="Completado").forEach(p=>{
      map.set(p.clienteDni,(map.get(p.clienteDni)||0)+p.monto);
    });
    const total = Array.from(map.values()).reduce((a,b)=>a+b,0);
    return map.size ? total / map.size : 0;
  },
  pagosCompletados: () => pagosSeed.filter(p=>p.estado==="Completado").length,
  ingresosUltimos30: () => {
    const map = new Map<string, number>();
    for (let i=29;i>=0;i--){
      const d = daysAgo(i);
      map.set(d,0);
    }
    pagosSeed.filter(p=>p.estado==="Completado").forEach(p=>{
      if (map.has(p.fechaISO)) map.set(p.fechaISO, (map.get(p.fechaISO) || 0) + p.monto);
    });
    return Array.from(map.entries()).map(([day,total])=>({ day: day.slice(5), total }));
  },
  ingresosPorPlan: () => {
    const agg: Record<Plan, number> = { Básico:0, Premium:0, Anual:0 };
    pagosSeed.filter(p=>p.estado==="Completado").forEach(p=>{ agg[p.plan]+=p.monto; });
    return Object.entries(agg).map(([name,value])=>({ name: name as Plan, value }));
  },
  totalesPorMetodo: () => {
    const agg: Record<MetodoPago, number> = { Efectivo:0, Tarjeta:0, Transferencia:0 };
    pagosSeed.filter(p=>p.estado==="Completado").forEach(p=>{ agg[p.metodo]+=p.monto; });
    return Object.entries(agg).map(([metodo,total])=>({ metodo: metodo as MetodoPago, total }));
  },
  historialPagos: () => [...pagosSeed].sort((a,b)=> b.fechaISO.localeCompare(a.fechaISO)),

  // ====== Suscripciones ======
  renovacionesVsCancelaciones12m: () => {
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    // mock calc: en base a pagos completados por mes vs cancelados
    const agreg: Record<string,{renovaciones:number,cancelaciones:number}> = {};
    meses.forEach((_,i)=>agreg[String(i)]={renovaciones:0,cancelaciones:0});
    pagosSeed.forEach(p=>{
      const m = new Date(p.fechaISO).getMonth().toString();
      if (p.estado==="Cancelado") agreg[m].cancelaciones++;
      else if (p.estado==="Completado") agreg[m].renovaciones++;
    });
    return meses.map((m,idx)=>({ mes:m, renovaciones: agreg[String(idx)].renovaciones, cancelaciones: agreg[String(idx)].cancelaciones }));
  },
  distribucionEstadoSuscripcion: () => ([
    { name:"Activas",    value: 68 },
    { name:"Vencidas",   value: 12 },
    { name:"Por vencer", value: 15 },
    { name:"Canceladas", value: 5  },
  ]),
  proximasAVencer: () => ([
    { cliente:"María Rodríguez", plan:"VIP" as Plan,    venceEnDias: 5,  estado:"Por vencer" },
    { cliente:"Juan López",      plan:"Mensual" as any, venceEnDias: 9,  estado:"Por vencer" },
    { cliente:"Ana Sánchez",     plan:"Anual",          venceEnDias: 12, estado:"Por vencer" },
    { cliente:"Carlos Martín",   plan:"Clases" as any,  venceEnDias: 14, estado:"Por vencer" },
  ]),
  distribucionTiposMembresia: () => ([
    { name:"Básico",  value: 45 },
    { name:"Premium", value: 30 },
    { name:"Anual",   value: 25 },
  ]),

  // ====== Asistencia ======
  totalAsistencias: () => asistenciasSeed.length,
  nuevosClientesMes: () => 145,
  ausentes7d: () => 89,
  retencion: () => 92,
  asistenciaUltimos30: () => {
    const map = new Map<string, number>();
    for (let i=29;i>=0;i--){ const d=daysAgo(i); map.set(d,0); }
    asistenciasSeed.forEach(a=>{ if (map.has(a.fechaISO)) map.set(a.fechaISO,(map.get(a.fechaISO)||0)+1); });
    return Array.from(map.entries()).map(([day,total])=>({ day: day.slice(5), total }));
  },
  topConstantes: () => ([
    { nombre: "Carlos Mendoza", dias: 28 },
    { nombre: "María González", dias: 26 },
    { nombre: "Roberto Silva",  dias: 24 },
    { nombre: "Ana Rodríguez",  dias: 22 },
    { nombre: "Diego Morales",  dias: 20 },
  ]),
  ausentesLista: () => ([
    { nombre: "Pedro Ramírez", dias: 15, ultimaVisita: "03/09/2025", estado:"Ausente" },
    { nombre: "Laura Torres",  dias: 10, ultimaVisita: "08/09/2025", estado:"Ausente" },
  ]),
  asistenciasRecientes: () => ([
    { nombre:"Carlos Mendoza", hora:"18:30", membresia:"Premium", estado:"Activo" },
    { nombre:"María González", hora:"18:15", membresia:"Básico",  estado:"Activo" },
  ]),
}));

export { fmt };
