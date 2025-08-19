// Exams management page for admin users

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  Users,
  BookOpen,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateExamDialog from '@/components/exams/CreateExamDialog';
import { examAPI, type Exam } from '@/api/exams';

const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Load exams on component mount
  useEffect(() => {
    const loadExams = async () => {
      try {
        const examsData = await examAPI.getExams();
        setExams(examsData);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  // Filter exams based on search term
  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (exam: Exam) => {
    if (exam.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    }
    
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

  const handleExamClick = (examId: string) => {
    navigate(`/exams/${examId}`);
  };

  const handleExamCreated = async () => {
    // Refresh the exams list when a new exam is created
    try {
      const examsData = await examAPI.getExams();
      setExams(examsData);
    } catch (error) {
      console.error('Error refreshing exams:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading exams...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
            <p className="text-muted-foreground">
              Manage examinations and assessments
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card 
              key={exam.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleExamClick(exam.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{exam.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(exam.startDate), 'MMM dd')} - {format(new Date(exam.endDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {exam.selectedSections.length} Sections
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(exam)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleExamClick(exam.id);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Exam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        exam.isScheduled ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      {exam.isScheduled ? 'Schedule Created' : 'Schedule Pending'}
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        exam.isFinalised ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      {exam.isFinalised ? 'Finalised' : 'Draft'}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Created {format(new Date(exam.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No exams match your search.' : 'Get started by creating your first exam.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Exam Dialog */}
      <CreateExamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onExamCreated={handleExamCreated}
      />
    </DashboardLayout>
  );
};

export default ExamsPage;
