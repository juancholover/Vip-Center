# 🔍 Guía de Debugging: Errores de Keys Duplicadas (13 y 15)

## 🚨 Problema Actual

Aparecen errores de React indicando keys duplicadas con valores `13` y `15`:

```
⚠️ Encountered two children with the same key, `13`
⚠️ Encountered two children with the same key, `15`
```

**Observación importante:** Los meses válidos van del 1 al 12. Los números 13 y 15 **NO son meses válidos**.

---

## 🔍 Pasos para Diagnosticar

### 1. Abrir DevTools del Navegador

1. Presiona `F12` o `Ctrl + Shift + I`
2. Ve a la pestaña **Console**
3. Refresca la página de Reportes (`Ctrl + R`)

### 2. Buscar estos logs en la consola:

```
🔍 DEBUG - Datos crudos del backend: [...]
🔍 DEBUG - Cantidad de reportes: X
✅ Reportes con meses válidos (1-12): Y
📊 Reportes únicos después de filtrar: [...]
📈 Chart data con IDs únicos: [...]
```

### 3. Revisar los datos

En la consola, expande el objeto que dice `🔍 DEBUG - Datos crudos del backend:`

Busca si hay objetos con:
- `mes: 13`
- `mes: 15`
- O cualquier `mes` > 12 o < 1

**Ejemplo de lo que deberías ver:**

```javascript
[
  { anio: 2025, mes: 1, nombreMes: "Enero", totalIngresos: 1500, ... },
  { anio: 2025, mes: 2, nombreMes: "Febrero", totalIngresos: 2000, ... },
  { anio: 2025, mes: 13, nombreMes: null, totalIngresos: 0, ... }, // ❌ INVÁLIDO!
  ...
]
```

---

## 🔍 Diagnóstico Basado en Resultados

### Caso A: Si ves `mes: 13` o `mes: 15` en los datos

**Problema:** El backend está devolviendo meses inválidos.

**Solución:** Necesitas corregir la query del backend.

#### Ubicación probable del problema:

En tu backend Spring Boot, busca el controlador/servicio que maneja:
```
GET /api/reportes/ingresos/anual?anio=2025
```

**Posibles causas:**

1. **Query SQL incorrecta** que genera meses > 12:
```sql
-- ❌ INCORRECTO: Puede generar más de 12 filas
SELECT 
  YEAR(fecha_registro) as anio,
  MONTH(fecha_registro) as mes,
  ...
FROM pagos
WHERE YEAR(fecha_registro) = 2025
GROUP BY YEAR(fecha_registro), MONTH(fecha_registro)
-- Si hay pagos en diferentes años, esto puede duplicar meses
```

2. **Join mal hecho** que duplica filas
3. **Loop que genera 15 meses** en lugar de 12

#### Cómo corregir:

```sql
-- ✅ CORRECTO: Forzar solo meses 1-12
SELECT 
  2025 as anio,
  meses.num as mes,
  CASE meses.num
    WHEN 1 THEN 'Enero'
    WHEN 2 THEN 'Febrero'
    ...
    WHEN 12 THEN 'Diciembre'
  END as nombreMes,
  COALESCE(SUM(p.monto), 0) as totalIngresos,
  COUNT(p.id) as totalTransacciones
FROM 
  (SELECT 1 as num UNION SELECT 2 UNION ... UNION SELECT 12) as meses
  LEFT JOIN pagos p ON MONTH(p.fecha_registro) = meses.num 
                    AND YEAR(p.fecha_registro) = 2025
GROUP BY meses.num
ORDER BY meses.num
```

---

### Caso B: Si NO ves `mes: 13` o `mes: 15`, pero el error persiste

**Problema:** Las keys duplicadas vienen de otro componente.

#### Verifica estos archivos:

1. **Clientes.tsx** - Puede estar generando keys del 1 al 15
2. **Home.tsx** - Dashboard con tarjetas
3. **Cualquier otro componente** que se esté renderizando

#### Cómo buscar:

En DevTools Console, cuando aparezca el error, haz clic en el link que dice `react-dom_client.js?v=194a4da2:5749`

React mostrará en el stack trace qué componente está causando el error.

---

## ✅ Validación Aplicada en Frontend

He agregado esta validación para filtrar meses inválidos:

```typescript
// ✅ VALIDACIÓN: Filtrar solo meses válidos (1-12) del backend
const reportesValidos = reportes.filter((r) => {
  const mesValido = r.mes >= 1 && r.mes <= 12;
  if (!mesValido) {
    console.warn(`⚠️ Mes inválido detectado: ${r.mes} en año ${r.anio}`);
  }
  return mesValido;
});
```

Si ves warnings `⚠️ Mes inválido detectado: 13` o `15`, **confirma que el problema está en el backend**.

---

## 🔧 Acciones Inmediatas

### Paso 1: Revisar logs
```
1. Abre DevTools (F12)
2. Ve a Console
3. Refresca página de Reportes
4. Busca líneas que digan "⚠️ Mes inválido detectado"
5. Toma captura de pantalla de los logs
```

### Paso 2: Revisar Network
```
1. Ve a la pestaña Network en DevTools
2. Filtra por XHR
3. Busca la petición a /api/reportes/ingresos/anual?anio=2025
4. Haz clic en ella
5. Ve a la pestaña Response
6. Verifica si hay objetos con mes: 13 o mes: 15
7. Toma captura de pantalla del Response
```

### Paso 3: Reportar hallazgos

Dime:
- ¿Viste advertencias de "Mes inválido detectado"?
- ¿Qué números de mes aparecen en el Response del backend?
- ¿Cuántos reportes devuelve el backend? (debería ser máximo 12)

---

## 🗄️ Verificación en Base de Datos

Si tienes acceso a MySQL, ejecuta:

```sql
-- Ver qué meses existen en la tabla pagos para 2025
SELECT 
  YEAR(fecha_registro) as anio,
  MONTH(fecha_registro) as mes,
  COUNT(*) as cantidad
FROM pagos
WHERE YEAR(fecha_registro) = 2025
GROUP BY YEAR(fecha_registro), MONTH(fecha_registro)
ORDER BY mes;
```

**Resultado esperado:**
```
anio | mes | cantidad
-----|-----|----------
2025 |  1  |    5
2025 |  2  |    3
2025 | 10  |   14
...
```

**Si ves `mes: 13` o superior:** Tu tabla `pagos` tiene datos corruptos o tu query está mal.

---

## 📝 Checklist de Depuración

- [ ] Abrí DevTools → Console
- [ ] Refresqué la página de Reportes
- [ ] Vi los logs que empiezan con 🔍 DEBUG
- [ ] Revisé si hay "⚠️ Mes inválido detectado"
- [ ] Fui a Network → XHR → /api/reportes/ingresos/anual
- [ ] Vi el Response completo
- [ ] Conté cuántos objetos devuelve (debe ser ≤ 12)
- [ ] Verifiqué que todos los `mes` estén entre 1 y 12

---

## 🎯 Próximos Pasos

Una vez que me digas qué ves en:
1. Los logs de la consola
2. El Response del backend

Podré ayudarte a:
- Corregir el backend si está enviando meses inválidos
- Identificar qué otro componente está causando las keys duplicadas
- Aplicar la solución definitiva

---

**Fecha:** 14 de octubre de 2025  
**Estado:** 🔍 Investigando  
**Prioridad:** 🔴 Alta
