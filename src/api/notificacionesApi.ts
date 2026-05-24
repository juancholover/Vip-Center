import { axiosClient } from "./axiosClient";

export interface ConfiguracionNotificacion {
  emailEnabled: boolean;
  emailFrom: string;
}

export const NotificacionesApi = {
  obtenerConfiguracion: async (): Promise<ConfiguracionNotificacion> => {
    const { data } = await axiosClient.get("/configuracion/notificaciones");
    return {
      emailEnabled: data.emailEnabled ?? true,
      emailFrom: data.emailFrom ?? "",
    };
  },

  guardarConfiguracion: async (
    config: ConfiguracionNotificacion
  ): Promise<ConfiguracionNotificacion> => {
    const { data } = await axiosClient.post("/configuracion/notificaciones", config);
    return {
      emailEnabled: data.emailEnabled ?? config.emailEnabled,
      emailFrom: data.emailFrom ?? config.emailFrom,
    };
  },
};
