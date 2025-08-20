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
import StudentDetailPage from './pages/students/StudentDetailPage';
import EditStudentPage from './pages/students/EditStudentPage';

// Classes Pages
import ClassesPage from './pages/classes/ClassesPage';
import ClassSectionPage from './pages/classes/ClassSectionPage';

// Subjects Pages
import SubjectsPage from './pages/subjects/SubjectsPage';

// Admission Pages
import AdmissionPage from './pages/admission/AdmissionPage';
import SingleStudentAdmissionPage from './pages/admission/SingleStudentAdmissionPage';
import MultipleStudentAdmissionPage from './pages/admission/MultipleStudentAdmissionPage';
import BulkImportAdmissionPage from './pages/admission/BulkImportAdmissionPage';
import AdmissionApplicationsPage from './pages/admission/AdmissionApplicationsPage';
import ApplicationDetailPage from './pages/admission/ApplicationDetailPage';

// Attendance Pages
import AttendancePage from './pages/attendance/AttendancePage';

// Exams Pages
import ExamsPage from './pages/exams/ExamsPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';

// Timetable Pages
import TimetablePage from './pages/timetable/TimetablePage';

// Academic Calendar Pages
import AcademicCalendarPage from './pages/academic-calendar/AcademicCalendarPage';

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

            {/* Classes Routes - Admin only */}
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:grade/:section"
              element={
                <ProtectedRoute>
                  <ClassSectionPage />
                </ProtectedRoute>
              }
            />

            {/* Subjects Routes - Admin only */}
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <SubjectsPage />
                </ProtectedRoute>
              }
            />

            {/* Admission Routes - Admin only */}
            <Route
              path="/admission"
              element={
                <ProtectedRoute>
                  <AdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/single"
              element={
                <ProtectedRoute>
                  <SingleStudentAdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/multiple"
              element={
                <ProtectedRoute>
                  <MultipleStudentAdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/bulk-import"
              element={
                <ProtectedRoute>
                  <BulkImportAdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/applications"
              element={
                <ProtectedRoute>
                  <AdmissionApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Attendance Routes - Admin only */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            {/* Exams Routes - Admin only */}
            <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/:id"
              element={
                <ProtectedRoute>
                  <ExamDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Timetable Routes - Admin only */}
            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimetablePage />
                </ProtectedRoute>
              }
            />

            {/* Academic Calendar Routes - Admin only */}
            <Route
              path="/academic-calendar"
              element={
                <ProtectedRoute>
                  <AcademicCalendarPage />
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
