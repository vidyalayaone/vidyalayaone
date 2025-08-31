import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      title: 'Manual Admission',
      description: 'Add one student at a time with detailed information form',
      icon: UserPlus,
      path: '/admission/single',
      color: 'bg-blue-500',
      benefits: ['Comprehensive data entry', 'Document upload', 'Validation checks']
    },
    {
      id: 'applications',
      title: 'Applications',
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
              Admission
            </h1>
          </div>
        </div>

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
      </div>
    </DashboardLayout>
  );
};

export default AdmissionPage;
