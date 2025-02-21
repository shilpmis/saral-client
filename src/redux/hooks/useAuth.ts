import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { selectAuthState } from "@/redux/slices/authSlice";
import { Permission, UserRole } from "@/types/user";

export function useAuth() {
  const auth = useAppSelector(selectAuthState);

  // Check if the current user has the specified role.
  const hasRole = (role: UserRole): boolean => {
    return auth.user?.role === role;
  };

  // Check if the current user has any of the roles in the list.
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => auth.user?.role === role);
  };

  // Check if the current user has the specified permission.
  const hasPermission = (permission: Permission): boolean => {
    if (!auth.user) return false;
    return auth.user.permissions.includes(permission);
  };

  // Check if the current user has any of the provided permissions.
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!auth.user) return false;
    return permissions.some((permission) => auth.user!.permissions.includes(permission));
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    status: auth.status,
    error: auth.error,
    isVerificationInProgress: auth.isVerificationInProgress,
    isVerificationFails: auth.isVerificationFails,
    verificationError: auth.verificationError,
    isVerificationSuccess: auth.isVerificationSuccess,
    isSignOutInProgress: auth.isSignOutInProgress,
  };
}
