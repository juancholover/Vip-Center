import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import SplashScreen from "./SplashScreen";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Componente que carga la sesión desde localStorage
 * antes de renderizar la aplicación
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { loadSession, loading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadSession();
      setInitializing(false);
    };

    init();
  }, [loadSession]);

  // Mostrar splash screen mientras carga la sesión
  if (loading || initializing) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
