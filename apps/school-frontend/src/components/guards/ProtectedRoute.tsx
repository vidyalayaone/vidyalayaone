// Protected route component - requires authentication and optionally permissions

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { checkNavigationAccess } from '@/config/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[]; // Requires ANY of these permissions
  excludedPermissions?: string[]; // User cannot have any of these permissions
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions,
  excludedPermissions
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission-based access
  const hasAccess = checkNavigationAccess(
    requiredPermissions,
    user.permissions || []
  );

  // Check excluded permissions
  if (excludedPermissions && excludedPermissions.length > 0) {
    const hasExcludedPermission = excludedPermissions.some(permission => 
      (user.permissions || []).includes(permission)
    );
    if (hasExcludedPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (!hasAccess) {
    // User doesn't have required permissions - redirect to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;