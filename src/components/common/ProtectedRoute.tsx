// <== IMPORTS ==>
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// <== PROPS TYPE ==>
interface ProtectedRouteProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== PROTECTED ROUTE COMPONENT ==>
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // GETTING AUTH STATE FROM STORE
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // IF NOT AUTHENTICATED, REDIRECT TO LOGIN
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // RENDER CHILDREN IF AUTHENTICATED
  return <>{children}</>;
};
