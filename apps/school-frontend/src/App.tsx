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

// Teachers Pages
import TeachersPage from './pages/teachers/TeachersPage';
import CreateTeacherPage from './pages/teachers/CreateTeacherPage';
import TeacherDetailPage from './pages/teachers/TeacherDetailPage';
import EditTeacherPage from './pages/teachers/EditTeacherPage';

// Students Pages
import StudentsPage from './pages/students/StudentsPage';
import CreateStudentPage from './pages/students/CreateStudentPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import EditStudentPage from './pages/students/EditStudentPage';

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
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});


const App: React.FC = () => {
  const { isInitializing } = useAuthStore();
  // const { school } = useAuthStore();

  // console.log('App initialized with school:', school);

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

            {/* Teachers Routes - Admin only */}
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/create"
              element={
                <ProtectedRoute>
                  <CreateTeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id"
              element={
                <ProtectedRoute>
                  <TeacherDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTeacherPage />
                </ProtectedRoute>
              }
            />

            {/* Students Routes - Admin only */}
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/create"
              element={
                <ProtectedRoute>
                  <CreateStudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id/edit"
              element={
                <ProtectedRoute>
                  <EditStudentPage />
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
