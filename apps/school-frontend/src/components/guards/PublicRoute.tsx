// Public route component - only accessible when NOT authenticated

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isInPasswordResetFlow } = useAuthStore();

  // If user is authenticated and not in password reset flow, redirect to dashboard
  if (isAuthenticated && !isInPasswordResetFlow()) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated or is in password reset flow
  return <>{children}</>;
};

export default PublicRoute;