-- 🔍 VERIFICAR SI EXISTE EL TELÉFONO 932763227

-- 1. Buscar teléfono EXACTO
SELECT 
    id,
    nombre,
    apellido,
    nombre_completo,
    telefono,
    dni,
    email,
    estado,
    fecha_registro
FROM clientes
WHERE telefono = '932763227';

-- 2. Buscar teléfono con VARIACIONES (con código de país)
SELECT 
    id,
    nombre,
    apellido,
    nombre_completo,
    telefono,
    dni,
    email,
    estado,
    fecha_registro
FROM clientes
WHERE telefono LIKE '%932763227%'
   OR telefono LIKE '%32763227%';

-- 3. Buscar por NOMBRE (juu asds)
SELECT 
    id,
    nombre,
    apellido,
    nombre_completo,
    telefono,
    dni,
    email,
    estado,
    fecha_registro
FROM clientes
WHERE nombre LIKE '%juu%' 
   OR apellido LIKE '%asds%'
   OR nombre_completo LIKE '%juu%asds%';

-- 4. Ver TODOS los teléfonos parecidos
SELECT 
    id,
    nombre_completo,
    telefono,
    estado
FROM clientes
WHERE telefono LIKE '932%'
   OR telefono LIKE '%932763227%'
ORDER BY telefono;

-- 5. Contar cuántos clientes hay en total
SELECT COUNT(*) as total_clientes FROM clientes;

-- 6. Ver los últimos 10 clientes registrados
SELECT 
    id,
    nombre_completo,
    telefono,
    estado,
    fecha_registro
FROM clientes
ORDER BY fecha_registro DESC
LIMIT 10;
