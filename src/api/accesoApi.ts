import axiosClient from "./axiosClient";

// ===== TYPES =====

export interface MembresiaDTO {
  tipo: string;
  fechaVencimiento: string;
  estado: string;
  diasRestantes: number | null;
}

export interface ClienteAccesoDTO {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  foto?: string;
  membresia: MembresiaDTO | null;
}

export interface VerificarAccesoResponse {
  accesoPermitido: boolean;
  motivo: string;
  cliente: ClienteAccesoDTO | null;
}

export interface RegistrarAsistenciaRequest {
  clienteId: number;
  tipoRegistro: "QR_AUTO" | "MANUAL_STAFF";
  empleadoId?: number;
}

export interface RegistrarAsistenciaConQRRequest {
  qrToken: string;
  tipoRegistro: "INGRESO" | "QR_AUTO" | "MANUAL_STAFF";
  empleadoId?: number;
}

export interface RegistrarAsistenciaResponse {
  id: number;
  clienteId: number;
  fechaHora: string;
  tipoRegistro: string;
  estado: string;
  mensaje: string;
}

export interface AsistenciaRecienteDTO {
  id: number;
  cliente: {
    id: number;
    nombreCompleto: string;
    membresiaTipo: string;
  };
  fechaHora: string;
  tipoRegistro: string;
}

export interface ClienteBusquedaDTO {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string;
  foto?: string;
  membresia: {
    tipo: string;
    estado: string;
    fechaVencimiento: string;
  } | null;
}

// ===== API CLASS =====

class AccesoApiClass {
  /**
   * Verifica si un cliente puede acceder al gimnasio usando el token QR
   */
  async verificarAccesoConQR(qrToken: string): Promise<VerificarAccesoResponse> {
    const response = await axiosClient.get(`/acceso/verificar-qr/${qrToken}`);
    return response.data;
  }

  /**
   * Verifica si un cliente puede acceder al gimnasio (legacy - por ID)
   */
  async verificarAcceso(clienteId: number): Promise<VerificarAccesoResponse> {
    const response = await axiosClient.get(`/acceso/verificar/${clienteId}`);
    return response.data;
  }

  /**
   * Registra la asistencia de un cliente usando token QR
   */
  async registrarAsistenciaConQR(
    request: RegistrarAsistenciaConQRRequest
  ): Promise<RegistrarAsistenciaResponse> {
    const response = await axiosClient.post("/acceso/registrar-qr", request);
    return response.data;
  }

  /**
   * Registra la asistencia de un cliente (legacy - por ID)
   */
  async registrarAsistencia(
    request: RegistrarAsistenciaRequest
  ): Promise<RegistrarAsistenciaResponse> {
    const response = await axiosClient.post("/acceso/registrar", request);
    return response.data;
  }

  /**
   * Obtiene las últimas asistencias registradas
   */
  async obtenerAsistenciasRecientes(
    limite: number = 5
  ): Promise<AsistenciaRecienteDTO[]> {
    const response = await axiosClient.get("/acceso/asistencias-recientes", {
      params: { limite },
    });
    return response.data;
  }

  /**
   * Busca clientes por nombre o teléfono
   */
  async buscarClientes(query: string): Promise<ClienteBusquedaDTO[]> {
    const response = await axiosClient.get("/acceso/buscar-cliente", {
      params: { query },
    });
    return response.data;
  }

  /**
   * Obtiene el contador de ingresos del día
   */
  async obtenerContadorDia(): Promise<{ total: number }> {
    const response = await axiosClient.get("/acceso/contador-dia");
    return response.data;
  }
}

export const AccesoApi = new AccesoApiClass();
