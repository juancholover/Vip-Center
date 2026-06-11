import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useNotificationStore } from "./store/useNotificationStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permisos?: string[];
}

export const ProtectedRoute = ({ children, roles, permisos }: ProtectedRouteProps) => {
  const { user, accessToken, loading } = useAuthStore();
  const notify = useNotificationStore((s) => s.show);
  const location = useLocation();
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (notifyMessage) {
      notify(notifyMessage, "error");
      setNotifyMessage(null);
    }
  }, [notifyMessage, notify]);

  if (loading) return null;

  // No autenticado
  if (!accessToken || !user) {
    setNotifyMessage("Debes iniciar sesión para acceder.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sin rol suficiente
  if (roles && roles.length > 0) {
    const userRolesLower = user.roles.map((r) => r.toLowerCase().replace("role_", ""));
    const requiredRolesLower = roles.map((r) => r.toLowerCase().replace("role_", ""));
    
    const hasRole = requiredRolesLower.some((required) =>
      userRolesLower.includes(required)
    );

    if (!hasRole) {
      setNotifyMessage("Acceso restringido: no tienes permisos.");
      return <Navigate to="/" replace />;
    }
  }

  // Sin permiso suficiente
  if (permisos && permisos.length > 0) {
    const userPermCodes = (user.permisos || []).map((p) => p.codigo);
    const hasPermiso = permisos.some((required) =>
      userPermCodes.includes(required)
    );

    if (!hasPermiso) {
      setNotifyMessage("Acceso restringido: no tienes permisos.");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
