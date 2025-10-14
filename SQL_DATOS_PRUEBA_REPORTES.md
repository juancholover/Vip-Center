# 🗄️ Script SQL: Insertar Datos de Prueba para Reportes

## 📋 Problema Actual

La página de Reportes muestra **S/ 0.00** en todas las métricas porque **NO hay datos de pagos** en la base de datos para el período seleccionado (Octubre 2025).

---

## ✅ Solución: Insertar Datos de Prueba

### Paso 1: Verificar Datos Existentes

Primero, verifica si ya tienes pagos en tu base de datos:

```sql
-- Ver todos los pagos existentes
SELECT 
  id,
  cliente_id,
  monto,
  metodo_pago,
  estado,
  DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha,
  YEAR(fecha_registro) as anio,
  MONTH(fecha_registro) as mes
FROM pagos
ORDER BY fecha_registro DESC
LIMIT 20;
```

**Si no hay resultados:** Necesitas crear pagos de prueba.

---

### Paso 2: Verificar que Tienes Clientes

Los pagos necesitan estar asociados a clientes existentes:

```sql
-- Ver clientes existentes
SELECT 
  id,
  nombre_completo,
  telefono,
  estado
FROM clientes
LIMIT 10;
```

**Si NO tienes clientes:** Ejecuta primero el script de clientes (ver abajo).

---

### Paso 3: Verificar que Tienes Membresías

Los pagos pueden estar asociados a membresías:

```sql
-- Ver membresías existentes
SELECT 
  id,
  codigo,
  nombre,
  precio,
  activo
FROM membresias
WHERE activo = TRUE;
```

**Si NO tienes membresías:** Ejecuta primero el script de membresías (ver abajo).

---

## 📝 Script Completo: Datos de Prueba

### 1. Crear Clientes de Prueba (si no existen)

```sql
-- Insertar 10 clientes de prueba
INSERT INTO clientes (nombre, apellido, nombre_completo, telefono, dni, email, estado, fecha_registro, qr_acceso) VALUES
('Juan', 'Pérez', 'Juan Pérez', '987654321', '12345678', 'juan@email.com', 'activo', '2025-01-15', UUID()),
('María', 'González', 'María González', '987654322', '23456789', 'maria@email.com', 'activo', '2025-02-10', UUID()),
('Carlos', 'Rodríguez', 'Carlos Rodríguez', '987654323', '34567890', 'carlos@email.com', 'activo', '2025-03-05', UUID()),
('Ana', 'Martínez', 'Ana Martínez', '987654324', '45678901', 'ana@email.com', 'activo', '2025-04-12', UUID()),
('Luis', 'López', 'Luis López', '987654325', '56789012', 'luis@email.com', 'vencido', '2025-05-08', UUID()),
('Carmen', 'García', 'Carmen García', '987654326', '67890123', 'carmen@email.com', 'activo', '2025-06-20', UUID()),
('Pedro', 'Sánchez', 'Pedro Sánchez', '987654327', '78901234', 'pedro@email.com', 'activo', '2025-07-15', UUID()),
('Laura', 'Díaz', 'Laura Díaz', '987654328', '89012345', 'laura@email.com', 'activo', '2025-08-22', UUID()),
('Jorge', 'Torres', 'Jorge Torres', '987654329', '90123456', 'jorge@email.com', 'sin_membresia', '2025-09-10', UUID()),
('Sofía', 'Flores', 'Sofía Flores', '987654330', '01234567', 'sofia@email.com', 'activo', '2025-10-01', UUID());
```

### 2. Crear Membresías de Prueba (si no existen)

```sql
-- Insertar planes de membresía
INSERT INTO membresias (codigo, nombre, duracion_dias, precio, precio_efectivo, tiene_descuento, porcentaje_descuento, color, activo, descripcion) VALUES
('PLAN-MENSUAL', 'Plan Mensual', 30, 120.00, 120.00, FALSE, 0, '#22c55e', TRUE, 'Acceso ilimitado por 30 días'),
('PLAN-TRIMESTRAL', 'Plan Trimestral', 90, 300.00, 270.00, TRUE, 10, '#3b82f6', TRUE, 'Acceso ilimitado por 90 días con 10% descuento'),
('PLAN-SEMESTRAL', 'Plan Semestral', 180, 600.00, 510.00, TRUE, 15, '#8b5cf6', TRUE, 'Acceso ilimitado por 180 días con 15% descuento'),
('PLAN-ANUAL', 'Plan Anual', 365, 1200.00, 960.00, TRUE, 20, '#f59e0b', TRUE, 'Acceso ilimitado por 365 días con 20% descuento');
```

### 3. Insertar Pagos de Prueba para 2025

```sql
-- Pagos de Enero a Octubre 2025
-- Asumiendo que los clientes tienen IDs del 1 al 10 y membresías del 1 al 4

-- ENERO 2025 (5 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(1, 1, 120.00, 'yape', 'approved', '2025-01-05 10:30:00', '2025-01-05 10:31:00'),
(2, 2, 270.00, 'tarjeta', 'approved', '2025-01-10 14:20:00', '2025-01-10 14:22:00'),
(3, 1, 120.00, 'efectivo', 'approved', '2025-01-15 09:15:00', '2025-01-15 09:15:00'),
(4, 3, 510.00, 'yape', 'approved', '2025-01-20 16:45:00', '2025-01-20 16:46:00'),
(5, 1, 120.00, 'yape', 'pending', '2025-01-25 11:00:00', NULL);

-- FEBRERO 2025 (6 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(6, 1, 120.00, 'yape', 'approved', '2025-02-03 10:00:00', '2025-02-03 10:01:00'),
(7, 2, 270.00, 'tarjeta', 'approved', '2025-02-08 15:30:00', '2025-02-08 15:32:00'),
(8, 1, 120.00, 'efectivo', 'approved', '2025-02-12 12:00:00', '2025-02-12 12:00:00'),
(9, 1, 120.00, 'yape', 'approved', '2025-02-18 09:45:00', '2025-02-18 09:46:00'),
(10, 4, 960.00, 'tarjeta', 'approved', '2025-02-22 14:15:00', '2025-02-22 14:17:00'),
(1, 1, 120.00, 'yape', 'cancelled', '2025-02-28 17:00:00', NULL);

-- MARZO 2025 (7 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(2, 1, 120.00, 'yape', 'approved', '2025-03-02 11:30:00', '2025-03-02 11:31:00'),
(3, 2, 270.00, 'tarjeta', 'approved', '2025-03-07 16:00:00', '2025-03-07 16:02:00'),
(4, 1, 120.00, 'efectivo', 'approved', '2025-03-11 10:15:00', '2025-03-11 10:15:00'),
(5, 1, 120.00, 'yape', 'approved', '2025-03-15 13:45:00', '2025-03-15 13:46:00'),
(6, 3, 510.00, 'tarjeta', 'approved', '2025-03-19 09:30:00', '2025-03-19 09:32:00'),
(7, 1, 120.00, 'yape', 'approved', '2025-03-23 15:00:00', '2025-03-23 15:01:00'),
(8, 1, 120.00, 'yape', 'pending', '2025-03-28 12:30:00', NULL);

-- ABRIL 2025 (8 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(9, 1, 120.00, 'yape', 'approved', '2025-04-01 10:00:00', '2025-04-01 10:01:00'),
(10, 2, 270.00, 'tarjeta', 'approved', '2025-04-05 14:30:00', '2025-04-05 14:32:00'),
(1, 1, 120.00, 'efectivo', 'approved', '2025-04-09 11:15:00', '2025-04-09 11:15:00'),
(2, 1, 120.00, 'yape', 'approved', '2025-04-13 16:45:00', '2025-04-13 16:46:00'),
(3, 4, 960.00, 'tarjeta', 'approved', '2025-04-17 09:00:00', '2025-04-17 09:02:00'),
(4, 1, 120.00, 'yape', 'approved', '2025-04-21 13:30:00', '2025-04-21 13:31:00'),
(5, 1, 120.00, 'yape', 'cancelled', '2025-04-25 15:00:00', NULL),
(6, 1, 120.00, 'efectivo', 'approved', '2025-04-28 10:45:00', '2025-04-28 10:45:00');

-- MAYO 2025 (9 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(7, 1, 120.00, 'yape', 'approved', '2025-05-02 11:00:00', '2025-05-02 11:01:00'),
(8, 2, 270.00, 'tarjeta', 'approved', '2025-05-06 15:30:00', '2025-05-06 15:32:00'),
(9, 1, 120.00, 'efectivo', 'approved', '2025-05-10 12:15:00', '2025-05-10 12:15:00'),
(10, 1, 120.00, 'yape', 'approved', '2025-05-14 09:45:00', '2025-05-14 09:46:00'),
(1, 3, 510.00, 'tarjeta', 'approved', '2025-05-18 14:00:00', '2025-05-18 14:02:00'),
(2, 1, 120.00, 'yape', 'approved', '2025-05-22 10:30:00', '2025-05-22 10:31:00'),
(3, 1, 120.00, 'yape', 'approved', '2025-05-26 16:00:00', '2025-05-26 16:01:00'),
(4, 1, 120.00, 'efectivo', 'pending', '2025-05-29 13:00:00', NULL),
(5, 2, 270.00, 'tarjeta', 'approved', '2025-05-31 11:45:00', '2025-05-31 11:47:00');

-- JUNIO 2025 (10 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(6, 1, 120.00, 'yape', 'approved', '2025-06-03 10:15:00', '2025-06-03 10:16:00'),
(7, 2, 270.00, 'tarjeta', 'approved', '2025-06-07 14:45:00', '2025-06-07 14:47:00'),
(8, 1, 120.00, 'efectivo', 'approved', '2025-06-11 11:30:00', '2025-06-11 11:30:00'),
(9, 1, 120.00, 'yape', 'approved', '2025-06-15 09:00:00', '2025-06-15 09:01:00'),
(10, 4, 960.00, 'tarjeta', 'approved', '2025-06-19 16:15:00', '2025-06-19 16:17:00'),
(1, 1, 120.00, 'yape', 'approved', '2025-06-23 12:45:00', '2025-06-23 12:46:00'),
(2, 1, 120.00, 'yape', 'cancelled', '2025-06-27 15:30:00', NULL),
(3, 1, 120.00, 'efectivo', 'approved', '2025-06-29 10:00:00', '2025-06-29 10:00:00'),
(4, 3, 510.00, 'tarjeta', 'approved', '2025-06-30 14:00:00', '2025-06-30 14:02:00'),
(5, 1, 120.00, 'yape', 'approved', '2025-06-30 17:30:00', '2025-06-30 17:31:00');

-- JULIO 2025 (11 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(6, 1, 120.00, 'yape', 'approved', '2025-07-02 11:00:00', '2025-07-02 11:01:00'),
(7, 2, 270.00, 'tarjeta', 'approved', '2025-07-06 15:30:00', '2025-07-06 15:32:00'),
(8, 1, 120.00, 'efectivo', 'approved', '2025-07-10 12:15:00', '2025-07-10 12:15:00'),
(9, 1, 120.00, 'yape', 'approved', '2025-07-14 09:45:00', '2025-07-14 09:46:00'),
(10, 1, 120.00, 'yape', 'approved', '2025-07-18 14:00:00', '2025-07-18 14:01:00'),
(1, 1, 120.00, 'tarjeta', 'approved', '2025-07-22 10:30:00', '2025-07-22 10:32:00'),
(2, 3, 510.00, 'yape', 'approved', '2025-07-26 16:00:00', '2025-07-26 16:01:00'),
(3, 1, 120.00, 'efectivo', 'approved', '2025-07-28 13:00:00', '2025-07-28 13:00:00'),
(4, 1, 120.00, 'yape', 'pending', '2025-07-30 11:45:00', NULL),
(5, 2, 270.00, 'tarjeta', 'approved', '2025-07-31 15:15:00', '2025-07-31 15:17:00'),
(6, 1, 120.00, 'yape', 'approved', '2025-07-31 18:00:00', '2025-07-31 18:01:00');

-- AGOSTO 2025 (12 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(7, 1, 120.00, 'yape', 'approved', '2025-08-01 10:00:00', '2025-08-01 10:01:00'),
(8, 2, 270.00, 'tarjeta', 'approved', '2025-08-05 14:30:00', '2025-08-05 14:32:00'),
(9, 1, 120.00, 'efectivo', 'approved', '2025-08-09 11:15:00', '2025-08-09 11:15:00'),
(10, 1, 120.00, 'yape', 'approved', '2025-08-13 16:45:00', '2025-08-13 16:46:00'),
(1, 4, 960.00, 'tarjeta', 'approved', '2025-08-17 09:00:00', '2025-08-17 09:02:00'),
(2, 1, 120.00, 'yape', 'approved', '2025-08-21 13:30:00', '2025-08-21 13:31:00'),
(3, 1, 120.00, 'yape', 'approved', '2025-08-25 15:00:00', '2025-08-25 15:01:00'),
(4, 1, 120.00, 'efectivo', 'approved', '2025-08-27 10:45:00', '2025-08-27 10:45:00'),
(5, 3, 510.00, 'tarjeta', 'cancelled', '2025-08-29 14:00:00', NULL),
(6, 1, 120.00, 'yape', 'approved', '2025-08-30 11:30:00', '2025-08-30 11:31:00'),
(7, 2, 270.00, 'tarjeta', 'approved', '2025-08-31 16:15:00', '2025-08-31 16:17:00'),
(8, 1, 120.00, 'yape', 'approved', '2025-08-31 18:45:00', '2025-08-31 18:46:00');

-- SEPTIEMBRE 2025 (13 pagos)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(9, 1, 120.00, 'yape', 'approved', '2025-09-02 10:30:00', '2025-09-02 10:31:00'),
(10, 2, 270.00, 'tarjeta', 'approved', '2025-09-06 14:00:00', '2025-09-06 14:02:00'),
(1, 1, 120.00, 'efectivo', 'approved', '2025-09-10 11:45:00', '2025-09-10 11:45:00'),
(2, 1, 120.00, 'yape', 'approved', '2025-09-14 09:15:00', '2025-09-14 09:16:00'),
(3, 1, 120.00, 'yape', 'approved', '2025-09-18 15:30:00', '2025-09-18 15:31:00'),
(4, 3, 510.00, 'tarjeta', 'approved', '2025-09-22 12:00:00', '2025-09-22 12:02:00'),
(5, 1, 120.00, 'yape', 'approved', '2025-09-26 16:45:00', '2025-09-26 16:46:00'),
(6, 1, 120.00, 'efectivo', 'approved', '2025-09-28 10:00:00', '2025-09-28 10:00:00'),
(7, 1, 120.00, 'yape', 'pending', '2025-09-29 13:30:00', NULL),
(8, 2, 270.00, 'tarjeta', 'approved', '2025-09-30 11:15:00', '2025-09-30 11:17:00'),
(9, 1, 120.00, 'yape', 'approved', '2025-09-30 14:45:00', '2025-09-30 14:46:00'),
(10, 4, 960.00, 'tarjeta', 'approved', '2025-09-30 17:00:00', '2025-09-30 17:02:00'),
(1, 1, 120.00, 'yape', 'cancelled', '2025-09-30 19:30:00', NULL);

-- OCTUBRE 2025 (14 pagos - mes actual)
INSERT INTO pagos (cliente_id, membresia_id, monto, metodo_pago, estado, fecha_registro, fecha_confirmacion) VALUES
(2, 1, 120.00, 'yape', 'approved', '2025-10-01 10:00:00', '2025-10-01 10:01:00'),
(3, 2, 270.00, 'tarjeta', 'approved', '2025-10-03 14:30:00', '2025-10-03 14:32:00'),
(4, 1, 120.00, 'efectivo', 'approved', '2025-10-05 11:15:00', '2025-10-05 11:15:00'),
(5, 1, 120.00, 'yape', 'approved', '2025-10-07 09:45:00', '2025-10-07 09:46:00'),
(6, 3, 510.00, 'tarjeta', 'approved', '2025-10-09 14:00:00', '2025-10-09 14:02:00'),
(7, 1, 120.00, 'yape', 'approved', '2025-10-11 10:30:00', '2025-10-11 10:31:00'),
(8, 1, 120.00, 'yape', 'approved', '2025-10-13 16:00:00', '2025-10-13 16:01:00'),
(9, 1, 120.00, 'efectivo', 'approved', '2025-10-14 09:00:00', '2025-10-14 09:00:00'),
(10, 4, 960.00, 'tarjeta', 'pending', '2025-10-14 11:30:00', NULL),
(1, 1, 120.00, 'yape', 'approved', '2025-10-14 13:45:00', '2025-10-14 13:46:00'),
(2, 2, 270.00, 'tarjeta', 'approved', '2025-10-14 15:00:00', '2025-10-14 15:02:00'),
(3, 1, 120.00, 'yape', 'cancelled', '2025-10-14 16:30:00', NULL),
(4, 1, 120.00, 'efectivo', 'approved', '2025-10-14 17:45:00', '2025-10-14 17:45:00'),
(5, 3, 510.00, 'tarjeta', 'approved', '2025-10-14 19:00:00', '2025-10-14 19:02:00');
```

---

## 🎯 Resumen de Datos Insertados

| Mes | Cantidad Pagos | Total Aprobados | Total Pendientes | Total Cancelados |
|-----|---------------|-----------------|------------------|------------------|
| Enero | 5 | S/ 1,020.00 | S/ 120.00 | S/ 0.00 |
| Febrero | 6 | S/ 1,590.00 | S/ 0.00 | S/ 120.00 |
| Marzo | 7 | S/ 1,260.00 | S/ 120.00 | S/ 0.00 |
| Abril | 8 | S/ 1,830.00 | S/ 0.00 | S/ 120.00 |
| Mayo | 9 | S/ 1,650.00 | S/ 120.00 | S/ 0.00 |
| Junio | 10 | S/ 2,340.00 | S/ 0.00 | S/ 120.00 |
| Julio | 11 | S/ 1,770.00 | S/ 120.00 | S/ 0.00 |
| Agosto | 12 | S/ 2,730.00 | S/ 0.00 | S/ 510.00 |
| Septiembre | 13 | S/ 2,850.00 | S/ 120.00 | S/ 120.00 |
| **Octubre** | **14** | **S/ 1,930.00** | **S/ 960.00** | **S/ 120.00** |

---

## 📝 Cómo Ejecutar el Script

### Opción 1: MySQL Workbench
1. Abre MySQL Workbench
2. Conéctate a tu base de datos
3. Copia y pega el script completo
4. Haz clic en el botón ⚡ (Execute)

### Opción 2: Línea de Comandos
```bash
mysql -u root -p vipcenter_db < datos_prueba.sql
```

### Opción 3: phpMyAdmin
1. Abre phpMyAdmin
2. Selecciona tu base de datos
3. Ve a la pestaña SQL
4. Pega el script y haz clic en "Go"

---

## ✅ Verificación

Después de ejecutar el script, verifica que los datos se insertaron:

```sql
-- Ver resumen de pagos por mes en 2025
SELECT 
  YEAR(fecha_registro) as anio,
  MONTH(fecha_registro) as mes,
  COUNT(*) as total_pagos,
  SUM(CASE WHEN estado = 'approved' THEN monto ELSE 0 END) as ingresos_aprobados,
  SUM(CASE WHEN estado = 'pending' THEN monto ELSE 0 END) as ingresos_pendientes,
  SUM(CASE WHEN estado = 'cancelled' THEN monto ELSE 0 END) as ingresos_cancelados
FROM pagos
WHERE YEAR(fecha_registro) = 2025
GROUP BY YEAR(fecha_registro), MONTH(fecha_registro)
ORDER BY mes;
```

**Resultado esperado para Octubre:**
```
anio | mes | total_pagos | ingresos_aprobados | ingresos_pendientes | ingresos_cancelados
-----|-----|-------------|--------------------|--------------------|--------------------
2025 | 10  |     14      |     1930.00        |       960.00       |       120.00
```

---

## 🔄 Refrescar el Frontend

Después de insertar los datos:

1. Ve al navegador
2. Presiona `Ctrl + R` para refrescar
3. O haz clic en el botón "🔄 Actualizar" en la página de Reportes
4. Verás los datos de Octubre 2025 actualizados

---

**Fecha:** 14 de octubre de 2025  
**Estado:** ✅ Listo para ejecutar  
**Total registros:** 10 clientes + 4 membresías + 95 pagos
