// Main dashboard page with permission-based content

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/api';
import { AdminStats, TeacherStats, StudentStats } from '@/api/types';
import { canPerformAction } from '@/utils/auth';
import { PERMISSIONS } from '@/utils/permissions';

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
        // Check permissions to determine dashboard type
        if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
          response = await api.getAdminStats();
        } else if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
          response = await api.getTeacherStats();
        } else if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
          response = await api.getStudentStats();
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

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      );
    }

    // Check permissions to determine dashboard component
    if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
      return <AdminDashboard stats={stats as AdminStats} user={user} />;
    } else if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
      return <TeacherDashboard stats={stats as TeacherStats} user={user} />;
    } else if (canPerformAction(user, PERMISSIONS.DASHBOARD.VIEW)) {
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
      {/* {renderDashboardContent()} */}
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
