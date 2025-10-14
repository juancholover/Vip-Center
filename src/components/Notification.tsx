import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../store/useNotificationStore";

export const Notification = () => {
  const { message, type, clear } = useNotificationStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => clear(), 3500);
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-white shadow-xl ${bg}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
