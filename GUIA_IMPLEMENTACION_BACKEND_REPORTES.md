# 🚀 Guía de Implementación Backend - Sistema de Reportes

## 📋 ÍNDICE RÁPIDO

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Paso a Paso de Implementación](#paso-a-paso)
3. [Testing con cURL](#testing)
4. [Solución de Problemas](#problemas)

---

## 📊 RESUMEN EJECUTIVO

### ¿Qué vamos a implementar?

Un sistema completo de reportes con **5 endpoints REST** que permitirán al frontend visualizar:

- 💰 Ingresos mensuales y anuales
- 👥 Asistencias por cliente
- 🎫 Membresías más vendidas
- 📈 Comparativas mes actual vs anterior

### Archivos a Crear

| # | Archivo | Ubicación | Líneas |
|---|---------|-----------|--------|
| 1 | ReporteIngresosDTO.java | dto/ | 25 |
| 2 | ReporteAsistenciaClienteDTO.java | dto/ | 30 |
| 3 | ReporteMembresiaDTO.java | dto/ | 30 |
| 4 | ReporteComparativoDTO.java | dto/ | 25 |
| 5 | ReportesService.java | service/ | 350 |
| 6 | ReportesController.java | controller/ | 100 |

### Archivos a Modificar

| # | Archivo | Qué agregar |
|---|---------|-------------|
| 7 | PagoRepository.java | 2 métodos |
| 8 | AsistenciaRepository.java | 1 método con @Query |
| 9 | MembresiaRepository.java | 1 método con @Query |

**Total: 6 archivos nuevos + 3 modificados**

---

## 🔨 PASO A PASO

### 📁 PASO 1: Crear DTOs (4 archivos)

#### 1.1 ReporteIngresosDTO.java

**Ubicación:** `src/main/java/com/gimnasio/fit/dto/ReporteIngresosDTO.java`

```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteIngresosDTO {
    private String periodo;           // "Enero 2025", "2025-Q1", etc.
    private Double totalIngresos;
    private Integer cantidadPagos;
    private Double promedioTicket;
    private Double ingresosAprobados;
    private Double ingresosPendientes;
    private Double ingresosRechazados;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
```

✅ **Verificar:**
- Importaciones correctas
- Anotaciones Lombok presentes
- 9 campos declarados

---

#### 1.2 ReporteAsistenciaClienteDTO.java

**Ubicación:** `src/main/java/com/gimnasio/fit/dto/ReporteAsistenciaClienteDTO.java`

```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteAsistenciaClienteDTO {
    private Integer clienteId;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private Integer totalAsistencias;
    private LocalDate primeraAsistencia;
    private LocalDate ultimaAsistencia;
    private Double promedioAsistenciasMes;
    private String estadoMembresia;
    private LocalDate fechaVencimiento;
}
```

✅ **Verificar:**
- 10 campos declarados
- Tipos correctos (Integer, String, LocalDate, Double)

---

#### 1.3 ReporteMembresiaDTO.java

**Ubicación:** `src/main/java/com/gimnasio/fit/dto/ReporteMembresiaDTO.java`

```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMembresiaDTO {
    private Long membresiaId;
    private String nombreMembresia;
    private Double precioBase;
    private Integer duracionDias;
    private Integer cantidadVentas;
    private Double totalIngresos;
    private Double promedioIngresoMensual;
    private Integer clientesActivos;
    private Integer clientesVencidos;
    private Double tasaRetencion; // % de renovaciones
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
```

✅ **Verificar:**
- 12 campos declarados
- Comentario en `tasaRetencion`

---

#### 1.4 ReporteComparativoDTO.java

**Ubicación:** `src/main/java/com/gimnasio/fit/dto/ReporteComparativoDTO.java`

```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteComparativoDTO {
    private String metrica;           // "Ingresos", "Asistencias", "Clientes Nuevos"
    private Double valorPeriodoActual;
    private Double valorPeriodoAnterior;
    private Double diferencia;
    private Double porcentajeCambio;
    private String tendencia;         // "subida", "bajada", "estable"
    private String periodo;           // "Octubre 2025"
}
```

✅ **Verificar:**
- 7 campos declarados
- Comentarios descriptivos

---

### 📁 PASO 2: Crear ReportesService.java

**Ubicación:** `src/main/java/com/gimnasio/fit/service/ReportesService.java`

**⚠️ IMPORTANTE:** Este archivo es extenso (350 líneas). Copia el código completo desde `IMPLEMENTACION_REPORTES_AVANZADOS.md` sección 2.1.

**Métodos principales que incluye:**

1. `obtenerReporteIngresosMensual(int anio, int mes)` - Reporte de un mes
2. `obtenerReporteIngresosAnual(int anio)` - Reporte de 12 meses
3. `obtenerReporteAsistenciasPorCliente(LocalDate inicio, LocalDate fin)` - Asistencias
4. `obtenerReporteMembresiasMasVendidas(LocalDate inicio, LocalDate fin)` - Membresías
5. `obtenerReporteComparativo()` - Comparativa mes actual vs anterior

**Métodos helper:**
- `crearComparativo()` - Crea objeto comparativo
- `toInstant(LocalDateTime)` - Convierte a Instant
- `toLocalDateTime(Instant)` - Convierte a LocalDateTime

✅ **Verificar:**
- Imports completos
- `@Service`, `@RequiredArgsConstructor`, `@Slf4j`
- 4 repositorios inyectados
- 5 métodos públicos
- 3 métodos privados helper
- Try-catch en todos los métodos

---

### 📁 PASO 3: Crear ReportesController.java

**Ubicación:** `src/main/java/com/gimnasio/fit/controller/ReportesController.java`

```java
package com.gimnasio.fit.controller;

import com.gimnasio.fit.dto.*;
import com.gimnasio.fit.service.ReportesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ReportesController {

    private final ReportesService reportesService;

    /**
     * GET /api/reportes/ingresos/mensual
     * Reporte de ingresos de un mes específico
     */
    @GetMapping("/ingresos/mensual")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<ReporteIngresosDTO> obtenerReporteIngresosMensual(
            @RequestParam int anio,
            @RequestParam int mes
    ) {
        log.info("📊 GET /api/reportes/ingresos/mensual?anio={}&mes={}", anio, mes);
        
        if (mes < 1 || mes > 12) {
            return ResponseEntity.badRequest().build();
        }
        
        ReporteIngresosDTO reporte = reportesService.obtenerReporteIngresosMensual(anio, mes);
        return ResponseEntity.ok(reporte);
    }

    /**
     * GET /api/reportes/ingresos/anual
     * Reporte de ingresos mes a mes de un año completo
     */
    @GetMapping("/ingresos/anual")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<ReporteIngresosDTO>> obtenerReporteIngresosAnual(
            @RequestParam int anio
    ) {
        log.info("📅 GET /api/reportes/ingresos/anual?anio={}", anio);
        
        List<ReporteIngresosDTO> reportes = reportesService.obtenerReporteIngresosAnual(anio);
        return ResponseEntity.ok(reportes);
    }

    /**
     * GET /api/reportes/asistencias/por-cliente
     * Reporte de asistencias agrupadas por cliente
     */
    @GetMapping("/asistencias/por-cliente")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<ReporteAsistenciaClienteDTO>> obtenerReporteAsistenciasPorCliente(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) {
        log.info("👥 GET /api/reportes/asistencias/por-cliente?inicio={}&fin={}", inicio, fin);
        
        if (fin.isBefore(inicio)) {
            return ResponseEntity.badRequest().build();
        }
        
        List<ReporteAsistenciaClienteDTO> reportes = reportesService.obtenerReporteAsistenciasPorCliente(inicio, fin);
        return ResponseEntity.ok(reportes);
    }

    /**
     * GET /api/reportes/membresias/mas-vendidas
     * Reporte de membresías más vendidas y rentables
     */
    @GetMapping("/membresias/mas-vendidas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReporteMembresiaDTO>> obtenerReporteMembresiasMasVendidas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) {
        log.info("🎫 GET /api/reportes/membresias/mas-vendidas?inicio={}&fin={}", inicio, fin);
        
        if (fin.isBefore(inicio)) {
            return ResponseEntity.badRequest().build();
        }
        
        List<ReporteMembresiaDTO> reportes = reportesService.obtenerReporteMembresiasMasVendidas(inicio, fin);
        return ResponseEntity.ok(reportes);
    }

    /**
     * GET /api/reportes/comparativo
     * Reporte comparativo mes actual vs mes anterior
     */
    @GetMapping("/comparativo")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<ReporteComparativoDTO>> obtenerReporteComparativo() {
        log.info("📈 GET /api/reportes/comparativo");
        
        List<ReporteComparativoDTO> reportes = reportesService.obtenerReporteComparativo();
        return ResponseEntity.ok(reportes);
    }
}
```

✅ **Verificar:**
- `@RestController` y `@RequestMapping("/api/reportes")`
- 5 endpoints con anotaciones `@GetMapping`
- Validaciones de parámetros (mes 1-12, fin >= inicio)
- `@PreAuthorize` en cada endpoint
- Logs informativos con emojis

---

### 📁 PASO 4: Modificar PagoRepository.java

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/PagoRepository.java`

**Agregar estos 2 métodos al final del repositorio:**

```java
// ========== MÉTODOS PARA REPORTES ==========

Integer countByFechaRegistroBetween(Instant inicio, Instant fin);

@Query("SELECT SUM(p.montoFinal) FROM Pago p WHERE p.estado = :estado AND p.fechaRegistro BETWEEN :inicio AND :fin")
Double sumMontoByEstadoAndFechaBetween(
    @Param("estado") String estado, 
    @Param("inicio") Instant inicio, 
    @Param("fin") Instant fin
);
```

✅ **Verificar:**
- Método `countByFechaRegistroBetween` declarado
- `@Query` con JPQL correcto
- `@Param` en todos los parámetros

---

### 📁 PASO 5: Modificar AsistenciaRepository.java

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/AsistenciaRepository.java`

**Agregar este método al final del repositorio:**

```java
// ========== MÉTODOS PARA REPORTES ==========

@Query("SELECT " +
       "a.cliente.id, " +
       "a.cliente.nombreCompleto, " +
       "a.cliente.email, " +
       "a.cliente.telefono, " +
       "COUNT(a), " +
       "MIN(a.fechaHora), " +
       "MAX(a.fechaHora), " +
       "CASE WHEN a.cliente.fechaVencimiento >= CURRENT_DATE THEN 'ACTIVA' ELSE 'VENCIDA' END, " +
       "a.cliente.fechaVencimiento " +
       "FROM Asistencia a " +
       "WHERE a.fechaHora BETWEEN :inicio AND :fin " +
       "GROUP BY a.cliente.id, a.cliente.nombreCompleto, a.cliente.email, a.cliente.telefono, a.cliente.fechaVencimiento " +
       "ORDER BY COUNT(a) DESC")
List<Object[]> obtenerAsistenciasPorCliente(
    @Param("inicio") LocalDateTime inicio, 
    @Param("fin") LocalDateTime fin
);
```

✅ **Verificar:**
- `@Query` con JPQL completo
- `GROUP BY` con todos los campos no agregados
- `ORDER BY COUNT(a) DESC`
- Retorna `List<Object[]>`

---

### 📁 PASO 6: Modificar MembresiaRepository.java

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/MembresiaRepository.java`

**Agregar este método al final del repositorio:**

```java
// ========== MÉTODOS PARA REPORTES ==========

@Query("SELECT " +
       "m.id, " +
       "m.nombre, " +
       "m.precioBase, " +
       "m.duracionDias, " +
       "COUNT(c), " +
       "SUM(c.precioFinal), " +
       "SUM(CASE WHEN c.fechaVencimiento >= CURRENT_DATE THEN 1 ELSE 0 END), " +
       "SUM(CASE WHEN c.fechaVencimiento < CURRENT_DATE THEN 1 ELSE 0 END) " +
       "FROM Membresia m " +
       "LEFT JOIN m.clientes c " +
       "WHERE c.fechaRegistro BETWEEN :inicio AND :fin " +
       "GROUP BY m.id, m.nombre, m.precioBase, m.duracionDias " +
       "ORDER BY SUM(c.precioFinal) DESC")
List<Object[]> obtenerReporteMembresiasPorVentas(
    @Param("inicio") LocalDate inicio, 
    @Param("fin") LocalDate fin
);
```

✅ **Verificar:**
- `@Query` con JPQL y `LEFT JOIN`
- `SUM(CASE WHEN...)` para contar activos/vencidos
- `ORDER BY SUM(c.precioFinal) DESC`
- Retorna `List<Object[]>`

---

### 📁 PASO 7: Compilar

```bash
# Limpiar y compilar
./mvnw clean compile

# O si usas Maven directamente
mvn clean compile
```

✅ **Verificar:**
- Sin errores de compilación
- Sin warnings críticos
- Mensaje: `BUILD SUCCESS`

---

### 📁 PASO 8: Ejecutar el backend

```bash
# Ejecutar
./mvnw spring-boot:run

# O si usas Maven directamente
mvn spring-boot:run
```

✅ **Verificar en logs:**
```
Mapped "{[/api/reportes/ingresos/mensual]}" onto ...
Mapped "{[/api/reportes/ingresos/anual]}" onto ...
Mapped "{[/api/reportes/asistencias/por-cliente]}" onto ...
Mapped "{[/api/reportes/membresias/mas-vendidas]}" onto ...
Mapped "{[/api/reportes/comparativo]}" onto ...
```

---

## 🧪 TESTING CON cURL

### Prerequisito: Obtener Token JWT

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipfit.com",
    "password": "admin123"
  }'

# Copiar el token de la respuesta
# TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Test 1: Reporte Ingresos Mensual ✅

```bash
curl -X GET "http://localhost:8080/api/reportes/ingresos/mensual?anio=2025&mes=10" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "periodo": "Octubre 2025",
  "totalIngresos": 12450.00,
  "cantidadPagos": 85,
  "promedioTicket": 146.47,
  "ingresosAprobados": 12000.00,
  "ingresosPendientes": 300.00,
  "ingresosRechazados": 150.00,
  "fechaInicio": "2025-10-01",
  "fechaFin": "2025-10-31"
}
```

---

### Test 2: Reporte Ingresos Anual ✅

```bash
curl -X GET "http://localhost:8080/api/reportes/ingresos/anual?anio=2025" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:** Array de 12 objetos (uno por mes)

---

### Test 3: Asistencias por Cliente ✅

```bash
curl -X GET "http://localhost:8080/api/reportes/asistencias/por-cliente?inicio=2025-10-01&fin=2025-10-31" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
[
  {
    "clienteId": 123,
    "nombreCompleto": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+51987654321",
    "totalAsistencias": 24,
    "primeraAsistencia": "2025-10-01",
    "ultimaAsistencia": "2025-10-31",
    "promedioAsistenciasMes": 24.0,
    "estadoMembresia": "ACTIVA",
    "fechaVencimiento": "2025-12-31"
  }
]
```

---

### Test 4: Membresías Más Vendidas ✅

```bash
curl -X GET "http://localhost:8080/api/reportes/membresias/mas-vendidas?inicio=2025-01-01&fin=2025-12-31" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
[
  {
    "membresiaId": 1,
    "nombreMembresia": "Premium Anual",
    "precioBase": 1200.00,
    "duracionDias": 365,
    "cantidadVentas": 45,
    "totalIngresos": 54000.00,
    "promedioIngresoMensual": 4500.00,
    "clientesActivos": 42,
    "clientesVencidos": 3,
    "tasaRetencion": 93.33,
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-12-31"
  }
]
```

---

### Test 5: Reporte Comparativo ✅

```bash
curl -X GET "http://localhost:8080/api/reportes/comparativo" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
[
  {
    "metrica": "Ingresos Totales",
    "valorPeriodoActual": 12450.00,
    "valorPeriodoAnterior": 11200.00,
    "diferencia": 1250.00,
    "porcentajeCambio": 11.16,
    "tendencia": "subida",
    "periodo": "Octubre 2025"
  },
  {
    "metrica": "Cantidad de Pagos",
    "valorPeriodoActual": 85.0,
    "valorPeriodoAnterior": 78.0,
    "diferencia": 7.0,
    "porcentajeCambio": 8.97,
    "tendencia": "subida",
    "periodo": "Octubre 2025"
  }
]
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### Problema 1: Error de compilación en ReportesService

**Error:**
```
cannot find symbol: toInstant(LocalDateTime)
```

**Solución:**
Verificar que el método helper `toInstant()` esté declarado en la clase:

```java
private Instant toInstant(LocalDateTime ldt) {
    return ldt.atZone(ZoneId.systemDefault()).toInstant();
}
```

---

### Problema 2: NullPointerException en sumMontoByFechaBetween

**Error:**
```
java.lang.NullPointerException
```

**Solución:**
En `ReportesService.obtenerReporteIngresosMensual()`, verificar validaciones:

```java
if (totalIngresos == null) totalIngresos = 0.0;
if (cantidadPagos == null) cantidadPagos = 0;
// ... más validaciones
```

---

### Problema 3: 403 Forbidden al llamar endpoint

**Error:**
```
403 Forbidden
```

**Solución:**
1. Verificar que el token JWT esté en el header:
   ```
   Authorization: Bearer TU_TOKEN
   ```
2. Verificar que el usuario tenga el rol correcto:
   - ADMIN: Todos los endpoints
   - RECEPCIONISTA: Todos excepto `/membresias/mas-vendidas`

---

### Problema 4: Query JPQL no compila

**Error:**
```
org.hibernate.hql.internal.ast.QuerySyntaxException
```

**Solución:**
Verificar:
1. Nombres de entidades con mayúscula: `Pago`, `Asistencia`, `Membresia`
2. Nombres de campos exactos según entidad
3. `@Param` en todos los parámetros de `@Query`

---

### Problema 5: Fechas incorrectas en el reporte

**Error:**
El reporte muestra datos de otro mes

**Solución:**
Verificar conversión Instant ↔ LocalDateTime:

```java
Instant inicioInstant = toInstant(inicio.atStartOfDay());
Instant finInstant = toInstant(fin.atTime(23, 59, 59)); // ⚠️ Incluir hasta el final del día
```

---

## ✅ CHECKLIST FINAL

Antes de considerar completado:

- [ ] 4 DTOs creados y compilados
- [ ] ReportesService creado (350 líneas)
- [ ] ReportesController creado (100 líneas)
- [ ] PagoRepository modificado (2 métodos)
- [ ] AsistenciaRepository modificado (1 método)
- [ ] MembresiaRepository modificado (1 método)
- [ ] Compilación exitosa sin errores
- [ ] Backend ejecutándose sin errores
- [ ] 5 endpoints mapeados en logs
- [ ] Test con cURL exitoso (al menos 1 endpoint)
- [ ] Token JWT funcionando
- [ ] Datos retornados correctamente

---

## 📚 RECURSOS ADICIONALES

### Documentos de Referencia
- `IMPLEMENTACION_REPORTES_AVANZADOS.md` - Código fuente completo
- `GUIA_FRONTEND_REPORTES.md` - Para después del backend
- `CHECKLIST_REPORTES.md` - Checklist de frontend

### Próximos Pasos
1. ✅ Backend implementado (este documento)
2. ⏳ Integración con frontend (ver `GUIA_FRONTEND_REPORTES.md`)
3. ⏳ Testing completo con datos reales
4. ⏳ Exportación a PDF/Excel (opcional)

---

## 🎉 ¡ÉXITO!

Si llegaste hasta aquí y todos los checks están ✅:

**¡Felicitaciones! El sistema de reportes backend está 100% funcional.** 🚀

Ahora puedes continuar con la implementación del frontend usando `GUIA_FRONTEND_REPORTES.md`.

---

**Fecha de creación:** 14 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA USAR
