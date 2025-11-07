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
  TrendingUp,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExamScheduleTab } from '@/components/exams';
import { examAPI, type Exam } from '@/api/exams';

// Seating Plan Types
interface SeatingPlanRow {
  id: string;
  roomName: string;
  className: string;
  fromRollNumber: string;
  toRollNumber: string;
}

// Mock available rooms and classes
const mockRooms = [
  'Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105',
  'Lab A', 'Lab B', 'Auditorium', 'Library Hall'
];

const mockClasses = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  // Seating Plan State
  const [seatingPlan, setSeatingPlan] = useState<SeatingPlanRow[]>([]);
  const [showSeatingTable, setShowSeatingTable] = useState(false);

  // Seating Plan Functions
  const addSeatingRow = () => {
    const newRow: SeatingPlanRow = {
      id: `row-${Date.now()}`,
      roomName: '',
      className: '',
      fromRollNumber: '',
      toRollNumber: ''
    };
    setSeatingPlan([...seatingPlan, newRow]);
  };

  const updateSeatingRow = (id: string, field: keyof SeatingPlanRow, value: string) => {
    setSeatingPlan(seatingPlan.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const removeSeatingRow = (id: string) => {
    setSeatingPlan(seatingPlan.filter(row => row.id !== id));
  };

  const saveSeatingPlan = () => {
    // Here you would typically save to API
    console.log('Saving seating plan:', seatingPlan);
    // Add toast notification or success feedback
  };

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
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(exam)}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/exams/${exam.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Exam Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Start Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(exam.startDate), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(exam.startDate), 'yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">End Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(exam.endDate), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(exam.endDate), 'yyyy')}
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

          {/* Selected Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(exam.selectedSections.map(s => s.grade))).sort((a, b) => parseInt(a) - parseInt(b)).map((grade) => (
                  <Badge key={grade} variant="outline">
                    Class {grade}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <ExamScheduleTab examId={exam.id} exam={exam} />
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grades</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage exam grades
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Exam Grades</h3>
                  <p className="text-muted-foreground mb-4">
                    Grades management will be available here
                  </p>
                  <Button variant="outline">
                    Manage Grades
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