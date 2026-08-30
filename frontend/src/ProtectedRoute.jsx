import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 1. Rediriger vers /login si aucun token n'est présent
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Vérification des rôles (si spécifiés, ex: "admin")
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Afficher les routes enfants si l'utilisateur est autorisé
  return <Outlet />;
};

export default ProtectedRoute;