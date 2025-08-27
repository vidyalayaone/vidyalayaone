// Attendance management page for admin users

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users,
  UserCheck,
  ChevronRight,
  Calendar,
  ClipboardList,
  UserPlus
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ViewStudentAttendance from '@/components/attendance/ViewStudentAttendance';
import ViewClassAttendance from '@/components/attendance/ViewClassAttendance';
import AssignSubstituteTeacher from '@/components/attendance/AssignSubstituteTeacher';

// Types for attendance management
type AttendanceView = 'main' | 'student' | 'class' | 'substitute';

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AttendanceView>('main');

  const renderMainMenu = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor student attendance across all classes
          </p>
        </div>
      </div>

      {/* Main Menu Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Attendance */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
              onClick={() => navigate('/attendance/daily')}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Daily Attendance</CardTitle>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Take daily attendance for a specific class section with easy student marking.
            </p>
          </CardContent>
        </Card>

        {/* View Student Attendance */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
              onClick={() => setCurrentView('student')}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student Attendance</CardTitle>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search and view individual student attendance records with detailed history and statistics.
            </p>
          </CardContent>
        </Card>

        {/* View Class Attendance */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setCurrentView('class')}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Class Attendance</CardTitle>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View comprehensive attendance reports for entire classes with matrix views and analytics.
            </p>
          </CardContent>
        </Card>

        {/* Assign Substitute Teacher */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setCurrentView('substitute')}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Substitute Teacher</CardTitle>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Assign substitute teachers to take attendance when regular class teachers are absent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'student':
        return <ViewStudentAttendance onBack={() => setCurrentView('main')} />;
      case 'class':
        return <ViewClassAttendance onBack={() => setCurrentView('main')} />;
      case 'substitute':
        return <AssignSubstituteTeacher onBack={() => setCurrentView('main')} />;
      default:
        return renderMainMenu();
    }
  };

  return (
    <DashboardLayout>
      {renderCurrentView()}
    </DashboardLayout>
  );
};

export default AttendancePage;
