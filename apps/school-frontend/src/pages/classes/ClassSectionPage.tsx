// Individual class section page with students, timetable, and attendance tabs

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
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
  BookOpen,
  Clock,
  MapPin,
  FileDown,
  Printer,
  Upload,
  BarChart3,
  User,
  FileText,
  UserCog
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Types
interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  rollNumber: number;
  admissionNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  parentName: string;
  parentPhone: string;
  attendancePercentage: number;
  lastAttendance: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'REGULAR' | 'ONLINE' | 'BREAK';
}

interface DailyTimetable {
  day: string;
  slots: TimeSlot[];
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  reason?: string;
  markedBy: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  qualification: string;
  experience: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teachers: Teacher[];
  periodsPerWeek: number;
  averageGrade: number;
  totalStudents: number;
  syllabusUploaded: boolean;
  syllabusFileName?: string;
  description: string;
}

interface SubjectPerformance {
  subjectId: string;
  averageScore: number;
  totalStudents: number;
  passRate: number;
}

// Mock data
const mockSectionData = {
  'nursery': {
    'default': {
      className: 'Nursery',
      sectionName: 'Default',
      classTeacher: 'Mrs. Sarah Johnson',
      totalStudents: 25,
      totalBoys: 13,
      totalGirls: 12,
    }
  },
  '1': {
    'a': {
      className: 'Grade 1',
      sectionName: 'A',
      classTeacher: 'Mrs. Rachel Green',
      totalStudents: 32,
      totalBoys: 17,
      totalGirls: 15,
    },
    'b': {
      className: 'Grade 1',
      sectionName: 'B',
      classTeacher: 'Mrs. Monica White',
      totalStudents: 30,
      totalBoys: 15,
      totalGirls: 15,
    }
  },
  '10': {
    'a': {
      className: 'Grade 10',
      sectionName: 'A',
      classTeacher: 'Mr. Steven Allen',
      totalStudents: 40,
      totalBoys: 21,
      totalGirls: 19,
    },
    'b': {
      className: 'Grade 10',
      sectionName: 'B',
      classTeacher: 'Mrs. Dorothy Young',
      totalStudents: 38,
      totalBoys: 19,
      totalGirls: 19,
    }
  }
};

const mockStudents: Student[] = [
  {
    id: '1',
    studentId: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    rollNumber: 1,
    admissionNumber: 'ADM001',
    dateOfBirth: '2014-05-15',
    gender: 'MALE',
    parentName: 'Robert Doe',
    parentPhone: '+1-555-0101',
    attendancePercentage: 95,
    lastAttendance: '2024-01-15',
    status: 'ACTIVE',
  },
  {
    id: '2',
    studentId: 'STU002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    rollNumber: 2,
    admissionNumber: 'ADM002',
    dateOfBirth: '2014-03-22',
    gender: 'FEMALE',
    parentName: 'Michael Smith',
    parentPhone: '+1-555-0102',
    attendancePercentage: 92,
    lastAttendance: '2024-01-15',
    status: 'ACTIVE',
  },
  {
    id: '3',
    studentId: 'STU003',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@email.com',
    rollNumber: 3,
    admissionNumber: 'ADM003',
    dateOfBirth: '2014-07-08',
    gender: 'FEMALE',
    parentName: 'Sarah Johnson',
    parentPhone: '+1-555-0103',
    attendancePercentage: 88,
    lastAttendance: '2024-01-14',
    status: 'ACTIVE',
  },
  {
    id: '4',
    studentId: 'STU004',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    rollNumber: 4,
    admissionNumber: 'ADM004',
    dateOfBirth: '2014-01-20',
    gender: 'MALE',
    parentName: 'David Brown',
    parentPhone: '+1-555-0104',
    attendancePercentage: 97,
    lastAttendance: '2024-01-15',
    status: 'ACTIVE',
  },
  {
    id: '5',
    studentId: 'STU005',
    firstName: 'Ashley',
    lastName: 'Davis',
    email: 'ashley.davis@email.com',
    rollNumber: 5,
    admissionNumber: 'ADM005',
    dateOfBirth: '2014-09-12',
    gender: 'FEMALE',
    parentName: 'Jennifer Davis',
    parentPhone: '+1-555-0105',
    attendancePercentage: 75,
    lastAttendance: '2024-01-10',
    status: 'ACTIVE',
  },
];

const mockTimetable: DailyTimetable[] = [
  {
    day: 'Monday',
    slots: [
      { period: 1, startTime: '08:00', endTime: '08:45', subject: 'Mathematics', teacher: 'Mr. John Smith', room: 'Room 101', type: 'REGULAR' },
      { period: 2, startTime: '08:45', endTime: '09:30', subject: 'English', teacher: 'Mrs. Mary Johnson', room: 'Room 102', type: 'REGULAR' },
      { period: 3, startTime: '09:30', endTime: '09:45', subject: 'Break', teacher: '', room: '', type: 'BREAK' },
      { period: 4, startTime: '09:45', endTime: '10:30', subject: 'Science', teacher: 'Dr. Robert Wilson', room: 'Lab 1', type: 'REGULAR' },
      { period: 5, startTime: '10:30', endTime: '11:15', subject: 'Social Studies', teacher: 'Mrs. Linda Brown', room: 'Room 103', type: 'REGULAR' },
      { period: 6, startTime: '11:15', endTime: '12:00', subject: 'Art', teacher: 'Ms. Jennifer Davis', room: 'Art Room', type: 'REGULAR' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { period: 1, startTime: '08:00', endTime: '08:45', subject: 'English', teacher: 'Mrs. Mary Johnson', room: 'Room 102', type: 'REGULAR' },
      { period: 2, startTime: '08:45', endTime: '09:30', subject: 'Mathematics', teacher: 'Mr. John Smith', room: 'Room 101', type: 'REGULAR' },
      { period: 3, startTime: '09:30', endTime: '09:45', subject: 'Break', teacher: '', room: '', type: 'BREAK' },
      { period: 4, startTime: '09:45', endTime: '10:30', subject: 'Physical Education', teacher: 'Coach Mike Taylor', room: 'Gymnasium', type: 'REGULAR' },
      { period: 5, startTime: '10:30', endTime: '11:15', subject: 'Computer Science', teacher: 'Mr. David Lee', room: 'Computer Lab', type: 'ONLINE' },
      { period: 6, startTime: '11:15', endTime: '12:00', subject: 'Music', teacher: 'Mrs. Susan White', room: 'Music Room', type: 'REGULAR' },
    ]
  },
  // Add more days as needed
];

const mockAttendance: AttendanceRecord[] = [
  { studentId: '1', studentName: 'John Doe', date: '2024-01-15', status: 'PRESENT', markedBy: 'Mrs. Rachel Green' },
  { studentId: '2', studentName: 'Jane Smith', date: '2024-01-15', status: 'PRESENT', markedBy: 'Mrs. Rachel Green' },
  { studentId: '3', studentName: 'Emily Johnson', date: '2024-01-15', status: 'ABSENT', reason: 'Sick', markedBy: 'Mrs. Rachel Green' },
  { studentId: '4', studentName: 'Michael Brown', date: '2024-01-15', status: 'PRESENT', markedBy: 'Mrs. Rachel Green' },
  { studentId: '5', studentName: 'Ashley Davis', date: '2024-01-15', status: 'LATE', markedBy: 'Mrs. Rachel Green' },
];

const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Mr. John Smith',
    email: 'john.smith@school.edu',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experience: 8,
  },
  {
    id: 'teacher-2',
    name: 'Mrs. Mary Johnson',
    email: 'mary.johnson@school.edu',
    qualification: 'M.A. English Literature, B.Ed.',
    experience: 6,
  },
  {
    id: 'teacher-3',
    name: 'Dr. Robert Wilson',
    email: 'robert.wilson@school.edu',
    qualification: 'Ph.D. Physics, M.Ed.',
    experience: 12,
  },
  {
    id: 'teacher-4',
    name: 'Mrs. Linda Brown',
    email: 'linda.brown@school.edu',
    qualification: 'M.A. History, B.Ed.',
    experience: 10,
  },
  {
    id: 'teacher-5',
    name: 'Ms. Jennifer Davis',
    email: 'jennifer.davis@school.edu',
    qualification: 'M.F.A. Fine Arts, B.Ed.',
    experience: 5,
  },
];

const mockSubjects: Subject[] = [
  {
    id: 'math-1',
    name: 'Mathematics',
    code: 'MATH',
    teachers: [mockTeachers[0]],
    periodsPerWeek: 6,
    averageGrade: 85.5,
    totalStudents: 40,
    syllabusUploaded: true,
    syllabusFileName: 'mathematics_syllabus_2024.pdf',
    description: 'Advanced Mathematics covering Algebra, Geometry, and Statistics',
  },
  {
    id: 'eng-1',
    name: 'English Literature',
    code: 'ENG',
    teachers: [mockTeachers[1]],
    periodsPerWeek: 5,
    averageGrade: 78.2,
    totalStudents: 40,
    syllabusUploaded: true,
    syllabusFileName: 'english_syllabus_2024.pdf',
    description: 'English Language and Literature with focus on communication skills',
  },
  {
    id: 'sci-1',
    name: 'Physics',
    code: 'PHY',
    teachers: [mockTeachers[2]],
    periodsPerWeek: 4,
    averageGrade: 72.8,
    totalStudents: 40,
    syllabusUploaded: false,
    description: 'Physics covering Mechanics, Thermodynamics, and Electromagnetism',
  },
  {
    id: 'hist-1',
    name: 'History',
    code: 'HIST',
    teachers: [mockTeachers[3]],
    periodsPerWeek: 3,
    averageGrade: 81.3,
    totalStudents: 40,
    syllabusUploaded: true,
    syllabusFileName: 'history_syllabus_2024.pdf',
    description: 'World History and Indian History from ancient to modern times',
  },
  {
    id: 'art-1',
    name: 'Fine Arts',
    code: 'ART',
    teachers: [mockTeachers[4]],
    periodsPerWeek: 2,
    averageGrade: 89.7,
    totalStudents: 40,
    syllabusUploaded: true,
    syllabusFileName: 'arts_syllabus_2024.pdf',
    description: 'Visual Arts including Drawing, Painting, and Sculpture',
  },
  {
    id: 'pe-1',
    name: 'Physical Education',
    code: 'PE',
    teachers: [mockTeachers[0], mockTeachers[2]], // Co-teaching example
    periodsPerWeek: 3,
    averageGrade: 92.1,
    totalStudents: 40,
    syllabusUploaded: false,
    description: 'Physical fitness, sports, and health education',
  },
];

const mockPerformanceData: SubjectPerformance[] = [
  { subjectId: 'math-1', averageScore: 85, totalStudents: 40, passRate: 92 },
  { subjectId: 'eng-1', averageScore: 78, totalStudents: 40, passRate: 88 },
  { subjectId: 'sci-1', averageScore: 73, totalStudents: 40, passRate: 85 },
  { subjectId: 'hist-1', averageScore: 81, totalStudents: 40, passRate: 90 },
  { subjectId: 'art-1', averageScore: 90, totalStudents: 40, passRate: 97 },
  { subjectId: 'pe-1', averageScore: 88, totalStudents: 40, passRate: 95 },
];

const ClassSectionPage: React.FC = () => {
  const { grade, section } = useParams<{ grade: string; section: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<string>('all');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isChangeTeacherOpen, setIsChangeTeacherOpen] = useState(false);
  const [isSyllabusViewOpen, setIsSyllabusViewOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  // Get section data
  const sectionData = grade && section ? mockSectionData[grade as keyof typeof mockSectionData]?.[section as any] : null;

  if (!sectionData || !grade || !section) {
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

  // Filter students
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = selectedGender === 'all' || student.gender.toLowerCase() === selectedGender.toLowerCase();
      
      return matchesSearch && matchesGender;
    });
  }, [searchTerm, selectedGender]);

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    return mockAttendance.filter(record => {
      if (selectedAttendanceFilter === 'all') return true;
      return record.status.toLowerCase() === selectedAttendanceFilter.toLowerCase();
    });
  }, [selectedAttendanceFilter]);

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleRename = () => {
    setNewSectionName(sectionData.sectionName);
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    // In a real app, this would update the section name via API
    console.log('Renaming section to:', newSectionName);
    setIsRenameDialogOpen(false);
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

  const getAttendancePercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
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
                {sectionData.className} - Section {sectionData.sectionName}
              </h1>
              <p className="text-muted-foreground">
                Class Teacher: {sectionData.classTeacher}
              </p>
            </div>
          </div>
          
          <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleRename}>
                <Edit className="mr-2 h-4 w-4" />
                Rename Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Section</DialogTitle>
                <DialogDescription>
                  Enter a new name for this section.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Section name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameSubmit}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sectionData.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in this section
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boys</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sectionData.totalBoys}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((sectionData.totalBoys / sectionData.totalStudents) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Girls</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sectionData.totalGirls}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((sectionData.totalGirls / sectionData.totalStudents) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Teacher</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{sectionData.classTeacher}</div>
              <p className="text-xs text-muted-foreground">
                Primary instructor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            {/* <TabsTrigger value="subjects">
              <BookOpen className="mr-2 h-4 w-4" />
              Subjects
            </TabsTrigger> */}
            <TabsTrigger value="timetable">
              <Calendar className="mr-2 h-4 w-4" />
              Timetable
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatar} />
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
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.parentName}</div>
                            <div className="text-sm text-muted-foreground">{student.parentPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getAttendancePercentageColor(student.attendancePercentage)}`}>
                              {student.attendancePercentage}%
                            </span>
                            {student.attendancePercentage < 80 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStudentClick(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab Content */}
          <TabsContent value="subjects">
            <div className="space-y-6">
              {/* Subject Management Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Subject Management</h3>
                  <p className="text-sm text-gray-600">Manage subjects, teachers, and curriculum for Grade {grade} - Section {section}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsFileUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Curriculum
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performance Report
                  </Button>
                </div>
              </div>

              {/* Subjects Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                      <p className="text-2xl font-bold">{mockSubjects.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Performance</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                      <p className="text-2xl font-bold">{mockTeachers.length}</p>
                    </div>
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                </Card>
              </div>

              {/* Subjects Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Subjects & Teachers</CardTitle>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search subjects..."
                        className="max-w-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Hours/Week</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Curriculum</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSubjects.map((subject) => {
                          const teacher = subject.teachers[0]; // Get first teacher
                          const performance = mockPerformanceData.find(p => p.subjectId === subject.id);
                          
                          return (
                            <TableRow key={subject.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{subject.name}</div>
                                    <div className="text-sm text-gray-500">{subject.code}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{teacher?.name}</div>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="p-0 h-auto text-blue-600 text-xs"
                                      onClick={() => {
                                        setSelectedTeacher(teacher || null);
                                        setIsTeacherProfileOpen(true);
                                      }}
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{subject.periodsPerWeek}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full" 
                                      style={{ width: `${performance?.averageScore || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{performance?.averageScore || 0}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setIsSyllabusViewOpen(true)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSubject(subject);
                                      setIsChangeTeacherOpen(true);
                                    }}
                                  >
                                    <UserCog className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Timetable</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockTimetable.map((day) => (
                    <div key={day.day} className="space-y-2">
                      <h3 className="text-lg font-semibold">{day.day}</h3>
                      <div className="grid gap-2">
                        {day.slots.map((slot) => (
                          <div 
                            key={slot.period} 
                            className={`p-3 rounded-lg border ${
                              slot.type === 'BREAK' 
                                ? 'bg-gray-50 border-gray-200' 
                                : slot.type === 'ONLINE'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="font-medium">{slot.subject}</div>
                                {slot.teacher && (
                                  <div className="text-sm text-muted-foreground">
                                    {slot.teacher}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {slot.room && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {slot.room}
                                  </div>
                                )}
                                {slot.type === 'ONLINE' && (
                                  <Badge variant="secondary">Online</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedAttendanceFilter} onValueChange={setSelectedAttendanceFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Marked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Badge className={getAttendanceStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.reason || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{record.markedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mockAttendance.filter(r => r.status === 'PRESENT').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((mockAttendance.filter(r => r.status === 'PRESENT').length / mockAttendance.length) * 100)}% of class
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {mockAttendance.filter(r => r.status === 'ABSENT').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((mockAttendance.filter(r => r.status === 'ABSENT').length / mockAttendance.length) * 100)}% of class
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Today</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {mockAttendance.filter(r => r.status === 'LATE').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((mockAttendance.filter(r => r.status === 'LATE').length / mockAttendance.length) * 100)}% of class
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Attendance</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {mockStudents.filter(s => s.attendancePercentage < 80).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students below 80%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClassSectionPage;
