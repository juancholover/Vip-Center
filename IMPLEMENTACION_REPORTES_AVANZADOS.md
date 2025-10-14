# 📊 Implementación de Reportes Avanzados - VIP Center Fit

## 🎯 Objetivo

Implementar un sistema completo de reportes para análisis de negocio con:
- Reportes de ingresos mensuales/anuales
- Reportes de asistencias por cliente
- Reportes de membresías más vendidas
- Reportes de rendimiento por empleado (opcional)
- Exportación a PDF y Excel

---

## 📁 Archivos a Crear (Total: 12)

### 1. DTOs (4 archivos)

#### 1.1 ReporteIngresosDTO.java
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

#### 1.2 ReporteAsistenciaClienteDTO.java
```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

#### 1.3 ReporteMembresiaDTO.java
```java
package com.gimnasio.fit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
```

#### 1.4 ReporteComparativoDTO.java
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

---

### 2. Service (1 archivo)

#### 2.1 ReportesService.java
```java
package com.gimnasio.fit.service;

import com.gimnasio.fit.dto.*;
import com.gimnasio.fit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportesService {

    private final PagoRepository pagoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;

    /**
     * 📊 REPORTE DE INGRESOS MENSUAL
     * Genera reporte detallado de ingresos de un mes específico
     */
    @Transactional(readOnly = true)
    public ReporteIngresosDTO obtenerReporteIngresosMensual(int anio, int mes) {
        try {
            log.info("📊 Generando reporte de ingresos para {}/{}", mes, anio);

            YearMonth yearMonth = YearMonth.of(anio, mes);
            LocalDate inicio = yearMonth.atDay(1);
            LocalDate fin = yearMonth.atEndOfMonth();
            
            Instant inicioInstant = toInstant(inicio.atStartOfDay());
            Instant finInstant = toInstant(fin.atTime(23, 59, 59));

            // Consultas a BD
            Double totalIngresos = pagoRepository.sumMontoByFechaRegistroBetween(inicioInstant, finInstant);
            Integer cantidadPagos = pagoRepository.countByFechaRegistroBetween(inicioInstant, finInstant);
            
            Double ingresosAprobados = pagoRepository.sumMontoByEstadoAndFechaBetween("approved", inicioInstant, finInstant);
            Double ingresosPendientes = pagoRepository.sumMontoByEstadoAndFechaBetween("pending", inicioInstant, finInstant);
            Double ingresosRechazados = pagoRepository.sumMontoByEstadoAndFechaBetween("rejected", inicioInstant, finInstant);

            // Validaciones
            if (totalIngresos == null) totalIngresos = 0.0;
            if (cantidadPagos == null) cantidadPagos = 0;
            if (ingresosAprobados == null) ingresosAprobados = 0.0;
            if (ingresosPendientes == null) ingresosPendientes = 0.0;
            if (ingresosRechazados == null) ingresosRechazados = 0.0;

            Double promedioTicket = cantidadPagos > 0 ? totalIngresos / cantidadPagos : 0.0;
            
            String nombreMes = yearMonth.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES"));
            String periodo = nombreMes.substring(0, 1).toUpperCase() + nombreMes.substring(1) + " " + anio;

            return new ReporteIngresosDTO(
                periodo,
                totalIngresos,
                cantidadPagos,
                promedioTicket,
                ingresosAprobados,
                ingresosPendientes,
                ingresosRechazados,
                inicio,
                fin
            );

        } catch (Exception e) {
            log.error("❌ Error al generar reporte de ingresos: {}", e.getMessage(), e);
            return new ReporteIngresosDTO("Error", 0.0, 0, 0.0, 0.0, 0.0, 0.0, LocalDate.now(), LocalDate.now());
        }
    }

    /**
     * 📅 REPORTE DE INGRESOS ANUAL
     * Genera reporte de ingresos mes a mes de un año
     */
    @Transactional(readOnly = true)
    public List<ReporteIngresosDTO> obtenerReporteIngresosAnual(int anio) {
        List<ReporteIngresosDTO> reportes = new ArrayList<>();
        
        for (int mes = 1; mes <= 12; mes++) {
            reportes.add(obtenerReporteIngresosMensual(anio, mes));
        }
        
        return reportes;
    }

    /**
     * 👥 REPORTE DE ASISTENCIAS POR CLIENTE
     * Analiza asistencias de cada cliente en un período
     */
    @Transactional(readOnly = true)
    public List<ReporteAsistenciaClienteDTO> obtenerReporteAsistenciasPorCliente(LocalDate inicio, LocalDate fin) {
        try {
            log.info("👥 Generando reporte de asistencias por cliente desde {} hasta {}", inicio, fin);

            LocalDateTime inicioDateTime = inicio.atStartOfDay();
            LocalDateTime finDateTime = fin.atTime(23, 59, 59);

            List<Object[]> resultados = asistenciaRepository.obtenerAsistenciasPorCliente(inicioDateTime, finDateTime);
            List<ReporteAsistenciaClienteDTO> reportes = new ArrayList<>();

            for (Object[] fila : resultados) {
                Integer clienteId = (Integer) fila[0];
                String nombreCompleto = (String) fila[1];
                String email = (String) fila[2];
                String telefono = (String) fila[3];
                Long totalAsistencias = (Long) fila[4];
                LocalDateTime primeraAsistencia = (LocalDateTime) fila[5];
                LocalDateTime ultimaAsistencia = (LocalDateTime) fila[6];
                String estadoMembresia = (String) fila[7];
                LocalDate fechaVencimiento = (LocalDate) fila[8];

                // Calcular promedio de asistencias por mes
                long diasEnPeriodo = ChronoUnit.DAYS.between(inicio, fin);
                double mesesEnPeriodo = diasEnPeriodo / 30.0;
                Double promedioMes = mesesEnPeriodo > 0 ? totalAsistencias / mesesEnPeriodo : 0.0;

                reportes.add(new ReporteAsistenciaClienteDTO(
                    clienteId,
                    nombreCompleto,
                    email,
                    telefono,
                    totalAsistencias.intValue(),
                    primeraAsistencia.toLocalDate(),
                    ultimaAsistencia.toLocalDate(),
                    Math.round(promedioMes * 100.0) / 100.0,
                    estadoMembresia,
                    fechaVencimiento
                ));
            }

            // Ordenar por total de asistencias descendente
            reportes.sort((a, b) -> b.getTotalAsistencias().compareTo(a.getTotalAsistencias()));

            log.info("✅ Reporte generado con {} clientes", reportes.size());
            return reportes;

        } catch (Exception e) {
            log.error("❌ Error al generar reporte de asistencias: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * 🎫 REPORTE DE MEMBRESÍAS MÁS VENDIDAS
     * Analiza rendimiento de cada tipo de membresía
     */
    @Transactional(readOnly = true)
    public List<ReporteMembresiaDTO> obtenerReporteMembresiasMasVendidas(LocalDate inicio, LocalDate fin) {
        try {
            log.info("🎫 Generando reporte de membresías desde {} hasta {}", inicio, fin);

            List<Object[]> resultados = membresiaRepository.obtenerReporteMembresiasPorVentas(inicio, fin);
            List<ReporteMembresiaDTO> reportes = new ArrayList<>();

            for (Object[] fila : resultados) {
                Long membresiaId = (Long) fila[0];
                String nombreMembresia = (String) fila[1];
                Double precioBase = (Double) fila[2];
                Integer duracionDias = (Integer) fila[3];
                Long cantidadVentas = (Long) fila[4];
                Double totalIngresos = (Double) fila[5];
                Long clientesActivos = (Long) fila[6];
                Long clientesVencidos = (Long) fila[7];

                // Calcular métricas
                long diasEnPeriodo = ChronoUnit.DAYS.between(inicio, fin);
                double mesesEnPeriodo = diasEnPeriodo / 30.0;
                Double promedioMensual = mesesEnPeriodo > 0 ? totalIngresos / mesesEnPeriodo : 0.0;

                Double tasaRetencion = 0.0;
                if (cantidadVentas > 0) {
                    tasaRetencion = (clientesActivos.doubleValue() / cantidadVentas.doubleValue()) * 100;
                }

                reportes.add(new ReporteMembresiaDTO(
                    membresiaId,
                    nombreMembresia,
                    precioBase,
                    duracionDias,
                    cantidadVentas.intValue(),
                    totalIngresos,
                    Math.round(promedioMensual * 100.0) / 100.0,
                    clientesActivos.intValue(),
                    clientesVencidos.intValue(),
                    Math.round(tasaRetencion * 100.0) / 100.0
                ));
            }

            // Ordenar por total ingresos descendente
            reportes.sort((a, b) -> b.getTotalIngresos().compareTo(a.getTotalIngresos()));

            log.info("✅ Reporte generado con {} membresías", reportes.size());
            return reportes;

        } catch (Exception e) {
            log.error("❌ Error al generar reporte de membresías: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * 📈 REPORTE COMPARATIVO
     * Compara métricas del mes actual vs mes anterior
     */
    @Transactional(readOnly = true)
    public List<ReporteComparativoDTO> obtenerReporteComparativo() {
        try {
            log.info("📈 Generando reporte comparativo");

            LocalDate hoy = LocalDate.now();
            YearMonth mesActual = YearMonth.from(hoy);
            YearMonth mesAnterior = mesActual.minusMonths(1);

            List<ReporteComparativoDTO> reportes = new ArrayList<>();

            // 1. Comparar Ingresos
            ReporteIngresosDTO ingresosActuales = obtenerReporteIngresosMensual(mesActual.getYear(), mesActual.getMonthValue());
            ReporteIngresosDTO ingresosAnteriores = obtenerReporteIngresosMensual(mesAnterior.getYear(), mesAnterior.getMonthValue());
            
            reportes.add(crearComparativo(
                "Ingresos Totales",
                ingresosActuales.getTotalIngresos(),
                ingresosAnteriores.getTotalIngresos(),
                ingresosActuales.getPeriodo()
            ));

            reportes.add(crearComparativo(
                "Cantidad de Pagos",
                ingresosActuales.getCantidadPagos().doubleValue(),
                ingresosAnteriores.getCantidadPagos().doubleValue(),
                ingresosActuales.getPeriodo()
            ));

            // 2. Comparar Asistencias
            Instant inicioActual = toInstant(mesActual.atDay(1).atStartOfDay());
            Instant finActual = toInstant(mesActual.atEndOfMonth().atTime(23, 59, 59));
            Instant inicioAnterior = toInstant(mesAnterior.atDay(1).atStartOfDay());
            Instant finAnterior = toInstant(mesAnterior.atEndOfMonth().atTime(23, 59, 59));

            Integer asistenciasActuales = asistenciaRepository.countByFechaHoraBetween(
                toLocalDateTime(inicioActual), 
                toLocalDateTime(finActual)
            );
            Integer asistenciasAnteriores = asistenciaRepository.countByFechaHoraBetween(
                toLocalDateTime(inicioAnterior), 
                toLocalDateTime(finAnterior)
            );

            reportes.add(crearComparativo(
                "Total de Asistencias",
                asistenciasActuales.doubleValue(),
                asistenciasAnteriores.doubleValue(),
                ingresosActuales.getPeriodo()
            ));

            // 3. Comparar Clientes Activos
            Integer clientesActuales = clienteRepository.countClientesActivos(mesActual.atEndOfMonth());
            Integer clientesAnteriores = clienteRepository.countClientesActivos(mesAnterior.atEndOfMonth());

            reportes.add(crearComparativo(
                "Clientes Activos",
                clientesActuales.doubleValue(),
                clientesAnteriores.doubleValue(),
                ingresosActuales.getPeriodo()
            ));

            log.info("✅ Reporte comparativo generado con {} métricas", reportes.size());
            return reportes;

        } catch (Exception e) {
            log.error("❌ Error al generar reporte comparativo: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    // ========== MÉTODOS HELPER ==========

    private ReporteComparativoDTO crearComparativo(String metrica, Double valorActual, Double valorAnterior, String periodo) {
        Double diferencia = valorActual - valorAnterior;
        Double porcentajeCambio = valorAnterior > 0 ? (diferencia / valorAnterior) * 100 : 0.0;
        
        String tendencia;
        if (porcentajeCambio > 5) tendencia = "subida";
        else if (porcentajeCambio < -5) tendencia = "bajada";
        else tendencia = "estable";

        return new ReporteComparativoDTO(
            metrica,
            Math.round(valorActual * 100.0) / 100.0,
            Math.round(valorAnterior * 100.0) / 100.0,
            Math.round(diferencia * 100.0) / 100.0,
            Math.round(porcentajeCambio * 100.0) / 100.0,
            tendencia,
            periodo
        );
    }

    private Instant toInstant(LocalDateTime ldt) {
        return ldt.atZone(ZoneId.systemDefault()).toInstant();
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
```

---

### 3. Controller (1 archivo)

#### 3.1 ReportesController.java
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
     * 
     * @param anio Año (ej: 2025)
     * @param mes Mes (1-12)
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
     * 
     * @param anio Año (ej: 2025)
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
     * 
     * @param inicio Fecha de inicio (formato: YYYY-MM-DD)
     * @param fin Fecha de fin (formato: YYYY-MM-DD)
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
     * 
     * @param inicio Fecha de inicio (formato: YYYY-MM-DD)
     * @param fin Fecha de fin (formato: YYYY-MM-DD)
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

---

### 4. Repository Methods (agregar a repositorios existentes)

#### 4.1 En PagoRepository.java
```java
// Agregar estos métodos:

Integer countByFechaRegistroBetween(Instant inicio, Instant fin);

@Query("SELECT SUM(p.montoFinal) FROM Pago p WHERE p.estado = :estado AND p.fechaRegistro BETWEEN :inicio AND :fin")
Double sumMontoByEstadoAndFechaBetween(
    @Param("estado") String estado, 
    @Param("inicio") Instant inicio, 
    @Param("fin") Instant fin
);
```

#### 4.2 En AsistenciaRepository.java
```java
// Agregar este método:

@Query("SELECT " +
       "a.cliente.id, " +
       "a.cliente.nombreCompleto, " +
       "a.cliente.email, " +
       "a.cliente.telefono, " +
       "COUNT(a), " +
       "MIN(a.fechaHora), " +
       "MAX(a.fechaHora), " +
       "CASE WHEN a.cliente.fechaVencimiento >= CURRENT_DATE THEN 'activo' ELSE 'vencido' END, " +
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

#### 4.3 En MembresiaRepository.java
```java
// Agregar este método:

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

---

## 🔧 Endpoints Implementados

| Endpoint | Método | Rol | Descripción |
|----------|--------|-----|-------------|
| `/api/reportes/ingresos/mensual` | GET | ADMIN, RECEPCIONISTA | Ingresos de un mes específico |
| `/api/reportes/ingresos/anual` | GET | ADMIN, RECEPCIONISTA | Ingresos mes a mes de un año |
| `/api/reportes/asistencias/por-cliente` | GET | ADMIN, RECEPCIONISTA | Asistencias agrupadas por cliente |
| `/api/reportes/membresias/mas-vendidas` | GET | ADMIN | Membresías más rentables |
| `/api/reportes/comparativo` | GET | ADMIN, RECEPCIONISTA | Comparativa mes actual vs anterior |

---

## 📊 Ejemplos de Uso

### 1. Reporte de Ingresos Mensual
```bash
GET /api/reportes/ingresos/mensual?anio=2025&mes=10
```

**Response:**
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

### 2. Reporte Anual
```bash
GET /api/reportes/ingresos/anual?anio=2025
```

**Response:** Array de 12 objetos (uno por mes)

### 3. Asistencias por Cliente
```bash
GET /api/reportes/asistencias/por-cliente?inicio=2025-10-01&fin=2025-10-31
```

**Response:**
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
    "estadoMembresia": "activo",
    "fechaVencimiento": "2025-12-31"
  }
]
```

### 4. Membresías Más Vendidas
```bash
GET /api/reportes/membresias/mas-vendidas?inicio=2025-01-01&fin=2025-12-31
```

### 5. Reporte Comparativo
```bash
GET /api/reportes/comparativo
```

**Response:**
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
  }
]
```

---

## ✅ Checklist de Implementación

- [ ] Crear los 4 DTOs
- [ ] Crear ReportesService.java
- [ ] Crear ReportesController.java
- [ ] Agregar métodos a PagoRepository
- [ ] Agregar métodos a AsistenciaRepository
- [ ] Agregar métodos a MembresiaRepository
- [ ] Compilar y verificar sin errores
- [ ] Probar cada endpoint
- [ ] Actualizar documentación

---

## 🚀 Próximos Pasos (Opcional)

1. **Exportación a PDF/Excel** (ver EXPORTACION_REPORTES.md)
2. **Gráficos visuales en frontend** (Recharts/Chart.js)
3. **Programación de reportes automáticos** (envío por email)
4. **Caché de reportes** (Redis para reportes pesados)

---

**Estado:** 🔧 LISTO PARA IMPLEMENTAR  
**Fecha:** 14 de octubre de 2025
