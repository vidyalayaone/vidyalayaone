// Student dashboard component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Calendar, 
  TrendingUp,
  Clock,
  Eye,
  ArrowRight
} from 'lucide-react';
import { StudentStats, User } from '@/api/types';

interface StudentDashboardProps {
  stats: StudentStats;
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ stats, user }) => {
  const statCards = [
    {
      title: 'Enrolled Classes',
      value: stats.totalClasses.toString(),
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments.toString(),
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Average Grade',
      value: `${stats.averageGrade.toFixed(1)}%`,
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate.toFixed(1)}%`,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  const quickActions = [
    { title: 'View Assignments', icon: FileText, action: () => console.log('View assignments') },
    { title: 'Check Grades', icon: Award, action: () => console.log('Check grades') },
    { title: 'View Schedule', icon: Calendar, action: () => console.log('View schedule') },
    { title: 'Class Materials', icon: BookOpen, action: () => console.log('Class materials') }
  ];

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-success';
    if (grade >= 80) return 'text-primary';
    if (grade >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-success';
    if (rate >= 90) return 'text-primary';
    if (rate >= 85) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep up the great work on your academic journey.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Student
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
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Access your academic resources
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

        {/* Academic Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Progress
            </CardTitle>
            <CardDescription>
              Your performance overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grade Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Grade</span>
                <span className={`text-sm font-semibold ${getGradeColor(stats.averageGrade)}`}>
                  {stats.averageGrade.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={stats.averageGrade} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.averageGrade >= 90 ? 'Excellent work!' : 
                 stats.averageGrade >= 80 ? 'Good progress!' :
                 stats.averageGrade >= 70 ? 'Keep improving!' :
                 'Need to focus more'}
              </p>
            </div>

            {/* Attendance Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className={`text-sm font-semibold ${getAttendanceColor(stats.attendanceRate)}`}>
                  {stats.attendanceRate.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={stats.attendanceRate} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.attendanceRate >= 95 ? 'Perfect attendance!' : 
                 stats.attendanceRate >= 90 ? 'Great attendance!' :
                 stats.attendanceRate >= 85 ? 'Good attendance!' :
                 'Attendance needs improvement'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming & Current */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>
              Assignments due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingDeadlines.map((assignment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sample Assignment</p>
                      <p className="text-xs text-muted-foreground">Due in 2 days</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  View All Assignments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming assignments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>
              Your latest assignment scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGrades.length > 0 ? (
              <div className="space-y-3">
                {stats.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sample Assignment</p>
                      <p className="text-xs text-muted-foreground">Mathematics</p>
                    </div>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  View All Grades
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent grades</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New grades will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;