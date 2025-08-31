// Individual class section page with students and attendance tabs

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  ClipboardList, 
  Search, 
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  FileDown,
  Printer,
  Upload,
  BarChart3,
  User,
  FileText,
  UserCog,
  Loader2
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

// Store imports
import { useSectionsStore } from '@/store/sectionsStore';
import { useAuthStore } from '@/store/authStore';

const ClassSectionPage: React.FC = () => {
  const { classId, sectionId } = useParams<{ classId: string; sectionId: string }>();
  const navigate = useNavigate();
  
  // Store hooks
  const { school } = useAuthStore();
  const {
    currentSection,
    loading,
    errors,
    fetchAllSectionData,
    clearCurrentSection,
    clearErrors
  } = useSectionsStore();

  // Local state
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Derived data
  const schoolId = school?.id;
  const sectionDetails = currentSection.details;
  const sectionStudents = currentSection.students;

  // Calculate gender-based counts
  const boysCount = useMemo(() => {
    if (!sectionStudents?.students) return 0;
    return sectionStudents.students.filter(student => student.gender?.toLowerCase() === 'male').length;
  }, [sectionStudents]);

  const girlsCount = useMemo(() => {
    if (!sectionStudents?.students) return 0;
    return sectionStudents.students.filter(student => student.gender?.toLowerCase() === 'female').length;
  }, [sectionStudents]);

  // Fetch data on component mount
  useEffect(() => {
    if (schoolId && classId && sectionId) {
      fetchAllSectionData(schoolId, classId, sectionId);
    }

    // Cleanup on unmount
    return () => {
      clearCurrentSection();
      clearErrors();
    };
  }, [schoolId, classId, sectionId, fetchAllSectionData, clearCurrentSection, clearErrors]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!sectionStudents?.students) return [];
    
    return sectionStudents.students.filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = selectedGender === 'all' || student.gender?.toLowerCase() === selectedGender.toLowerCase();
      
      return matchesSearch && matchesGender;
    });
  }, [sectionStudents, searchTerm, selectedGender]);

  // Handle loading states
  if (loading.details && !sectionDetails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading section details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle error states
  if (errors.details && !sectionDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Error loading section</h1>
          <p className="text-muted-foreground mt-2">{errors.details}</p>
          <Button onClick={() => navigate('/classes')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Handle section not found
  if (!sectionDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Section not found</h1>
          <Button onClick={() => navigate('/classes')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleEditClassTeacher = () => {
    // In a real app, this would open a dialog or navigate to edit teacher assignment
    console.log('Edit class teacher');
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50';
      case 'ABSENT': return 'text-red-600 bg-red-50';
      case 'LATE': return 'text-yellow-600 bg-yellow-50';
      case 'EXCUSED': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/classes')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classes
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {sectionDetails.class.name} - {sectionDetails.section.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading.students ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  sectionStudents?.totalStudents || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enrolled in this section
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boys</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading.students ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  boysCount
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Male students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Girls</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading.students ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  girlsCount
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Female students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Teacher</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold truncate">
                    {sectionDetails.stats.classTeacher?.name || 'Not assigned'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditClassTeacher}
                  className="ml-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <ClipboardList className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students List</CardTitle>
                {errors.students && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {errors.students}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading.students ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading students...</span>
                    </div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No students found</h3>
                    <p className="text-muted-foreground">
                      {sectionStudents?.students.length === 0 
                        ? 'No students are enrolled in this section yet.' 
                        : 'No students match your search criteria.'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleStudentClick(student.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.profileImage} />
                                <AvatarFallback>
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{student.firstName} {student.lastName}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.rollNumber || '-'}</TableCell>
                          <TableCell>
                            {student.dateOfBirth 
                              ? new Date(student.dateOfBirth).toLocaleDateString() 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {student.gender || 'Not specified'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Attendance Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Attendance tracking and management features will be available soon.
                  </p>
                  <Button variant="outline" className="mt-4">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Mark Attendance
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

export default ClassSectionPage;
