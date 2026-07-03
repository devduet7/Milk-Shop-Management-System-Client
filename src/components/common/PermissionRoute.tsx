// <== IMPORTS ==>
import { Navigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import type { ModulePermissions } from "@/stores/useAuthStore";

// <== PROPS TYPE ==>
interface PermissionRouteProps {
  // <== THE MODULE THIS ROUTE REQUIRES READ-OR-ABOVE ACCESS TO ==>
  moduleKey: keyof ModulePermissions;
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== PERMISSION ROUTE COMPONENT ==>
export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  moduleKey,
  children,
}) => {
  // DERIVING PERMISSION FLAGS FOR THE TARGET MODULE
  const { canView } = usePermission(moduleKey);
  // IF THE USER CANNOT VIEW THIS MODULE, REDIRECT TO UNAUTHORIZED
  if (!canView) return <Navigate to="/unauthorized" replace />;
  // RENDER CHILDREN IF PERMITTED
  return <>{children}</>;
};
