# 🎨 FRONTEND - Sistema de Login con Cambio de Contraseña

## ✅ **ARCHIVOS MODIFICADOS/CREADOS**

### **Nuevos:**
1. ✅ `src/pages/Auth/ChangePassword.tsx` - Página de cambio obligatorio de contraseña
2. ✅ Guía de uso (este archivo)

### **Modificados:**
1. ✅ `src/api/authApi.ts` - Agregados endpoints y tipos TypeScript
2. ✅ `src/store/useAuthStore.ts` - Soporte para `debeCambiarPassword` + logout async
3. ✅ `src/pages/Auth/Login.tsx` - Detecta flag y redirige
4. ✅ `src/App.tsx` - Agregada ruta `/change-password`
5. ✅ `src/components/layout/Topbar.tsx` - Logout async

---

## 🔄 **FLUJO COMPLETO IMPLEMENTADO**

### **Caso 1: Primer Login (debe cambiar password)**

```
1. Usuario ingresa a /login
2. Ingresa credenciales (admin@gym.com / Admin123!)
3. Backend responde con debeCambiarPassword: true
4. useAuthStore guarda el flag
5. Login.tsx detecta flag y redirige a /change-password
6. Usuario ingresa nueva contraseña
7. ChangePassword.tsx envía POST /api/auth/change-password
8. Backend actualiza password y marca debeCambiarPassword = false
9. useAuthStore actualiza el flag localmente
10. Usuario es redirigido al dashboard
```

---

### **Caso 2: Login Normal (ya cambió password)**

```
1. Usuario ingresa a /login
2. Ingresa credenciales
3. Backend responde con debeCambiarPassword: false
4. Login.tsx redirige directamente a /
5. Usuario ve el dashboard
```

---

### **Caso 3: Cuenta Bloqueada**

```
1. Usuario ingresa credenciales incorrectas 5 veces
2. Backend responde con 403 + minutosRestantes
3. Login.tsx muestra mensaje:
   "Cuenta bloqueada por múltiples intentos. 
    Intente en 1440 minutos."
4. Usuario debe esperar o contactar admin para desbloqueo
```

---

### **Caso 4: Logout**

```
1. Usuario hace click en "Cerrar sesión"
2. Topbar.tsx ejecuta logout() async
3. Se envía POST /api/auth/logout (token a blacklist)
4. localStorage se limpia
5. Usuario es redirigido a /login
6. Intento de reusar token anterior → 401 Unauthorized
```

---

## 🎨 **INTERFAZ DE CAMBIO DE CONTRASEÑA**

### **Características:**
- ✅ Estilo consistente con el resto de la app
- ✅ Validaciones en frontend (mínimo 8 caracteres, coincidencia)
- ✅ Mensajes de error claros
- ✅ Estado de loading mientras procesa
- ✅ Tips de seguridad visibles
- ✅ No permite salir sin cambiar (ProtectedRoute)

---

## 🔧 **CONFIGURACIÓN DEL BACKEND**

Asegúrate que el backend esté corriendo en:
```
http://localhost:8080
```

Si usas otro puerto, actualiza `src/api/axiosClient.ts`:
```typescript
const axiosClient = axios.create({
  baseURL: "http://localhost:TU_PUERTO",
  // ...
});
```

---

## 🧪 **CÓMO PROBARLO**

### **PASO 1: Arrancar Backend**
```bash
cd d:\Vip-Center\VIP-Center-Backend
mvn spring-boot:run
```

### **PASO 2: Arrancar Frontend**
```bash
cd d:\Vip-Center\Vip-Center
npm install  # Si es primera vez
npm run dev
```

### **PASO 3: Probar Flujo Completo**

1. **Abrir navegador en**: http://localhost:5173

2. **Login inicial**:
   - Email: `admin@gym.com`
   - Password: `Admin123!`
   - Click "Iniciar sesión"

3. **Verás pantalla de cambio de contraseña**:
   - Ingresa nueva contraseña (ej: `MiPassword123!`)
   - Confirma la misma contraseña
   - Click "Cambiar Contraseña"

4. **Serás redirigido al dashboard** ✅

5. **Hacer logout**:
   - Click "Cerrar sesión" en Topbar

6. **Login con nueva contraseña**:
   - Email: `admin@gym.com`
   - Password: `MiPassword123!`
   - Ahora irás directo al dashboard (sin cambio)

---

## 🛠️ **DETALLES TÉCNICOS**

### **Store (Zustand)**

```typescript
interface AuthState {
  user: {
    email: string;
    nombreCompleto: string;
    roles: string[];
    debeCambiarPassword: boolean; // ⚠️ CLAVE
  } | null;
  // ...
  updateDebeCambiarPassword: (value: boolean) => void;
}
```

### **Tipos TypeScript**

```typescript
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  debeCambiarPassword: boolean; // ⚠️ CLAVE
  // ...
}
```

### **Endpoints Usados**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login inicial |
| `/api/auth/change-password` | POST | Cambio obligatorio |
| `/api/auth/update-password` | POST | Cambio voluntario |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/auth/me` | GET | Obtener perfil |
| `/api/auth/refresh` | POST | Renovar token |

---

## 🚨 **MANEJO DE ERRORES**

### **Login**

```typescript
// Ejemplo de manejo en Login.tsx
catch (err: unknown) {
  if (err.response?.status === 403) {
    // Cuenta bloqueada
    setError(`Cuenta bloqueada... ${minutosRestantes} min`);
  } else if (err.response?.status === 401) {
    // Credenciales incorrectas
    setError("Credenciales incorrectas");
  } else {
    // Error genérico
    setError("Error al iniciar sesión");
  }
}
```

### **Cambio de Password**

```typescript
// Validaciones frontend
if (nuevaPassword.length < 8) {
  setError("La contraseña debe tener al menos 8 caracteres");
  return;
}

if (nuevaPassword !== confirmarPassword) {
  setError("Las contraseñas no coinciden");
  return;
}
```

---

## 🎯 **PRÓXIMOS PASOS**

Una vez probado este flujo:

1. ✅ Login funciona
2. ✅ Cambio de contraseña funciona
3. ✅ Logout funciona
4. ✅ Bloqueo por intentos funciona

**Entonces puedes pasar a:**

### **B) EPIC 3: Gestión Avanzada de Clientes**
- Búsqueda por QR
- Filtros por estado (activo/vencido/sin membresía)
- Regeneración de QR
- Próximos a vencer

---

## 📚 **REFERENCIAS**

- Backend: `VIP-Center-Backend/EPIC2_SEGURIDAD_COMPLETADO.md`
- Pruebas: `VIP-Center-Backend/GUIA_PRUEBAS_EPIC2.md`
- API Docs: http://localhost:8080/swagger-ui.html (si configurado)

---

**Autor**: Sistema VIP Center Fit  
**Fecha**: Octubre 2025  
**Estado**: ✅ Frontend EPIC 2 Completado
