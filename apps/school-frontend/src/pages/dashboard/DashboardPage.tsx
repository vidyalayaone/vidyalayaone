// Main dashboard page with role-based content

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { mockAPI } from '@/api/api';
import { AdminStats, TeacherStats, StudentStats } from '@/api/types';
import { isAdmin, isTeacher, isStudent } from '@/utils/auth';

// Dashboard Components
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | TeacherStats | StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        let response;
        if (isAdmin(user)) {
          response = await mockAPI.getAdminStats();
        } else if (isTeacher(user)) {
          response = await mockAPI.getTeacherStats();
        } else if (isStudent(user)) {
          response = await mockAPI.getStudentStats();
        }

        if (response?.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (!user || !stats) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      );
    }

    if (isAdmin(user)) {
      return <AdminDashboard stats={stats as AdminStats} user={user} />;
    } else if (isTeacher(user)) {
      return <TeacherDashboard stats={stats as TeacherStats} user={user} />;
    } else if (isStudent(user)) {
      return <StudentDashboard stats={stats as StudentStats} user={user} />;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Unknown user role</p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;