# Cambios Solicitados por el Cliente — Reunión con David Condor

## Resumen de la Reunión
David Condor (dueño del gimnasio VIP Center Fit) revisó el sistema junto con su asistente.
Evaluó el dashboard, clientes, membresías, reportes, QR y la bandeja de recepción.

---

## ✅ CAMBIOS A IMPLEMENTAR AHORA (Frontend)

### 1. Simplificar el Dashboard (Home)
**Qué dijo el cliente:**
> "Tendencia de asistencia no creo que sea tan importante en inicio. Top clientes tampoco. Horas pico sí. Actividad de la gente sí. Membresía por vencer también está bien."
> "Estas gráficas debería poder verlo en reportes."

**Acción:**
- ❌ Quitar "Tendencia de Asistencia" del Home (ya existe en Reportes → Asistencia)
- ❌ Quitar "Top Clientes" del Home (ya existe en Reportes → Asistencia)
- ✅ Mantener: KPIs (Clientes, Ingresos, Asistencias Hoy, Por Vencer)
- ✅ Mantener: Ingresos de la Semana (gráfico de barras)
- ✅ Mantener: Horas Pico
- ✅ Mantener: Acciones Rápidas
- ✅ Mantener: Actividad Reciente
- ✅ Mantener: Footer motivacional

**Archivos afectados:** `Home.tsx`

---

### 2. Renombrar "Sin Membresía" → "Vencido"
**Qué dijo el cliente:**
> "En vez de sin membresía debería decir vencido."

**Acción:** Cambiar el label visible en TODA la UI. El valor interno `sin_membresia` NO cambia (compatibilidad backend).

**Archivos afectados (7):**
| Archivo | Línea | Cambio |
|---------|-------|--------|
| `EstadoBadge.tsx` | 22 | `"Sin membresía"` → `"Vencido"` |
| `Clientes.tsx` | 294 | Tarjeta métrica `"Sin Membresía"` → `"Vencido"` |
| `Clientes.tsx` | 364 | Gráfico pie `"Sin membresía"` → `"Vencido"` |
| `Clientes.tsx` | 404 | Tab filtro `"Sin Membresía"` → `"Vencido"` |
| `Asistencia.tsx` | 282 | Badge `"Sin membresía"` → `"Vencido"` |
| `ClienteFichaModal.tsx` | 165 | `"Sin membresía activa"` → `"Membresía vencida"` |
| `ModalAccesoDenegado.tsx` | 21 | `"Sin Membresía Activa"` → `"Membresía Vencida"` |
| `ModalBusquedaManual.tsx` | 132 | `"Sin membresía activa"` → `"Membresía vencida"` |
| `ReportesCompleto.tsx` | 1003 | Option `"Sin membresía"` → `"Vencido"` |

---

### 3. Aclarar label "Clientes Activos" en Home
**Qué dijo el cliente:**
> "Los clientes activos es lo que están ahorita entrenando?"
> Respuesta: "Sí, son los matriculados"

**Problema:** El cliente confunde "Clientes Activos" (matriculados con membresía vigente) con "personas actualmente dentro del gimnasio". 

**Sugerencia:** Cambiar la tarjeta en Home de "Clientes Activos" a **"Clientes Matriculados"** para evitar confusión.

---

## 📋 COSAS QUE LE GUSTARON (no cambiar)
- ✅ Dashboard general — "El dashboard está bien"
- ✅ Horas pico — "Eso sí es importante"  
- ✅ Actividad reciente — "Actividad de la gente sí"
- ✅ Membresías por vencer — "También está bien"
- ✅ Bandeja de recepción (Llamado/Promesa) — "Eso está bueno"
- ✅ Cada cliente tiene su propio QR
- ✅ Reportes detallados

---

## ⏳ POSPUESTO PARA DESPUÉS

### Control de salida del gimnasio
**Qué dijo el cliente:**
> "Alguien entra, se registra... para el momento de salir, ¿cómo sé que ya salió?"
> "Sería chévere ponerle que después de 5 horas ya no está"
> Asistente: "Usualmente la gente se va y no se pone a escanear"

**Solución propuesta:** Botón en el sistema para marcar "ya salió" manualmente.
**Estado:** David dijo "Es un detallito que no lo veo tan problemático" — **implementar después**.
**Requiere backend:** Sí (campo `enGimnasio` en Asistencia, endpoint PATCH)

### Campo DNI en registro
**Qué dijo el cliente:**
> "Podrías poner DNI. Hay personas que les gusta que le hagamos boletas con su DNI."

**Requiere backend:** Sí (campo ya existe parcialmente en `clientesApi.ts` como `c.dni`)
**Estado:** Verificar si el backend ya lo soporta. Si sí, solo agregar el campo al formulario.

### Sección de Productos / Punto de Caja
**Qué dijo el cliente:**
> "Si llegamos a poner un escáner, lo ideal sería también un punto de caja"
> Asistente: "Cada vez que escanea los resto. Ahorita nosotros lo manejamos todo por Excel"

**Estado:** El usuario dijo "aun no lo implementes, lo pensaré para después"

### Escáner QR físico
**Qué dijo el cliente:**
> "Podríamos comprar una maquinita para el escaneo del código QR"

**Estado:** Decisión de hardware, no de software. La cámara web ya funciona como alternativa.
