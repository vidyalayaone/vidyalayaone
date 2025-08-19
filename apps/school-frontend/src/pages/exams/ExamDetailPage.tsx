// Individual exam detail page with tabs

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Printer,
  FileText,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamScheduleTab } from '@/components/exams';
import { examAPI, type Exam } from '@/api/exams';

const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      if (!id) return;
      
      try {
        const examData = await examAPI.getExam(id);
        setExam(examData);
      } catch (error) {
        console.error('Error loading exam:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading exam...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Exam Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The exam you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/exams')}>
            Back to Exams
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (exam: any) => {
    const currentDate = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    
    if (currentDate < startDate) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return <Badge variant="default">Ongoing</Badge>;
    } else {
      return <Badge variant="secondary">Completed</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/exams')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        </div>

        {/* Exam Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
              <p className="text-muted-foreground">
                {exam.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(exam)}
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Exam Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.ceil((new Date(exam.endDate).getTime() - new Date(exam.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(exam.startDate), 'MMM dd')} - {format(new Date(exam.endDate), 'MMM dd, yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(exam.selectedSections.map(s => s.grade)).size}</div>
                <p className="text-xs text-muted-foreground">
                  Across all grades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sections</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exam.selectedSections.length}</div>
                <p className="text-xs text-muted-foreground">
                  Selected sections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {exam.isFinalised ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                }
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exam.isFinalised ? 'Finalised' : 'Draft'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {exam.isScheduled ? 'Schedule ready' : 'Schedule pending'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Selected Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {exam.selectedSections.map((section) => (
                  <Badge key={section.id} variant="outline">
                    Grade {section.grade} - Section {section.section}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="seating">Seating Plan</TabsTrigger>
            <TabsTrigger value="invigilation">Invigilation</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <ExamScheduleTab examId={exam.id} />
          </TabsContent>

          <TabsContent value="seating" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seating Plan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage seating arrangements for the exam
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Seating Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Seating plan management will be available here
                  </p>
                  <Button variant="outline">
                    Create Seating Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invigilation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invigilation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Assign invigilators for exam sessions
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Invigilation Assignment</h3>
                  <p className="text-muted-foreground mb-4">
                    Invigilation management will be available here
                  </p>
                  <Button variant="outline">
                    Assign Invigilators
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage exam results
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Exam Results</h3>
                  <p className="text-muted-foreground mb-4">
                    Results management will be available here
                  </p>
                  <Button variant="outline">
                    Manage Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ExamDetailPage;
