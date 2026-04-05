import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../store/useNotificationStore";

export const Notification = () => {
  const { message, type, clear } = useNotificationStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => clear(), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  // Configuración minimalista formal por tipo
  const config = {
    success: {
      icon: "✓",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-50/95",
      textColor: "text-emerald-900",
      iconBg: "bg-emerald-500",
      shadowColor: "shadow-emerald-100",
    },
    error: {
      icon: "✕",
      borderColor: "border-red-500/30",
      bgColor: "bg-red-50/95",
      textColor: "text-red-900",
      iconBg: "bg-red-500",
      shadowColor: "shadow-red-100",
    },
    info: {
      icon: "i",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-50/95",
      textColor: "text-blue-900",
      iconBg: "bg-blue-500",
      shadowColor: "shadow-blue-100",
    },
  };

  const style = config[type as keyof typeof config] || config.info;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-6 right-6 z-50"
        >
          <div
            className={`
              flex items-start gap-3 min-w-[320px] max-w-md
              px-4 py-3.5 rounded-lg border backdrop-blur-sm
              ${style.bgColor} ${style.borderColor} ${style.shadowColor}
              shadow-lg
            `}
          >
            {/* Icono */}
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded-full ${style.iconBg}
                flex items-center justify-center text-white text-xs font-bold
              `}
            >
              {style.icon}
            </div>

            {/* Mensaje */}
            <div className={`flex-1 text-sm font-medium leading-relaxed ${style.textColor}`}>
              {message}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={clear}
              className={`
                flex-shrink-0 w-5 h-5 rounded-full transition-colors
                hover:bg-black/5 flex items-center justify-center
                ${style.textColor} text-lg leading-none
              `}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>

          {/* Barra de progreso */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            className={`h-0.5 mt-1 rounded-full ${style.iconBg} origin-left`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
