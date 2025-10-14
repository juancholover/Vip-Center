# 📊 Backend Reportes - Implementación Final Corregida

## ✅ Aclaración Importante

El DTO `ReporteMembresiaDTO` **SÍ está correcto con 10 campos**. Los campos `fechaInicio` y `fechaFin` que se mencionaban antes **NO son parte del DTO**, sino **parámetros de entrada** para el endpoint que actúan como filtros del rango de fechas.

---

## 📁 Estructura de Archivos

```
src/main/java/com/gimnasio/fit/
├── controller/
│   └── ReportesController.java ✅ (ya lo tienes)
├── service/
│   └── ReportesService.java ⚠️ (necesita corrección menor)
├── dto/
│   ├── ReporteIngresosDTO.java ⏳ (falta crear)
│   ├── ReporteAsistenciaClienteDTO.java ✅ (ya lo tienes)
│   ├── ReporteMembresiaDTO.java ✅ (ya lo tienes - 10 campos OK)
│   └── ReporteComparativoDTO.java ✅ (ya lo tienes)
└── repository/
    ├── PagoRepository.java ⏳ (agregar 2 métodos)
    ├── AsistenciaRepository.java ⏳ (agregar 2 métodos)
    ├── MembresiaRepository.java ⏳ (agregar 1 método)
    └── ClienteRepository.java ⏳ (agregar 1 método)
```

---

## 1️⃣ DTOs (Data Transfer Objects)

### 1.1. ReporteIngresosDTO.java ⏳ CREAR

```java
package com.gimnasio.fit.dto;

import java.time.LocalDate;

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

    // Constructor con todos los campos
    public ReporteIngresosDTO(String periodo, Double totalIngresos, Integer cantidadPagos,
                              Double promedioTicket, Double ingresosAprobados,
                              Double ingresosPendientes, Double ingresosRechazados,
                              LocalDate fechaInicio, LocalDate fechaFin) {
        this.periodo = periodo;
        this.totalIngresos = totalIngresos != null ? totalIngresos : 0.0;
        this.cantidadPagos = cantidadPagos != null ? cantidadPagos : 0;
        this.promedioTicket = promedioTicket != null ? promedioTicket : 0.0;
        this.ingresosAprobados = ingresosAprobados != null ? ingresosAprobados : 0.0;
        this.ingresosPendientes = ingresosPendientes != null ? ingresosPendientes : 0.0;
        this.ingresosRechazados = ingresosRechazados != null ? ingresosRechazados : 0.0;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    // Getters y Setters
    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Double getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(Double totalIngresos) { this.totalIngresos = totalIngresos; }

    public Integer getCantidadPagos() { return cantidadPagos; }
    public void setCantidadPagos(Integer cantidadPagos) { this.cantidadPagos = cantidadPagos; }

    public Double getPromedioTicket() { return promedioTicket; }
    public void setPromedioTicket(Double promedioTicket) { this.promedioTicket = promedioTicket; }

    public Double getIngresosAprobados() { return ingresosAprobados; }
    public void setIngresosAprobados(Double ingresosAprobados) { this.ingresosAprobados = ingresosAprobados; }

    public Double getIngresosPendientes() { return ingresosPendientes; }
    public void setIngresosPendientes(Double ingresosPendientes) { this.ingresosPendientes = ingresosPendientes; }

    public Double getIngresosRechazados() { return ingresosRechazados; }
    public void setIngresosRechazados(Double ingresosRechazados) { this.ingresosRechazados = ingresosRechazados; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
}
```

### 1.2. ReporteMembresiaDTO.java ✅ (Ya lo tienes - CORRECTO)

Tu DTO con **10 campos** está perfecto:

```java
package com.gimnasio.fit.dto;

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

    // Constructor con 10 parámetros
    public ReporteMembresiaDTO(Long membresiaId, String nombreMembresia, Double precioBase,
                               Integer duracionDias, Integer cantidadVentas, Double totalIngresos,
                               Double promedioIngresoMensual, Integer clientesActivos,
                               Integer clientesVencidos, Double tasaRetencion) {
        this.membresiaId = membresiaId;
        this.nombreMembresia = nombreMembresia;
        this.precioBase = precioBase;
        this.duracionDias = duracionDias;
        this.cantidadVentas = cantidadVentas != null ? cantidadVentas : 0;
        this.totalIngresos = totalIngresos != null ? totalIngresos : 0.0;
        this.promedioIngresoMensual = promedioIngresoMensual != null ? promedioIngresoMensual : 0.0;
        this.clientesActivos = clientesActivos != null ? clientesActivos : 0;
        this.clientesVencidos = clientesVencidos != null ? clientesVencidos : 0;
        this.tasaRetencion = tasaRetencion != null ? tasaRetencion : 0.0;
    }

    // Getters y Setters para los 10 campos
    // ... (tu código está bien)
}
```

---

## 2️⃣ Métodos de Repositorios

### 2.1. PagoRepository.java

Agregar estos 2 métodos:

```java
package com.gimnasio.fit.repository;

import com.gimnasio.fit.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Método 1: Contar pagos en un rango de fechas
    Integer countByFechaRegistroBetween(Instant inicio, Instant fin);

    // Método 2: Sumar montos por estado y fechas
    @Query("SELECT SUM(p.montoFinal) FROM Pago p " +
           "WHERE p.estado = :estado " +
           "AND p.fechaRegistro BETWEEN :inicio AND :fin")
    Double sumMontoByEstadoAndFechaBetween(
        @Param("estado") String estado,
        @Param("inicio") Instant inicio,
        @Param("fin") Instant fin
    );
}
```

**⚠️ Verificación Importante:**
- Verifica que tu entidad `Pago` tenga el campo `fechaRegistro` de tipo `Instant`
- Verifica que tenga el campo `montoFinal` de tipo `Double` o `BigDecimal`
- Si se llama `fechaPago` o `monto`, ajusta los nombres en los métodos

---

### 2.2. AsistenciaRepository.java

Agregar estos 2 métodos:

```java
package com.gimnasio.fit.repository;

import com.gimnasio.fit.entity.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    // Método 1: Reporte de asistencias por cliente
    @Query("SELECT " +
           "c.id, " +
           "CONCAT(c.nombre, ' ', c.apellidos), " +
           "c.email, " +
           "c.telefono, " +
           "COUNT(a.id), " +
           "MIN(a.fechaHora), " +
           "MAX(a.fechaHora), " +
           "CAST(COUNT(a.id) AS double) / " +
           "   CAST(FUNCTION('TIMESTAMPDIFF', MONTH, MIN(a.fechaHora), MAX(a.fechaHora)) + 1 AS double), " +
           "CASE WHEN c.fechaVencimiento >= CURRENT_DATE THEN 'activo' ELSE 'vencido' END, " +
           "c.fechaVencimiento " +
           "FROM Asistencia a " +
           "JOIN a.cliente c " +
           "WHERE a.fechaHora BETWEEN :inicio AND :fin " +
           "GROUP BY c.id, c.nombre, c.apellidos, c.email, c.telefono, c.fechaVencimiento " +
           "ORDER BY COUNT(a.id) DESC")
    List<Object[]> obtenerAsistenciasPorCliente(
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );

    // Método 2: Contar asistencias en un rango
    Integer countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}
```

**⚠️ Verificación Importante:**
- Verifica que tu entidad `Asistencia` tenga el campo `fechaHora` de tipo `LocalDateTime`
- Verifica que tenga la relación `@ManyToOne` con `Cliente` llamada `cliente`
- Verifica que `Cliente` tenga los campos: `nombre`, `apellidos`, `email`, `telefono`, `fechaVencimiento`

---

### 2.3. MembresiaRepository.java

Agregar este método:

```java
package com.gimnasio.fit.repository;

import com.gimnasio.fit.entity.Membresia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {

    @Query("SELECT " +
           "m.id, " +
           "m.nombre, " +
           "m.precio, " +
           "m.duracionDias, " +
           "COUNT(DISTINCT c.id), " +
           "SUM(p.montoFinal), " +
           "SUM(p.montoFinal) / NULLIF(COUNT(DISTINCT c.id), 0), " +
           "COUNT(DISTINCT CASE WHEN c.fechaVencimiento >= CURRENT_DATE THEN c.id END), " +
           "COUNT(DISTINCT CASE WHEN c.fechaVencimiento < CURRENT_DATE THEN c.id END), " +
           "CAST(COUNT(DISTINCT CASE WHEN c.fechaVencimiento >= CURRENT_DATE THEN c.id END) AS double) * 100.0 / " +
           "   NULLIF(COUNT(DISTINCT c.id), 0) " +
           "FROM Membresia m " +
           "LEFT JOIN m.clientes c " +
           "LEFT JOIN c.pagos p " +
           "WHERE p.fechaRegistro BETWEEN :inicio AND :fin " +
           "AND p.estado = 'aprobado' " +
           "GROUP BY m.id, m.nombre, m.precio, m.duracionDias " +
           "ORDER BY COUNT(DISTINCT c.id) DESC")
    List<Object[]> obtenerReporteMembresiasPorVentas(
        @Param("inicio") Instant inicio,
        @Param("fin") Instant fin
    );
}
```

**⚠️ Verificación Importante:**
- Verifica que tu entidad `Membresia` tenga los campos: `nombre`, `precio`, `duracionDias`
- Verifica que tenga la relación `@OneToMany` con `Cliente` llamada `clientes`
- Verifica que `Cliente` tenga la relación `@OneToMany` con `Pago` llamada `pagos`
- Si las relaciones tienen otros nombres, ajústalos en la query

---

### 2.4. ClienteRepository.java

Agregar este método:

```java
package com.gimnasio.fit.repository;

import com.gimnasio.fit.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.fechaVencimiento >= :fecha")
    Integer countClientesActivos(@Param("fecha") LocalDate fecha);
}
```

---

## 3️⃣ Corrección en ReportesService.java

En el método `obtenerReporteMembresiasMasVendidas()`, la línea que crea el DTO debe usar **10 parámetros**, no 12:

### ❌ INCORRECTO (si pusiste 12 parámetros):
```java
new ReporteMembresiaDTO(
    membresiaId, nombreMembresia, precioBase, duracionDias,
    cantidadVentas, totalIngresos, promedioIngresoMensual,
    clientesActivos, clientesVencidos, tasaRetencion,
    inicio, fin  // ❌ NO - estos NO son parte del DTO
)
```

### ✅ CORRECTO (10 parámetros):
```java
new ReporteMembresiaDTO(
    membresiaId, 
    nombreMembresia, 
    precioBase, 
    duracionDias,
    cantidadVentas, 
    totalIngresos, 
    promedioIngresoMensual,
    clientesActivos, 
    clientesVencidos, 
    tasaRetencion
)
```

Los parámetros `inicio` y `fin` son **parámetros del método**, no campos del DTO. Se usan solo para filtrar las consultas SQL.

---

## 4️⃣ Errores Comunes y Soluciones

### Error 1: "Cannot resolve method 'sumMontoByEstadoAndFechaBetween'"

**Causa:** Spring Data JPA no puede inferir automáticamente este método por el nombre.

**Solución:** Usar `@Query` explícita (ya está en el código de arriba).

---

### Error 2: "Cannot resolve property 'clientes' in Membresia"

**Causa:** Tu entidad `Membresia` no tiene la relación `@OneToMany` con `Cliente`.

**Solución:** Verifica en `Membresia.java`:

```java
@OneToMany(mappedBy = "membresia")
private List<Cliente> clientes;
```

Si el campo se llama diferente (por ejemplo `miembros`), cambia la query:

```java
"LEFT JOIN m.miembros c " +  // En lugar de m.clientes
```

---

### Error 3: "Cannot resolve method 'countByFechaHoraBetween'"

**Causa:** El campo en la entidad `Asistencia` no se llama `fechaHora`.

**Solución:** Verifica el nombre real del campo. Si se llama `fecha` o `timestamp`, ajusta:

```java
Integer countByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
```

---

### Error 4: "Cannot resolve method 'countClientesActivos'"

**Causa:** Falta definir el método con `@Query`.

**Solución:** Ya está en el código de ClienteRepository arriba.

---

## 5️⃣ Verificación de Entidades

Antes de compilar, asegúrate que tus entidades tengan estos campos:

### Pago.java
```java
private Instant fechaRegistro;  // o LocalDateTime, o Date
private Double montoFinal;      // o BigDecimal
private String estado;          // "aprobado", "pendiente", "rechazado"
```

### Asistencia.java
```java
private LocalDateTime fechaHora;
@ManyToOne
private Cliente cliente;
```

### Cliente.java
```java
private String nombre;
private String apellidos;
private String email;
private String telefono;
private LocalDate fechaVencimiento;
@ManyToOne
private Membresia membresia;
@OneToMany(mappedBy = "cliente")
private List<Pago> pagos;
```

### Membresia.java
```java
private String nombre;
private Double precio;
private Integer duracionDias;
@OneToMany(mappedBy = "membresia")
private List<Cliente> clientes;
```

---

## 6️⃣ Imports Necesarios

Agrega estos imports en los archivos correspondientes:

```java
// En DTOs
import java.time.LocalDate;
import java.time.LocalDateTime;

// En Repositories
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
```

---

## 7️⃣ Orden de Implementación Recomendado

1. ✅ **ReporteMembresiaDTO** (ya lo tienes - 10 campos)
2. ✅ **ReporteAsistenciaClienteDTO** (ya lo tienes)
3. ✅ **ReporteComparativoDTO** (ya lo tienes)
4. ⏳ **ReporteIngresosDTO** (créalo ahora - ver sección 1.1)
5. ⏳ **PagoRepository** (agregar 2 métodos - ver sección 2.1)
6. ⏳ **AsistenciaRepository** (agregar 2 métodos - ver sección 2.2)
7. ⏳ **MembresiaRepository** (agregar 1 método - ver sección 2.3)
8. ⏳ **ClienteRepository** (agregar 1 método - ver sección 2.4)
9. ⏳ **Verificar ReportesService** (asegurar que use 10 parámetros en ReporteMembresiaDTO)
10. ⏳ **Compilar y probar**

---

## 8️⃣ Compilación y Pruebas

### Compilar
```bash
./mvnw clean compile
```

### Ejecutar
```bash
./mvnw spring-boot:run
```

### Probar con cURL

**1. Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gym.com","password":"admin123"}'
```

Copia el `token` de la respuesta.

**2. Probar Reporte Comparativo:**
```bash
curl http://localhost:8080/api/reportes/comparativo?anio=2025&mes=10 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**3. Probar Reporte Ingresos Mensual:**
```bash
curl http://localhost:8080/api/reportes/ingresos/mensual?anio=2025&mes=10 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**4. Probar Reporte Membresías:**
```bash
curl "http://localhost:8080/api/reportes/membresias/mas-vendidas?fechaInicio=2025-01-01&fechaFin=2025-12-31" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**5. Probar Reporte Asistencias:**
```bash
curl "http://localhost:8080/api/reportes/asistencias/por-cliente?fechaInicio=2025-01-01&fechaFin=2025-12-31" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 9️⃣ Diferencia Clave: Parámetros vs Campos del DTO

### ❌ ERROR COMÚN:
Confundir los **parámetros del endpoint** con los **campos del DTO**.

### ✅ CORRECTO:

**Endpoint:**
```
GET /api/reportes/membresias/mas-vendidas?fechaInicio=2025-01-01&fechaFin=2025-12-31
                                           ↑                        ↑
                                    PARÁMETROS DE ENTRADA (filtros)
```

**DTO Response:**
```json
{
  "membresiaId": 1,
  "nombreMembresia": "Premium",
  "precioBase": 50.00,
  "duracionDias": 30,
  "cantidadVentas": 45,
  "totalIngresos": 2250.00,
  "promedioIngresoMensual": 750.00,
  "clientesActivos": 40,
  "clientesVencidos": 5,
  "tasaRetencion": 88.89
}
```
**Nota:** Los parámetros `fechaInicio` y `fechaFin` **NO aparecen en el DTO**, solo se usan para filtrar qué datos traer.

---

## 🎯 Resumen Final

✅ **Tu ReporteMembresiaDTO con 10 campos está correcto**

✅ **Los campos fechaInicio/fechaFin son parámetros del endpoint, no del DTO**

✅ **El frontend usa esos parámetros para filtrar, no los espera en la respuesta de cada membresía**

✅ **Sigue el orden de implementación de la sección 7**

✅ **Verifica los nombres de campos en tus entidades antes de compilar**

---

¡Ahora sí está todo correcto! 🚀
