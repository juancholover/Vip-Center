import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useNotificationStore } from "./store/useNotificationStore";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, accessToken, loading } = useAuthStore();
  const notify = useNotificationStore((s) => s.show);
  const location = useLocation();

  // ✅ Removido useEffect que causaba logout innecesario
  // El AuthProvider ya maneja la carga de sesión correctamente

  if (loading) return null;

  // No autenticado
  if (!accessToken || !user) {
    notify("Debes iniciar sesión para acceder.", "error");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sin rol suficiente
  if (roles && roles.length > 0) {
    const userRolesLower = user.roles.map((r) => r.toLowerCase().replace("role_", ""));
    const requiredRolesLower = roles.map((r) => r.toLowerCase().replace("role_", ""));
    
    const hasPermission = requiredRolesLower.some((required) =>
      userRolesLower.includes(required)
    );

    if (!hasPermission) {
      notify("Acceso restringido: no tienes permisos.", "error");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
