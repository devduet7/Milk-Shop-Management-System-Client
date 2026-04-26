// <== IMPORTS ==>
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// <== PROPS TYPE ==>
interface PublicRouteProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== PUBLIC ROUTE COMPONENT ==>
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // GETTING AUTH STATE FROM STORE
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // IF AUTHENTICATED, REDIRECT TO HOME
  if (isAuthenticated) return <Navigate to="/" replace />;
  // RENDER CHILDREN IF NOT AUTHENTICATED
  return <>{children}</>;
};
