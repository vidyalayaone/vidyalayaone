// Admission management page with three main options

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  FileSpreadsheet,
  GraduationCap,
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAdmissionStats } from '@/api/mockAdmissionAPI';
import { applicationAPI, ApplicationStats } from '@/api/mockAdmissionApplicationAPI';

// Types for admission data
const AdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [applicationStats, setApplicationStats] = useState<ApplicationStats | null>(null);

  // Load application stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await applicationAPI.getApplicationStats();
        setApplicationStats(stats);
      } catch (error) {
        console.error('Error loading application stats:', error);
      }
    };
    loadStats();
  }, []);

  const admissionOptions = [
    {
      id: 'single',
      title: 'Single Student Admission',
      description: 'Add one student at a time with detailed information form',
      icon: UserPlus,
      path: '/admission/single',
      color: 'bg-blue-500',
      benefits: ['Comprehensive data entry', 'Document upload', 'Validation checks']
    },
    {
      id: 'applications',
      title: 'Review Applications',
      description: 'Review and manage admission applications submitted by parents/students',
      icon: ClipboardList,
      path: '/admission/applications',
      color: 'bg-orange-500',
      benefits: ['Application review', 'Approve/Reject', 'Document verification']
    }
  ];

  const handleOptionClick = (path: string) => {
    navigate(path);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Student Admission
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose your preferred method to add new students to the system
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{mockAdmissionStats.totalStudents.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{mockAdmissionStats.thisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
                  <p className="text-2xl font-bold">{applicationStats?.pending || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">{applicationStats?.underReview || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Stats */}
        {applicationStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Application Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{applicationStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{applicationStats.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{applicationStats.underReview}</div>
                  <div className="text-sm text-muted-foreground">Under Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{applicationStats.approved}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{applicationStats.rejected}</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admission Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {admissionOptions.map((option) => {
            const Icon = option.icon;
            
            return (
              <Card 
                key={option.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => handleOptionClick(option.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                    {option.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  
                  <div className="space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(option.path);
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAdmissionStats.recentAdmissions.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {activity.method}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdmissionPage;
