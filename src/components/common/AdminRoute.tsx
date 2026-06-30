// <== IMPORTS ==>
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// <== PROPS TYPE ==>
interface AdminRouteProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== ADMIN ROUTE COMPONENT ==>
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // GETTING ROLE FROM AUTH STORE
  const role = useAuthStore((state) => state.user?.role);
  // IF NOT ADMIN OR SUPERADMIN, REDIRECT TO UNAUTHORIZED PAGE
  if (role !== "superadmin" && role !== "admin") {
    // REDIRECT TO UNAUTHORIZED PAGE
    return <Navigate to="/unauthorized" replace />;
  }
  // RENDER CHILDREN IF ROLE IS SUFFICIENT
  return <>{children}</>;
};
