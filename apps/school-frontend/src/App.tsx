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
import PublicApplicationPage from './pages/admission/PublicApplicationPage';
import AdmissionApplicationsPage from './pages/admission/AdmissionApplicationsPage';
import ApplicationDetailPage from './pages/admission/ApplicationDetailPage';

// Attendance Pages
import AttendancePage from './pages/attendance/AttendancePage';
import MarkStudentAttendancePage from './pages/attendance/MarkStudentAttendancePage';

// Exams Pages
import ExamsPage from './pages/exams/ExamsPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import CreateExamPage from './pages/exams/CreateExamPage';
import EditExamPage from './pages/exams/EditExamPage';

// Timetable Pages
import TimetablePage from './pages/timetable/TimetablePage';

// Substitute Teacher Pages
import SubstituteTeacherPage from './pages/substitute-teacher/SubstituteTeacherPage';

// Academic Calendar Pages
import AcademicCalendarPage from './pages/academic-calendar/AcademicCalendarPage';

// Fees Pages
import FeesPage from './pages/fees/FeesPage';

// Route Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import PublicRoute from './components/guards/PublicRoute';
import FlowRoute from './components/guards/FlowRoute';

// Error Components
import SchoolNotFoundError from './components/SchoolNotFoundError';

import { PERMISSIONS } from '@/utils/permissions';

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
  const { isInitializing, schoolNotFound } = useAuthStore();
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

  // Show error page if school is not found
  if (schoolNotFound) {
    return <SchoolNotFoundError />;
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

            <Route
              path="/apply"
              element={
                <PublicRoute>
                  <PublicApplicationPage />
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
                <ProtectedRoute requiredPermissions={[]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Students Routes - Admin only */}
            <Route
              path="/students"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.STUDENT.VIEW]}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.STUDENT.VIEW]}>
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            />
              <Route
                path="/students/:id/edit"
                element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.STUDENT.VIEW]}>
                    <EditStudentPage />
                  </ProtectedRoute>
                }
              />
            {/* <Route
              path="/students/:id/fees"
              element={
                <ProtectedRoute>
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            /> */}

          {/* Teachers Routes - Admin only */}
            <Route
              path="/teachers"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.TEACHER.VIEW]}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/create"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.TEACHER.VIEW]}>
                  <CreateTeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.TEACHER.VIEW]}>
                  <TeacherDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id/edit"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.TEACHER.VIEW]}>
                  <EditTeacherPage />
                </ProtectedRoute>
              }
            />

            {/* Classes Routes - Admin only */}
            <Route
              path="/classes"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.CLASS.VIEW]}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:classId/:sectionId"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.SECTION.VIEW]}>
                  <ClassSectionPage />
                </ProtectedRoute>
              }
            />

            {/* Subjects Routes - Admin only */}
            {/* <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <SubjectsPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Admission Routes - Admin only */}
            <Route
              path="/admission"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ADMISSION.VIEW]}>
                  <AdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/single"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ADMISSION.VIEW]}>
                  <SingleStudentAdmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/applications"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ADMISSION.VIEW]}>
                  <AdmissionApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admission/applications/:id"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ADMISSION.VIEW]}>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Attendance Routes - Admin only */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ATTENDANCE.VIEW]}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/mark"
              element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.ATTENDANCE.MARK]}>
                  <MarkStudentAttendancePage />
                </ProtectedRoute>
              }
            />

            {/* Exams Routes - Admin only */}
            {/* <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/create"
              element={
                <ProtectedRoute>
                  <CreateExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/:id/edit"
              element={
                <ProtectedRoute>
                  <EditExamPage />
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
            /> */}

            {/* Timetable Routes - Admin only */}
            {/* <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimetablePage />
                </ProtectedRoute>
              }
            /> */}

            {/* Substitute Teacher Routes - Admin only */}
            {/* <Route
              path="/substitute-teacher"
              element={
                <ProtectedRoute>
                  <SubstituteTeacherPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Academic Calendar Routes - Admin only */}
            {/* <Route
              path="/academic-calendar"
              element={
                <ProtectedRoute>
                  
                  <AcademicCalendarPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Fees Routes - Admin only */}
            {/* <Route
              path="/fees"
              element={
                <ProtectedRoute>
                  <FeesPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/not-found" element={<h1>Page Not Found</h1>} />

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