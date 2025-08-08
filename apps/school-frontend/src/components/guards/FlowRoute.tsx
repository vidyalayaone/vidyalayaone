// Flow route component - requires specific authentication flow state

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface FlowRouteProps {
  children: React.ReactNode;
  requireOTPFlow?: boolean;
  requireResetFlow?: boolean;
}

const FlowRoute: React.FC<FlowRouteProps> = ({ 
  children, 
  requireOTPFlow = false,
  requireResetFlow = false 
}) => {
  const { canAccessOTPPage, canAccessResetPage, isAuthenticated } = useAuthStore();

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check OTP flow access
  if (requireOTPFlow && !canAccessOTPPage()) {
    return <Navigate to="/login" replace />;
  }

  // Check reset flow access
  if (requireResetFlow && !canAccessResetPage()) {
    return <Navigate to="/login" replace />;
  }

  // User has proper flow state
  return <>{children}</>;
};

export default FlowRoute;