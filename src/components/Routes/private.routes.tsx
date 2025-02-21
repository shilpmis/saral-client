import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/redux/hooks/useAuth";
import { UserRole, Permission } from "@/types/user";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedPermissions?: Permission[];
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
  allowedPermissions,
  redirectTo = "/",
}) => {
  const { isAuthenticated, hasRole, hasPermission, isVerificationInProgress } = useAuth();

  // While verification is in progress, show a loading state.
  if (isVerificationInProgress) {
    return <div>Loading...</div>;
  }

  // If not authenticated after verification, redirect to login.
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  // If allowedRoles is provided, check if the user’s role matches.
  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to="/d" />;
  }

  // If allowedPermissions is provided, check if the user has one of them.
  if (allowedPermissions && !allowedPermissions.some((perm) => hasPermission(perm))) {
    return <Navigate to="/d" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
