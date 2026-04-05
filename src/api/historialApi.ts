import axiosClient from './axiosClient';

// ============================================
// INTERFACES
// ============================================

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
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ============================================
// API SERVICE
// ============================================

const historialApi = {
  /**
   * Obtener historial de accesos del usuario autenticado (paginado)
   * @param page - Número de página (0-indexed)
   * @param size - Cantidad de elementos por página (default: 20)
   * @returns Promise con la página de historial
   */
  obtenerMiHistorial: async (page = 0, size = 20): Promise<PaginaHistorial> => {
    const { data } = await axiosClient.get<PaginaHistorial>(
      '/auth/usuarios/me/historial',
      {
        params: { page, size }
      }
    );
    return data;
  }
};

export default historialApi;
