// Teacher dashboard component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Clock, 
  Plus,
  Eye,
  ArrowRight,
  CheckSquare
} from 'lucide-react';
import { TeacherStats, User } from '@/api/types';
import { getUserFullName, formatDateForUser } from '@/utils/auth';

interface TeacherDashboardProps {
  stats: TeacherStats;
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ stats, user }) => {
  const statCards = [
    {
      title: 'My Classes',
      value: stats.totalClasses.toString(),
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments.toString(),
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines.length.toString(),
      icon: Clock,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  const quickActions = [
    { title: 'Create Assignment', icon: Plus, action: () => console.log('Create assignment') },
    { title: 'Take Attendance', icon: CheckSquare, action: () => console.log('Take attendance') },
    { title: 'View Classes', icon: Eye, action: () => console.log('View classes') },
    { title: 'Grade Submissions', icon: FileText, action: () => console.log('Grade submissions') }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good morning, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to inspire your students today?
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Teacher
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
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common teaching tasks
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
              <FileText className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest student submissions and activities
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
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Your classes and activities for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock schedule items */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">09:00</p>
                <p className="text-xs text-muted-foreground">AM</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex-1">
                <h4 className="font-medium">Advanced Mathematics</h4>
                <p className="text-sm text-muted-foreground">Room 201 • Grade 12</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">11:00</p>
                <p className="text-xs text-muted-foreground">AM</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex-1">
                <h4 className="font-medium">Physics Laboratory</h4>
                <p className="text-sm text-muted-foreground">Lab 3 • Grade 11</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">02:00</p>
                <p className="text-xs text-muted-foreground">PM</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex-1">
                <h4 className="font-medium">Office Hours</h4>
                <p className="text-sm text-muted-foreground">Room 201 • Student Consultations</p>
              </div>
              <Badge variant="outline">Scheduled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;