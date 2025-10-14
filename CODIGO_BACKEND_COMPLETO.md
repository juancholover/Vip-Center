# 🚀 Código Backend Completo - Reportes

Este documento contiene TODO el código necesario para implementar el sistema de reportes.

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/main/java/com/gimnasio/fit/
├── dto/
│   ├── ReporteIngresosDTO.java          ⬅️ CREAR
│   ├── ReporteAsistenciaClienteDTO.java ⬅️ CREAR
│   ├── ReporteMembresiaDTO.java         ⬅️ CREAR
│   └── ReporteComparativoDTO.java       ⬅️ CREAR
├── service/
│   └── ReportesService.java             ⬅️ CREAR (ya tienes el código)
├── controller/
│   └── ReportesController.java          ⬅️ CREAR (ya tienes el código)
└── repository/
    ├── PagoRepository.java              ⬅️ MODIFICAR
    ├── AsistenciaRepository.java        ⬅️ MODIFICAR
    ├── MembresiaRepository.java         ⬅️ MODIFICAR
    └── ClienteRepository.java           ⬅️ MODIFICAR
```

---

## 1️⃣ DTOs - Crear estos 4 archivos

### 📄 ReporteIngresosDTO.java

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
    private String periodo;
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

---

### 📄 ReporteAsistenciaClienteDTO.java

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

---

### 📄 ReporteMembresiaDTO.java

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
    private Double tasaRetencion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
```

---

### 📄 ReporteComparativoDTO.java

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
    private String metrica;
    private Double valorPeriodoActual;
    private Double valorPeriodoAnterior;
    private Double diferencia;
    private Double porcentajeCambio;
    private String tendencia;
    private String periodo;
}
```

---

## 2️⃣ REPOSITORIES - Agregar estos métodos

### 📄 PagoRepository.java - Agregar al final

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/PagoRepository.java`

```java
// ========== AGREGAR ESTOS MÉTODOS AL FINAL ==========

// Método existente que ya deberías tener (verificar nombre exacto)
Double sumMontoByFechaRegistroBetween(Instant inicio, Instant fin);
// Si no existe, cambiar a:
@Query("SELECT SUM(p.montoFinal) FROM Pago p WHERE p.fechaRegistro BETWEEN :inicio AND :fin")
Double sumMontoByFechaBetween(@Param("inicio") Instant inicio, @Param("fin") Instant fin);

// NUEVOS MÉTODOS:
Integer countByFechaRegistroBetween(Instant inicio, Instant fin);

@Query("SELECT SUM(p.montoFinal) FROM Pago p WHERE p.estado = :estado AND p.fechaRegistro BETWEEN :inicio AND :fin")
Double sumMontoByEstadoAndFechaBetween(
    @Param("estado") String estado, 
    @Param("inicio") Instant inicio, 
    @Param("fin") Instant fin
);
```

**⚠️ IMPORTANTE:** En `ReportesService.java` línea 56, verifica el nombre del método. Si tu repositorio tiene:
- `sumMontoByFechaRegistroBetween()` → Usar ese
- Si no existe → Crear `sumMontoByFechaBetween()` con la query mostrada arriba

---

### 📄 AsistenciaRepository.java - Agregar al final

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/AsistenciaRepository.java`

```java
// ========== AGREGAR ESTOS MÉTODOS AL FINAL ==========

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

// Este método probablemente ya existe, verificar:
Integer countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
```

---

### 📄 MembresiaRepository.java - Agregar al final

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/MembresiaRepository.java`

```java
// ========== AGREGAR ESTE MÉTODO AL FINAL ==========

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

**⚠️ NOTA:** Verifica que la entidad `Membresia` tenga:
- Campo: `clientes` (relación con Cliente)
- Si no existe o tiene otro nombre, ajusta el JOIN en la query

---

### 📄 ClienteRepository.java - Agregar al final

**Ubicación:** `src/main/java/com/gimnasio/fit/repository/ClienteRepository.java`

```java
// ========== AGREGAR ESTE MÉTODO AL FINAL ==========

@Query("SELECT COUNT(c) FROM Cliente c WHERE c.fechaVencimiento >= :fecha")
Integer countClientesActivos(@Param("fecha") LocalDate fecha);
```

---

## 3️⃣ VERIFICACIONES IMPORTANTES

### ✅ Checklist antes de compilar:

#### Nombres de campos en entidades:
Verifica que tus entidades tengan estos campos exactamente:

**Pago.java:**
```java
private Instant fechaRegistro;  // ⬅️ Debe ser Instant
private Double montoFinal;
private String estado;  // valores: "approved", "pending", "rejected"
```

**Asistencia.java:**
```java
private LocalDateTime fechaHora;
@ManyToOne
private Cliente cliente;
```

**Cliente.java:**
```java
private Integer id;
private String nombreCompleto;
private String email;
private String telefono;
private LocalDate fechaVencimiento;
private LocalDate fechaRegistro;
private Double precioFinal;  // Si existe esta relación con precio
```

**Membresia.java:**
```java
private Long id;
private String nombre;
private Double precioBase;
private Integer duracionDias;
@OneToMany
private List<Cliente> clientes;  // ⬅️ Relación importante
```

---

## 4️⃣ POSIBLES ERRORES Y SOLUCIONES

### Error 1: "Cannot find symbol: sumMontoByFechaBetween"

**Causa:** El método en PagoRepository tiene otro nombre

**Solución:** En `ReportesService.java` línea 56, cambiar:
```java
// Si tu repositorio tiene este método:
Double totalIngresos = pagoRepository.sumMontoByFechaRegistroBetween(inicioInstant, finInstant);

// Si tu repositorio NO lo tiene, agregar en PagoRepository:
@Query("SELECT SUM(p.montoFinal) FROM Pago p WHERE p.fechaRegistro BETWEEN :inicio AND :fin")
Double sumMontoByFechaBetween(@Param("inicio") Instant inicio, @Param("fin") Instant fin);
```

---

### Error 2: "Cannot resolve property 'clientes' in entity 'Membresia'"

**Causa:** La relación no existe o tiene otro nombre

**Solución 1:** Si existe con otro nombre (ej: `clientesList`):
```java
// Cambiar en la query de MembresiaRepository:
"LEFT JOIN m.clientesList c "  // En lugar de m.clientes
```

**Solución 2:** Si NO existe la relación:
Agregar en `Membresia.java`:
```java
@OneToMany(mappedBy = "membresia")
private List<Cliente> clientes;
```

Y en `Cliente.java`:
```java
@ManyToOne
private Membresia membresia;
```

---

### Error 3: "Cannot find symbol: countByFechaHoraBetween"

**Solución:** Agregar en `AsistenciaRepository.java`:
```java
Integer countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
```

---

### Error 4: "Cannot find symbol: countClientesActivos"

**Solución:** Ya está en el código de arriba, agregar en `ClienteRepository.java`

---

## 5️⃣ IMPORTS NECESARIOS

Asegúrate de tener estos imports en los repositorios:

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
```

---

## 6️⃣ ORDEN DE IMPLEMENTACIÓN

### Paso 1: Crear DTOs
```
✅ ReporteIngresosDTO.java
✅ ReporteAsistenciaClienteDTO.java
✅ ReporteMembresiaDTO.java
✅ ReporteComparativoDTO.java
```

### Paso 2: Modificar Repositorios
```
✅ PagoRepository.java - agregar 2 métodos
✅ AsistenciaRepository.java - agregar 2 métodos
✅ MembresiaRepository.java - agregar 1 método
✅ ClienteRepository.java - agregar 1 método
```

### Paso 3: Crear Service y Controller
```
✅ ReportesService.java - ya tienes el código
✅ ReportesController.java - ya tienes el código
```

### Paso 4: Compilar
```bash
./mvnw clean compile
```

### Paso 5: Ejecutar
```bash
./mvnw spring-boot:run
```

---

## 7️⃣ TESTING RÁPIDO

Una vez compilado, prueba con cURL:

```bash
# 1. Login para obtener token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipfit.com","password":"admin123"}'

# 2. Copiar token y probar endpoint
curl -X GET "http://localhost:8080/api/reportes/comparativo" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:** JSON con 4 métricas comparativas

---

## 8️⃣ RESUMEN

### Archivos a CREAR (6):
1. ✅ ReporteIngresosDTO.java
2. ✅ ReporteAsistenciaClienteDTO.java
3. ✅ ReporteMembresiaDTO.java
4. ✅ ReporteComparativoDTO.java
5. ✅ ReportesService.java
6. ✅ ReportesController.java

### Archivos a MODIFICAR (4):
7. ✅ PagoRepository.java
8. ✅ AsistenciaRepository.java
9. ✅ MembresiaRepository.java
10. ✅ ClienteRepository.java

---

## 🆘 SI TIENES ERRORES

1. **Revisa los nombres de campos** en tus entidades
2. **Verifica las relaciones** entre entidades (@OneToMany, @ManyToOne)
3. **Comprueba los imports** en repositorios
4. **Compara con este documento** para encontrar diferencias

---

**¡Con esto deberías tener el backend funcionando al 100%!** 🚀

**Fecha:** 14 de octubre de 2025
