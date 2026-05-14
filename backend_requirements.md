# Requisitos de Backend — Cambios del Cliente

Estos son los cambios que necesitan soporte del **backend** para poder implementarse en el frontend.
Los cambios 1, 2 y 3 de `CAMBIOS_CLIENTE.md` son **solo frontend** y no necesitan nada del backend.

---

## 🟡 PENDIENTE — Control de Salida del Gimnasio

### Contexto
El cliente quiere saber quién está **actualmente dentro del gimnasio**. Hoy el QR registra entrada pero la gente no escanea al salir.

### Solución propuesta
1. **Nuevo campo** en la entidad `Asistencia`: `enGimnasio` (boolean, default: true al registrar entrada)
2. **Nuevo endpoint** `PATCH /api/asistencias/{id}/marcar-salida` — marca `enGimnasio = false` y registra `horaSalida`
3. **Endpoint consulta** `GET /api/asistencias/en-gimnasio` — lista de clientes actualmente dentro
4. **Job automático opcional**: Marcar como "salió" después de 5 horas sin actividad

### Prioridad
Baja — David dijo "no lo veo tan problemático". Implementar cuando lo solicite.

---

## 🟡 PENDIENTE — Campo DNI

### Contexto
> "Hay personas que les gusta que le hagamos boletas con su DNI"

### Lo que necesito saber
- ¿El campo `dni` ya existe en la entidad `Cliente` del backend?
- Si existe, ¿se incluye en los endpoints `GET /clientes` y `POST /clientes`?
- El frontend ya tiene referencia a `c.dni` en el buscador de Clientes, así que parece que ya está parcialmente implementado

### Si ya existe en el backend
Solo necesito agregar el campo DNI al formulario de registro (`ClienteForm.tsx`) y al flujo de pago. **No necesito cambio de backend.**

### Si NO existe
Necesito:
1. Campo `dni` (String, nullable, max 15 caracteres) en la entidad `Cliente`
2. Incluirlo en los DTOs de request/response
3. Migración de base de datos

---

## ✅ NO NECESITA BACKEND

Estos cambios son 100% frontend y ya los puedo implementar:
- Simplificar dashboard (quitar Tendencia Asistencia y Top Clientes)
- Renombrar "Sin Membresía" → "Vencido" (solo labels visuales)
- Cambiar "Clientes Activos" → "Clientes Matriculados" en Home
