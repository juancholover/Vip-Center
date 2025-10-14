# 🎨 Frontend - Sistema de Historial de Accesos

## ✅ Integración Completada

He integrado completamente el sistema de historial de accesos en el frontend de React. Todo está listo para usar.

---

## 📁 Archivos Creados

### 1. **API Service**
**Archivo:** `src/api/historialApi.ts`

```typescript
// Interfaces TypeScript
export interface HistorialAccesoDTO {
  id: number;
  username: string;
  tipoEvento: string;
  descripcionEvento: string;
  ipAddress: string;
  navegador: string;
  sistemaOperativo: string;
  exitoso: boolean;
  fechaHora: string;
  detalles?: string;
}

export interface PaginaHistorial {
  content: HistorialAccesoDTO[];
  pageable: { ... };
  totalElements: number;
  totalPages: number;
  ...
}

// Método API
historialApi.obtenerMiHistorial(page, size)
```

---

### 2. **Componente React**
**Archivo:** `src/pages/Empleados/MiHistorial.tsx`

**Características:**
- ✅ **Diseño profesional** con dark theme (matching tu sistema)
- ✅ **Animaciones** con Framer Motion
- ✅ **Estadísticas rápidas** (Total, Exitosos, Fallidos, Logins)
- ✅ **Timeline de eventos** con iconos y colores por tipo
- ✅ **Paginación completa** (anterior/siguiente)
- ✅ **Formato de fechas inteligente** ("Hace 2h", "Hace 3d", etc.)
- ✅ **Loading skeleton** mientras carga datos
- ✅ **Responsive design** para móviles
- ✅ **Integración con notificaciones** (errores via toast)

**Tipos de Eventos Soportados:**
- 🟢 `LOGIN` → Icono CheckCircle verde
- 🔵 `LOGOUT` → Icono XCircle azul
- 🔴 `LOGIN_FAILED` → Icono AlertTriangle rojo
- 🟡 `PASSWORD_CHANGE` → Icono Shield amarillo
- 🟠 `PASSWORD_RESET` → Icono Shield naranja
- 🟣 `PROFILE_UPDATE` → Icono Monitor morado

---

### 3. **Rutas Actualizadas**
**Archivo:** `src/App.tsx`

```tsx
// Nueva ruta agregada (disponible para TODOS los usuarios autenticados)
<Route path="mi-historial" element={<MiHistorial />} />
```

---

### 4. **Navegación Actualizada**
**Archivo:** `src/components/layout/Topbar.tsx`

```tsx
// Nuevo enlace en el navbar (después de "Mi Perfil")
<NavLink to="/mi-historial">
  Mi Historial
</NavLink>
```

- 🎨 Color: **Teal** (`text-teal-400` cuando activo)
- 👥 Acceso: **Todos los usuarios autenticados**

---

## 🎯 Cómo Usar

### 1. **Acceso desde el Frontend**

1. Inicia sesión en la aplicación
2. Ve al navbar superior
3. Haz clic en **"Mi Historial"**
4. Verás tu historial de accesos completo

### 2. **Navegación**

- **Estadísticas arriba**: Total eventos, exitosos, fallidos, logins
- **Timeline central**: Lista de eventos más recientes
- **Paginación abajo**: Navega por páginas si tienes muchos eventos

### 3. **Información Mostrada en Cada Evento**

Cada evento muestra:
- 🎯 **Icono y tipo** (Login, Logout, etc.)
- ⏰ **Fecha relativa** ("Hace 2h") con tooltip de fecha completa
- 🌐 **IP Address** desde donde ocurrió
- 💻 **Navegador** (Chrome, Firefox, etc.)
- 🖥️ **Sistema Operativo** (Windows, Linux, macOS, etc.)
- ✅/❌ **Estado** (Exitoso / Fallido)
- 📝 **Detalles adicionales** (si existen)

---

## 🎨 Diseño Visual

### Paleta de Colores

```css
/* Background */
bg-gradient-to-br from-[#0A0E12] via-[#0F1318] to-[#0A0E12]

/* Cards */
bg-slate-800/40 backdrop-blur-sm
border-slate-700/50

/* Estados */
- Exitoso: border-l-green-500 bg-green-500/5
- Fallido: border-l-red-500 bg-red-500/5
- Login: border-l-green-500
- Logout: border-l-blue-500
- Password Change: border-l-yellow-500
```

### Iconos (Lucide React)

- `Shield` → Header y cambios de seguridad
- `Clock` → Fechas
- `Monitor` → Navegador
- `MapPin` → IP
- `Globe` → Sistema Operativo
- `CheckCircle` → Éxito
- `XCircle` → Logout
- `AlertTriangle` → Fallos

---

## 🧪 Testing en Desarrollo

### 1. **Probar con Backend Local**

```bash
# 1. Inicia el backend
cd vip-center-backend
./mvnw spring-boot:run

# 2. Inicia el frontend
cd vip-center-frontend
npm run dev

# 3. Abre http://localhost:5173
# 4. Inicia sesión con cualquier usuario
# 5. Ve a "Mi Historial"
```

### 2. **Generar Eventos de Prueba**

Para ver diferentes tipos de eventos:

```bash
# Login exitoso
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipgym.com","password":"Admin123*"}'

# Login fallido (genera evento LOGIN_FAILED)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipgym.com","password":"wrong"}'

# Cambiar contraseña (genera evento PASSWORD_CHANGE)
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"passwordActual":"Admin123*","passwordNueva":"NewPass123*"}'

# Logout (genera evento LOGOUT)
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

Después de cada comando, recarga `/mi-historial` y verás el nuevo evento.

---

## 📊 Ejemplo de Respuesta del Backend

```json
{
  "content": [
    {
      "id": 1,
      "username": "admin@vipgym.com",
      "tipoEvento": "LOGIN",
      "descripcionEvento": "Inicio de sesión exitoso",
      "ipAddress": "192.168.1.100",
      "navegador": "Chrome",
      "sistemaOperativo": "Windows",
      "exitoso": true,
      "fechaHora": "2025-10-14T10:30:00",
      "detalles": null
    },
    {
      "id": 2,
      "username": "admin@vipgym.com",
      "tipoEvento": "LOGIN_FAILED",
      "descripcionEvento": "Intento de inicio de sesión fallido",
      "ipAddress": "192.168.1.100",
      "navegador": "Chrome",
      "sistemaOperativo": "Windows",
      "exitoso": false,
      "fechaHora": "2025-10-14T10:25:00",
      "detalles": "Credenciales incorrectas"
    },
    {
      "id": 3,
      "username": "admin@vipgym.com",
      "tipoEvento": "PASSWORD_CHANGE",
      "descripcionEvento": "Cambio de contraseña",
      "ipAddress": "192.168.1.100",
      "navegador": "Chrome",
      "sistemaOperativo": "Windows",
      "exitoso": true,
      "fechaHora": "2025-10-14T09:15:00",
      "detalles": null
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

## 🔧 Personalización

### Cambiar Cantidad de Eventos por Página

En `MiHistorial.tsx`:

```tsx
const [size] = useState(15); // 👈 Cambia este número
```

Opciones recomendadas: `10`, `15`, `20`, `25`, `50`

---

### Agregar Filtros

Si quieres agregar filtros por tipo de evento:

```tsx
const [filtroTipo, setFiltroTipo] = useState<string>("");

// En el useEffect
useEffect(() => {
  cargarHistorial();
}, [page, filtroTipo]); // 👈 Agregar dependencia

// Modificar la llamada API (si el backend soporta filtros)
const data = await historialApi.obtenerMiHistorial(page, size, filtroTipo);
```

Después agregar un `<select>` en el UI:

```tsx
<select 
  value={filtroTipo} 
  onChange={(e) => setFiltroTipo(e.target.value)}
  className="..."
>
  <option value="">Todos</option>
  <option value="LOGIN">Solo Logins</option>
  <option value="LOGIN_FAILED">Solo Fallidos</option>
  <option value="PASSWORD_CHANGE">Cambios de Contraseña</option>
</select>
```

---

### Agregar Búsqueda por Fecha

Agregar state:

```tsx
const [fechaInicio, setFechaInicio] = useState("");
const [fechaFin, setFechaFin] = useState("");
```

Modificar API (si backend soporta):

```tsx
const data = await historialApi.obtenerMiHistorial(
  page, 
  size, 
  fechaInicio, 
  fechaFin
);
```

Agregar inputs:

```tsx
<input 
  type="date" 
  value={fechaInicio}
  onChange={(e) => setFechaInicio(e.target.value)}
/>
<input 
  type="date" 
  value={fechaFin}
  onChange={(e) => setFechaFin(e.target.value)}
/>
```

---

## 🚀 Próximas Mejoras Opcionales

### 1. **Exportar a CSV/Excel**

```tsx
const exportarCSV = () => {
  const csv = historial?.content.map(e => 
    `${e.fechaHora},${e.tipoEvento},${e.ipAddress},${e.navegador}`
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mi-historial.csv';
  a.click();
};
```

Agregar botón:

```tsx
<button onClick={exportarCSV}>
  Exportar CSV
</button>
```

---

### 2. **Gráfico de Actividad**

Instalar Recharts (si aún no está):

```bash
npm install recharts
```

Agregar gráfico de barras por día:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const datosGrafico = procesarParaGrafico(historial?.content);

<BarChart width={600} height={300} data={datosGrafico}>
  <XAxis dataKey="fecha" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="eventos" fill="#10b981" />
</BarChart>
```

---

### 3. **Alertas de Actividad Sospechosa**

```tsx
// Detectar múltiples fallos recientes
const fallosRecientes = historial?.content.filter(
  e => !e.exitoso && 
  new Date(e.fechaHora) > new Date(Date.now() - 3600000) // última hora
).length || 0;

{fallosRecientes >= 3 && (
  <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg">
    <AlertTriangle className="w-5 h-5 text-red-400 inline mr-2" />
    Detectamos {fallosRecientes} intentos fallidos en la última hora
  </div>
)}
```

---

### 4. **Detección de Nueva IP**

```tsx
// Agregar endpoint en backend
GET /api/auth/usuarios/me/ips-conocidas

// En el frontend
const { data: ipsConocidas } = await axios.get('/auth/usuarios/me/ips-conocidas');

const ipNueva = !ipsConocidas.includes(ultimoEvento.ipAddress);

{ipNueva && (
  <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg">
    <MapPin className="w-5 h-5 text-yellow-400 inline mr-2" />
    Acceso desde una IP nueva: {ultimoEvento.ipAddress}
  </div>
)}
```

---

## 📱 Responsive Design

El componente ya es responsive:

- **Desktop (>768px)**: 4 tarjetas de estadísticas en fila
- **Tablet (>640px)**: 2 tarjetas por fila
- **Mobile (<640px)**: 1 tarjeta por columna

Los eventos se adaptan automáticamente:

- En móvil: iconos más pequeños, texto condensado
- En desktop: información completa visible

---

## 🎯 Checklist de Integración

- [x] API Service creado (`historialApi.ts`)
- [x] Interfaces TypeScript definidas
- [x] Componente React creado (`MiHistorial.tsx`)
- [x] Ruta agregada en `App.tsx`
- [x] Enlace en navbar (`Topbar.tsx`)
- [x] Animaciones con Framer Motion
- [x] Manejo de errores con notificaciones
- [x] Paginación funcional
- [x] Estadísticas visuales
- [x] Loading skeleton
- [x] Diseño responsive
- [x] Iconos por tipo de evento
- [x] Formato de fechas amigable
- [x] Tooltip con fecha completa

---

## 🐛 Troubleshooting

### Error: "401 Unauthorized"

**Causa:** Token expirado o no enviado.

**Solución:** Verifica que `axiosClient.ts` esté enviando el token:

```typescript
// axiosClient.ts
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### Error: "Network Error"

**Causa:** Backend no está corriendo o CORS mal configurado.

**Solución:**
1. Verifica que el backend esté en `http://localhost:8080`
2. Verifica configuración CORS en `SecurityConfig.java`:

```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

---

### No se muestran eventos

**Causa:** No hay datos en la tabla `historial_acceso`.

**Solución:** Genera eventos haciendo login/logout varias veces, o inserta datos de prueba:

```sql
INSERT INTO historial_acceso 
  (usuario_id, username, tipo_evento, ip_address, user_agent, exitoso, fecha_hora)
VALUES 
  (1, 'admin@vipgym.com', 'LOGIN', '127.0.0.1', 
   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 
   true, NOW());
```

---

## ✅ Resumen Final

**Todo está integrado y listo para usar:**

1. ✅ **Backend** registra eventos automáticamente
2. ✅ **API Service** (`historialApi.ts`) consume el endpoint
3. ✅ **Componente React** (`MiHistorial.tsx`) muestra los datos
4. ✅ **Ruta** `/mi-historial` configurada
5. ✅ **Navbar** con enlace "Mi Historial"
6. ✅ **Diseño profesional** con animaciones
7. ✅ **Paginación** funcional
8. ✅ **Estadísticas** visuales

**Para probar:**
```bash
npm run dev
# Abre http://localhost:5173
# Inicia sesión
# Ve a "Mi Historial" en el navbar
```

**¡Listo para producción!** 🚀
