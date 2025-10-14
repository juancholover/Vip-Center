import { axiosClient } from "./axiosClient";

export interface ConfiguracionNotificacion {
  emailEnabled: boolean;
  emailFrom: string;
  smsEnabled: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
}

export const NotificacionesApi = {
  /**
   * GET /configuracion/notificaciones
   * Obtiene la configuración actual de notificaciones.
   */
  obtenerConfiguracion: async (): Promise<ConfiguracionNotificacion> => {
    const { data } = await axiosClient.get("/configuracion/notificaciones");
    return data;
  },

  /**
   * POST /configuracion/notificaciones
   * Guarda/actualiza la configuración de notificaciones.
   */
  guardarConfiguracion: async (
    config: ConfiguracionNotificacion
  ): Promise<ConfiguracionNotificacion> => {
    const { data } = await axiosClient.post("/configuracion/notificaciones", config);
    return data;
  },
};
