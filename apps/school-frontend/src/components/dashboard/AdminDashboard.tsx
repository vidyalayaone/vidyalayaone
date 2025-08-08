// Admin dashboard component

import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { AdminStats, User } from '@/api/types';
import { getUserFullName, formatDateForUser } from '@/utils/auth';

interface AdminDashboardProps {
  stats: AdminStats;
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, user }) => {
  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers.toLocaleString(),
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses.toLocaleString(),
      icon: BookOpen,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses.toLocaleString(),
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  const quickActions = [
    { title: 'Add New Teacher', icon: Plus, action: () => console.log('Add teacher') },
    { title: 'Add New Student', icon: Plus, action: () => console.log('Add student') },
    { title: 'Create Class', icon: Plus, action: () => console.log('Create class') },
    { title: 'View Reports', icon: Eye, action: () => console.log('View reports') }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your school today.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Administrator
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gradient-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{action.title}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest activities across the school
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} alt={getUserFullName(activity.user)} />
                      <AvatarFallback className="text-xs">
                        {activity.user.firstName?.charAt(0)}{activity.user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateForUser(activity.createdAt, user)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  View All Activities
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            School performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Active Classes</h3>
              <p className="text-2xl font-bold text-primary">{stats.activeClasses}</p>
              <p className="text-sm text-muted-foreground">out of {stats.totalClasses} total</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Student-Teacher Ratio</h3>
              <p className="text-2xl font-bold text-accent">
                {Math.round(stats.totalStudents / stats.totalTeachers)}:1
              </p>
              <p className="text-sm text-muted-foreground">students per teacher</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">School Capacity</h3>
              <p className="text-2xl font-bold text-success">
                {Math.round((stats.totalStudents / 1500) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">of maximum capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;