// Admin dashboard component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Activity,
  Plus,
  Eye,
  ArrowRight,
  CalendarCheck,
  PenTool,
  UserPlus,
  MessageCircle,
  DollarSign,
  Calendar,
  CalendarDays,
  ClipboardList,
  BarChart3,
  School,
  Zap
} from 'lucide-react';
import { AdminStats, User } from '@/api/types';
import { getUserFullName, formatDateForUser } from '@/utils/auth';

interface AdminDashboardProps {
  stats: AdminStats;
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, user }) => {
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+3%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses.toLocaleString(),
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+5%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses.toLocaleString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+8%',
      trendColor: 'text-green-600'
    }
  ];

  const quickActions = [
    { 
      title: 'Add New Student', 
      icon: UserPlus, 
      action: () => navigate('/students/create'),
      description: 'Register new student',
      color: 'bg-blue-500'
    },
    { 
      title: 'Add New Teacher', 
      icon: Plus, 
      action: () => navigate('/teachers/create'),
      description: 'Add teaching staff',
      color: 'bg-purple-500'
    },
    { 
      title: 'Create Class', 
      icon: BookOpen, 
      action: () => navigate('/classes/create'),
      description: 'Setup new class',
      color: 'bg-green-500'
    },
    { 
      title: 'Mark Attendance', 
      icon: CalendarCheck, 
      action: () => navigate('/attendance'),
      description: 'Take attendance',
      color: 'bg-orange-500'
    },
    { 
      title: 'Schedule Exam', 
      icon: PenTool, 
      action: () => navigate('/exams/create'),
      description: 'Create new exam',
      color: 'bg-red-500'
    },
    { 
      title: 'Send Announcement', 
      icon: MessageCircle, 
      action: () => navigate('/communication'),
      description: 'Notify students/parents',
      color: 'bg-cyan-500'
    }
  ];

  const managementCards = [
    {
      title: 'Student Management',
      description: 'Manage student records, enrollment, and profiles',
      icon: GraduationCap,
      action: () => navigate('/students'),
      stats: `${stats.totalStudents} students enrolled`,
      color: 'bg-blue-500'
    },
    {
      title: 'Teacher Management',
      description: 'Manage teaching staff, assignments, and schedules',
      icon: Users,
      action: () => navigate('/teachers'),
      stats: `${stats.totalTeachers} teachers active`,
      color: 'bg-purple-500'
    },
    {
      title: 'Academic Calendar',
      description: 'Plan and manage academic events and holidays',
      icon: CalendarDays,
      action: () => navigate('/academic-calendar'),
      stats: 'View upcoming events',
      color: 'bg-green-500'
    },
    {
      title: 'Fee Management',
      description: 'Track payments, dues, and financial records',
      icon: DollarSign,
      action: () => navigate('/fees'),
      stats: 'Monitor payments',
      color: 'bg-orange-500'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate comprehensive reports and insights',
      icon: BarChart3,
      action: () => navigate('/reports'),
      stats: 'View detailed analytics',
      color: 'bg-cyan-500'
    },
    {
      title: 'Time Table',
      description: 'Manage class schedules and time tables',
      icon: Calendar,
      action: () => navigate('/timetable'),
      stats: 'Organize schedules',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <School className="h-8 w-8 text-blue-600" />
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your school today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md border border-border flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          Administrator
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className={stat.trendColor}>{stat.trend}</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-orange-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200 group"
                onClick={action.action}
              >
                <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="font-medium block">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          School Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementCards.map((card) => (
            <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-all duration-300 group" onClick={card.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.color} text-white group-hover:scale-105 transition-transform duration-200`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.stats}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;