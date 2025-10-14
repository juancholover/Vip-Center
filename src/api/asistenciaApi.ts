import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api/asistencia";

export interface Asistencia {
  id: number;
  fechaHora: string; // ISO format
  tipoRegistro: "QR_AUTO" | "MANUAL_STAFF" | "MOLINETE";
  dispositivo?: string;
  ipAddress?: string;
  latitud?: number;
  longitud?: number;
  notas?: string;
  horaFormateada?: string; // Ej: "08:30 AM" (generado en frontend)
  
  // Cliente (objeto anidado que viene del backend)
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    email?: string;
    telefono?: string;
    estado: string; // "activo", "vencido", "sin-membresia"
    fechaVencimiento?: string;
    membresia?: {
      codigo: string;
      nombre: string;
      color: string;
    };
  };
}

export interface RegistrarAsistenciaRequest {
  token?: string; // Token del QR del cliente
  clienteId?: number; // Para registro manual por staff
  tipoRegistro?: "qr_auto" | "manual_staff" | "molinete";
}

export interface RegistrarAsistenciaResponse {
  success: boolean;
  message: string;
  clienteNombre: string;
  clienteApellido: string;
  asistencia: Asistencia;
  // Información de la membresía actual del cliente
  membresiaActual?: {
    nombre: string;
    color?: string;
    codigo: string;
  };
  fechaVencimiento?: string; // Fecha de vencimiento de la membresía
}

export interface EstadisticasAsistencia {
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  horaPico: string;
  clienteMasFrecuente: string;
}

export const AsistenciaApi = {
  // 🔹 Registrar asistencia mediante token QR
  async registrarPorToken(token: string): Promise<RegistrarAsistenciaResponse> {
    console.log("🔍 Intentando registrar asistencia con token:", token);
    
    try {
      const url = `${BASE_URL}/registrar?token=${encodeURIComponent(token)}`;
      console.log("📡 URL de registro:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("📥 Respuesta del servidor:", res.status, res.statusText);
      
      if (!res.ok) {
        // Intentar leer JSON del backend para extraer mensaje
        let status = res.status;
        let message = "Error al registrar asistencia";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            // El backend puede usar 'mensaje', 'message' o 'error'
            message = (data.mensaje || data.message || data.error || message) as string;
          } else {
            const text = await res.text();
            message = text || message;
          }
        } catch (e) {
          console.error("❌ Error al parsear respuesta de error:", e);
        }
        const err = new Error(message) as Error & { status?: number };
        err.status = status;
        throw err;
      }
      
      const data = await res.json();
      console.log("✅ Asistencia registrada:", data);
      return data;
    } catch (error) {
      console.error("❌ Error en registrarPorToken:", error);
      throw error;
    }
  },

  // 🔹 Registrar asistencia manual (por staff)
  async registrarManual(clienteId: number): Promise<RegistrarAsistenciaResponse> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/registrar-manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clienteId }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al registrar asistencia");
    }

    return res.json();
  },

  // 🔹 Obtener asistencias de hoy
  async obtenerAsistenciasHoy(): Promise<Asistencia[]> {
    const token = useAuthStore.getState().accessToken;
    
    try {
      const res = await fetch(`${BASE_URL}/hoy`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error al obtener asistencias:", res.status, res.statusText);
        return [];
      }

      const data = await res.json();
      
      // El backend puede devolver un array directo o un objeto con { asistencias: [] }
      let asistencias: any[] = [];
      
      if (Array.isArray(data)) {
        asistencias = data;
      } else if (data && Array.isArray(data.asistencias)) {
        console.log("✅ Extrayendo array de asistencias del objeto:", data);
        asistencias = data.asistencias;
      } else {
        console.warn("⚠️ Formato de respuesta no reconocido:", data);
        return [];
      }
      
      // Formatear hora para display
      return asistencias.map((a: any) => ({
        ...a,
        horaFormateada: new Date(a.fechaHora).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }));
    } catch (error) {
      console.error("Error en obtenerAsistenciasHoy:", error);
      return [];
    }
  },

  // 🔹 Obtener asistencias por rango de fechas
  async obtenerAsistenciasPorRango(fechaInicio: string, fechaFin: string): Promise<Asistencia[]> {
    const token = useAuthStore.getState().accessToken;
    
    try {
      const res = await fetch(
        `${BASE_URL}/rango?inicio=${fechaInicio}&fin=${fechaFin}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Error al obtener asistencias por rango:", res.status);
        return [];
      }

      const data = await res.json();
      
      // El backend puede devolver un array directo o un objeto con { asistencias: [] }
      let asistencias: any[] = [];
      
      if (Array.isArray(data)) {
        asistencias = data;
      } else if (data && Array.isArray(data.asistencias)) {
        console.log("✅ Extrayendo array de asistencias del objeto (rango):", data);
        asistencias = data.asistencias;
      } else {
        console.warn("⚠️ Formato de respuesta no reconocido (rango):", data);
        return [];
      }
      
      return asistencias.map((a: Asistencia) => ({
        ...a,
        horaFormateada: new Date(a.fechaHora).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }));
    } catch (error) {
      console.error("Error en obtenerAsistenciasPorRango:", error);
      return [];
    }
  },

  // 🔹 Obtener historial de asistencias de un cliente
  async obtenerHistorialCliente(clienteId: number, limite = 30): Promise<Asistencia[]> {
    const token = useAuthStore.getState().accessToken;
    
    try {
      const res = await fetch(`${BASE_URL}/cliente/${clienteId}?limite=${limite}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error al obtener historial:", res.status);
        return [];
      }

      const data = await res.json();
      
      // El backend puede devolver un array directo o un objeto con { asistencias: [] }
      let asistencias: any[] = [];
      
      if (Array.isArray(data)) {
        asistencias = data;
      } else if (data && Array.isArray(data.asistencias)) {
        console.log("✅ Extrayendo array de asistencias del objeto (historial):", data);
        asistencias = data.asistencias;
      } else {
        console.warn("⚠️ Formato de respuesta no reconocido (historial):", data);
        return [];
      }
      
      return asistencias.map((a: Asistencia) => ({
        ...a,
        horaFormateada: new Date(a.fechaHora).toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }));
    } catch (error) {
      console.error("Error en obtenerHistorialCliente:", error);
      return [];
    }
  },

  // 🔹 Obtener estadísticas de asistencia
  async obtenerEstadisticas(): Promise<EstadisticasAsistencia> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/estadisticas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Error al obtener estadísticas");

    return res.json();
  },

  // 🔹 Verificar si cliente ya registró asistencia hoy
  async verificarAsistenciaHoy(clienteId: number): Promise<boolean> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/verificar/${clienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.registrado === true;
  },

  // 🔹 Eliminar asistencia
  async eliminarAsistencia(id: number): Promise<void> {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Error al eliminar asistencia");
    }
  },
};
