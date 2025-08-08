import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToast } from 'react-hot-toast';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Route Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import PublicRoute from './components/guards/PublicRoute';
import FlowRoute from './components/guards/FlowRoute';

// Store initialization
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const { isInitializing } = useAuthStore();

  // Show loading screen while initializing auth state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Only accessible when NOT authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            {/* Flow Routes - Require specific authentication flow state */}
            <Route
              path="/verify-otp"
              element={
                <FlowRoute requireOTPFlow>
                  <VerifyOTPPage />
                </FlowRoute>
              }
            />

            <Route
              path="/reset-password"
              element={
                <FlowRoute requireResetFlow>
                  <ResetPasswordPage />
                </FlowRoute>
              }
            />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Global Components */}
          <Toaster />
          <HotToast 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-background border border-border text-foreground',
            }}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
