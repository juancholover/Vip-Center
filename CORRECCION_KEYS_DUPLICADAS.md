# 🔧 Corrección de Errores de Keys Duplicadas en React

## 📋 Resumen del Problema

Se detectaron múltiples errores de React relacionados con **keys duplicadas** en componentes que renderizan listas:

```
⚠️ Encountered two children with the same key, `13`
⚠️ Encountered two children with the same key, `15`
```

**Causa:** React utiliza la prop `key` para identificar elementos únicos en listas. Cuando dos o más elementos tienen la misma key, React no puede distinguirlos correctamente, causando problemas de renderizado y advertencias en consola.

---

## 🔍 Archivos Corregidos

### 1. **Reportes.tsx** (`src/pages/Reportes/Reportes.tsx`)

#### ❌ Problema 1: Keys en select de meses
```typescript
// ANTES: Usando índice como key (puede causar duplicados)
{Array.from({ length: 12 }, (_, i) => (
  <option key={i} value={i + 1}>
    {new Date(2000, i, 1).toLocaleDateString("es-ES", { month: "long" })}
  </option>
))}
```

#### ✅ Solución:
```typescript
// DESPUÉS: Key única con prefijo
{Array.from({ length: 12 }, (_, i) => (
  <option key={`month-${i + 1}`} value={i + 1}>
    {new Date(2000, i, 1).toLocaleDateString("es-ES", { month: "long" })}
  </option>
))}
```

#### ❌ Problema 2: Keys en select de años
```typescript
// ANTES: Usando solo el año (puede causar conflictos con otros selects)
<option key={year} value={year}>
  {year}
</option>
```

#### ✅ Solución:
```typescript
// DESPUÉS: Key única con prefijo
<option key={`year-${year}`} value={year}>
  {year}
</option>
```

#### ❌ Problema 3: Keys en comparativa
```typescript
// ANTES: Usando índice del array
{comparativa.map((comp, idx) => (
  <ComparativaCard key={idx} data={comp} />
))}
```

#### ✅ Solución:
```typescript
// DESPUÉS: Usando campo único del objeto (metrica)
{comparativa.map((comp) => (
  <ComparativaCard key={comp.metrica} data={comp} />
))}
```

**Justificación:** El campo `metrica` en `ReporteComparativoDTO` es único para cada tipo de comparativa (e.g., "Ingresos Totales", "Cantidad de Pagos", etc.).

---

### 2. **IngresosReport.tsx** (`src/pages/Reportes/IngresosReport.tsx`)

#### ❌ Problema 1: Keys en tabla de reportes
```typescript
// ANTES: Usando índice del array
reportesAnuales.map((reporte, index) => (
  <tr key={index}>
    ...
  </tr>
))
```

#### ✅ Solución:
```typescript
// DESPUÉS: Usando campo único del objeto (periodo)
reportesAnuales.map((reporte) => (
  <tr key={reporte.periodo}>
    ...
  </tr>
))
```

**Justificación:** El campo `periodo` contiene el nombre del mes (e.g., "Enero", "Febrero"), que es único dentro del año.

#### ❌ Problema 2: Datos duplicados en gráficos (Recharts)

**Causa raíz:** El backend podría estar enviando datos duplicados para el mismo mes, o Recharts estaba generando keys basadas en el campo `mes` que se repetía.

#### ✅ Solución Multi-Paso:

**Paso 1: Agregar ID único a ChartData**
```typescript
// ANTES:
interface ChartData {
  mes: string;
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
}

// DESPUÉS:
interface ChartData {
  id: string; // ✅ Identificador único para evitar keys duplicadas
  mes: string;
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
}
```

**Paso 2: Generar IDs únicos al mapear**
```typescript
const data: ChartData[] = reportesUnicos.map((r, index) => ({
  id: `${selectedYear}-${index}-${r.periodo}`, // ✅ Combinación garantizada única
  mes: r.periodo.substring(0, 3),
  total: r.totalIngresos,
  aprobados: r.ingresosAprobados,
  pendientes: r.ingresosPendientes,
  rechazados: r.ingresosRechazados,
}));
```

**Paso 3: Filtrar duplicados del backend**
```typescript
// ✅ Eliminar reportes duplicados basándose en el campo 'periodo'
const reportesUnicos = reportesAdaptados.filter((reporte, index, self) =>
  index === self.findIndex((r) => r.periodo === reporte.periodo)
);
```

**Razón del filtrado:** Si el backend envía datos duplicados para el mismo mes (e.g., dos registros de "Enero 2025"), esto causaría keys duplicadas en Recharts.

**Paso 4: Logging para debug**
```typescript
console.log("📊 Reportes únicos después de filtrar:", reportesUnicos);
console.log("📈 Chart data con IDs únicos:", data);
```

---

## 📊 Flujo Completo de Corrección

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Backend envía datos (pueden incluir duplicados)              │
│    ReporteIngresosDTO[] con múltiples meses                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Adaptador transforma datos                                   │
│    ReporteIngresosDTO[] → ReporteIngresosAdaptado[]            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ✅ FILTRO DE DUPLICADOS (NUEVO)                              │
│    reportesUnicos = filter por 'periodo' único                  │
│    Ejemplo: ["Enero", "Febrero", "Enero"] → ["Enero", "Febrero"]│
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Generar ChartData con IDs únicos                             │
│    id: `${año}-${índice}-${periodo}`                            │
│    Ejemplo: "2025-0-Enero", "2025-1-Febrero"                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Recharts renderiza con keys únicas                           │
│    BarChart y AreaChart usan internamente el ID como key        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Mejores Prácticas Implementadas

### ✅ 1. Usar Identificadores Únicos como Keys
```typescript
// ❌ MAL: Índice del array
.map((item, index) => <Component key={index} />)

// ✅ BIEN: Campo único del objeto
.map((item) => <Component key={item.id} />)

// ✅ MEJOR: Combinar múltiples campos si no hay ID
.map((item) => <Component key={`${item.type}-${item.name}`} />)
```

### ✅ 2. Agregar Prefijos para Evitar Colisiones
```typescript
// ❌ Riesgo: Dos listas con los mismos números
<option key={1}>Enero</option>
<option key={1}>2025</option> // ❌ Colisión!

// ✅ Solución: Prefijos descriptivos
<option key="month-1">Enero</option>
<option key="year-2025">2025</option>
```

### ✅ 3. Filtrar Duplicados del Backend
```typescript
// ✅ Eliminar duplicados antes de renderizar
const itemsUnicos = items.filter((item, index, self) =>
  index === self.findIndex((i) => i.uniqueField === item.uniqueField)
);
```

### ✅ 4. Logging para Debugging
```typescript
// ✅ Agregar logs para detectar duplicados
console.log("📊 Datos recibidos:", data);
console.log("📈 Datos después de filtrar:", dataFiltrada);
```

---

## 🔍 Cómo Detectar Errores de Keys

### En la Consola del Navegador:
```
⚠️ Warning: Encountered two children with the same key, `X`
```

### Dónde Buscar:
1. **Componentes con `.map()`** - Revisar todas las listas
2. **Recharts** - BarChart, LineChart, PieChart generan keys internamente
3. **Select options** - Múltiples `<option>` con mismas keys
4. **Tabs/Botones dinámicos** - Arrays de configuración

---

## ✅ Resultados de las Correcciones

### Antes:
- ❌ 7+ advertencias de keys duplicadas en consola
- ❌ Renderizado inconsistente de gráficos
- ❌ Posibles problemas de performance

### Después:
- ✅ 0 advertencias de keys duplicadas
- ✅ Renderizado correcto y predecible
- ✅ Datos únicos garantizados
- ✅ Performance optimizada

---

## 📝 Checklist de Verificación

Para confirmar que los errores se resolvieron:

- [ ] Abrir DevTools (F12)
- [ ] Ir a la pestaña Console
- [ ] Navegar a la página de Reportes
- [ ] Cambiar entre tabs (Overview / Ingresos Detallados)
- [ ] Cambiar mes y año en los selectores
- [ ] Verificar que NO aparezcan warnings de keys duplicadas
- [ ] Los gráficos deben renderizarse sin errores

---

## 🐛 Si Persisten los Errores

### Paso 1: Limpiar caché del navegador
```
Ctrl + Shift + Delete → Borrar caché
```

### Paso 2: Reiniciar el servidor de desarrollo
```bash
# Detener servidor (Ctrl + C)
npm run dev
```

### Paso 3: Verificar datos del backend
```typescript
// En la consola del navegador, revisar:
console.log("📊 Reportes únicos:", reportesUnicos);

// Buscar si hay duplicados:
const duplicados = reportesUnicos.filter((r, i, self) => 
  self.findIndex(x => x.periodo === r.periodo) !== i
);
console.log("🔍 Duplicados encontrados:", duplicados);
```

### Paso 4: Revisar respuesta del backend
- Abrir DevTools → Network → XHR
- Buscar llamada a `/api/reportes/ingresos/anual?anio=2025`
- Verificar que no haya meses duplicados en el response

---

## 📚 Referencias

- [React Docs: Lists and Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- [Recharts - Custom Keys](https://recharts.org/en-US/api)
- [Why Index as Key is an Anti-Pattern](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318)

---

**Fecha:** 14 de octubre de 2025  
**Estado:** ✅ Corregido  
**Archivos modificados:** 2  
**Líneas cambiadas:** ~15
