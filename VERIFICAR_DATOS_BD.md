# 🔍 VERIFICAR DATOS EN BASE DE DATOS

## ¿Por qué no aparecen datos en Reportes?

Si ves **S/ 0.00** en todas las métricas, es porque **NO hay registros** en tu base de datos para el período seleccionado (octubre 2025).

---

## 📊 Queries SQL para Verificar Datos

Ejecuta estos comandos en tu MySQL para verificar si tienes datos:

### 1. Verificar Pagos en Octubre 2025
```sql
SELECT 
    COUNT(*) as total_pagos,
    SUM(monto_final) as total_ingresos,
    estado,
    DATE_FORMAT(fecha_registro, '%Y-%m') as periodo
FROM pagos
WHERE YEAR(fecha_registro) = 2025 AND MONTH(fecha_registro) = 10
GROUP BY estado, periodo;
```

**Resultado esperado:**
```
total_pagos | total_ingresos | estado   | periodo
------------|----------------|----------|----------
5           | 750.00         | approved | 2025-10
2           | 300.00         | pending  | 2025-10
```

Si devuelve **0 filas** → No hay datos en octubre 2025

---

### 2. Verificar Rango de Fechas de Pagos
```sql
SELECT 
    MIN(fecha_registro) as primer_pago,
    MAX(fecha_registro) as ultimo_pago,
    COUNT(*) as total_pagos
FROM pagos;
```

**Esto te dirá:**
- ¿Cuándo fue el primer pago?
- ¿Cuándo fue el último pago?
- ¿Cuántos pagos hay en total?

---

### 3. Ver Últimos 10 Pagos
```sql
SELECT 
    id,
    monto_final,
    estado,
    metodo_pago,
    fecha_registro,
    DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha
FROM pagos
ORDER BY fecha_registro DESC
LIMIT 10;
```

---

## ✅ SOLUCIÓN 1: Insertar Datos de Prueba

Si **NO hay datos**, puedes crear pagos de prueba para octubre 2025:

```sql
-- Insertar pagos de prueba en OCTUBRE 2025
INSERT INTO pagos (
    cliente_id, 
    membresia_id, 
    monto_final, 
    estado, 
    fecha_registro, 
    metodo_pago,
    created_at
) VALUES 
-- Semana 1
(1, 1, 150.00, 'approved', '2025-10-01 10:30:00', 'MERCADOPAGO', NOW()),
(2, 1, 150.00, 'approved', '2025-10-02 11:45:00', 'EFECTIVO', NOW()),
(3, 2, 80.00, 'approved', '2025-10-03 14:20:00', 'MERCADOPAGO', NOW()),

-- Semana 2
(4, 1, 150.00, 'approved', '2025-10-08 09:15:00', 'EFECTIVO', NOW()),
(5, 3, 200.00, 'approved', '2025-10-09 16:30:00', 'MERCADOPAGO', NOW()),
(6, 2, 80.00, 'pending', '2025-10-10 12:00:00', 'MERCADOPAGO', NOW()),

-- Semana 3
(7, 1, 150.00, 'approved', '2025-10-15 10:45:00', 'EFECTIVO', NOW()),
(8, 2, 80.00, 'approved', '2025-10-16 13:20:00', 'MERCADOPAGO', NOW()),
(9, 3, 200.00, 'cancelled', '2025-10-17 15:00:00', 'MERCADOPAGO', NOW()),

-- Semana 4
(10, 1, 150.00, 'approved', '2025-10-22 11:30:00', 'EFECTIVO', NOW()),
(11, 2, 80.00, 'approved', '2025-10-23 14:15:00', 'MERCADOPAGO', NOW()),
(12, 1, 150.00, 'pending', '2025-10-24 16:45:00', 'MERCADOPAGO', NOW());
```

**Resultado esperado:**
- Total Ingresos: **S/ 1,620.00**
- Pagos Aprobados: **S/ 1,290.00** (9 pagos)
- Pagos Pendientes: **S/ 230.00** (2 pagos)
- Pagos Cancelados: **S/ 200.00** (1 pago)

---

## ✅ SOLUCIÓN 2: Cambiar el Mes/Año en el Selector

Si tienes pagos en **otros meses** (ejemplo: septiembre 2025), cambia el selector:

1. Ve a **Reportes**
2. Cambia el mes a **septiembre** o el mes donde SÍ tengas datos
3. Los reportes se actualizarán automáticamente

---

## 🧪 Verificar en el Frontend

Después de insertar datos, ejecuta en la **consola del navegador** (F12):

```javascript
// Probar endpoint de ingresos
fetch('http://localhost:8080/api/reportes/ingresos/mensual?anio=2025&mes=10', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Ingresos Octubre 2025:', data);
  console.log('💰 Total:', data.totalIngresos);
  console.log('📦 Transacciones:', data.totalTransacciones);
})
.catch(err => console.error('❌ Error:', err));
```

**Respuesta esperada (CON datos):**
```javascript
📊 Ingresos Octubre 2025: {
  anio: 2025,
  mes: 10,
  nombreMes: "Octubre",
  totalIngresos: 1620.00,
  totalTransacciones: 12,
  ingresosPorEstado: {
    approved: 1290.00,
    pending: 230.00,
    cancelled: 200.00
  },
  desglosePorMetodo: [...]
}
```

**Respuesta esperada (SIN datos):**
```javascript
📊 Ingresos Octubre 2025: {
  anio: 2025,
  mes: 10,
  nombreMes: "Octubre",
  totalIngresos: 0,
  totalTransacciones: 0,
  ingresosPorEstado: {
    approved: 0,
    pending: 0,
    cancelled: 0
  },
  desglosePorMetodo: []
}
```

---

## 📝 Resumen

### ¿Por qué no hay datos?

✅ **El código está correcto** (sin errores)  
❌ **NO hay registros en la tabla `pagos` para octubre 2025**

### Soluciones:

1. **Insertar datos de prueba** con el SQL de arriba
2. **Cambiar el mes** en el selector si tienes datos en otro período
3. **Crear pagos reales** desde el sistema (módulo de Pagos)

---

## 🎯 Próximos Pasos

1. **Ejecuta las queries SQL** para verificar datos
2. **Si no hay datos**: Ejecuta el INSERT para crear pagos de prueba
3. **Refresca la página** de Reportes (F5)
4. **Verifica que los valores cambien** de S/ 0.00 a valores reales

¿Necesitas ayuda ejecutando las queries o insertando datos? 🚀
