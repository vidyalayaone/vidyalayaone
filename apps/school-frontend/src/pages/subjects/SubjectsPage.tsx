import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AssignTeacherModal from '@/components/subjects/AssignTeacherModal';
import AssignClassModal from '@/components/subjects/AssignClassModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Eye, 
  Users, 
  GraduationCap, 
  TrendingUp,
  UserPlus,
  School,
  Upload,
  MoreVertical,
  X,
  User,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teachers: Teacher[];
  classes: ClassInfo[];
  avgGrade: number;
  status: 'ACTIVE' | 'INACTIVE';
  curriculum?: {
    fileName: string;
    uploadedAt: string;
  };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  qualification: string;
  experience: number;
  subjects: string[];
}

interface ClassInfo {
  id: string;
  grade: string;
  section: string;
  studentCount: number;
}

// Mock Data
const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    qualification: 'Ph.D. Mathematics',
    experience: 8,
    subjects: ['Mathematics', 'Statistics']
  },
  {
    id: 'teacher-2',
    name: 'Prof. Michael Brown',
    email: 'michael.brown@school.edu',
    qualification: 'M.A. English Literature',
    experience: 12,
    subjects: ['English', 'Literature']
  },
  {
    id: 'teacher-3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@school.edu',
    qualification: 'Ph.D. Physics',
    experience: 6,
    subjects: ['Physics', 'Science']
  },
  {
    id: 'teacher-4',
    name: 'Ms. Jennifer Wilson',
    email: 'jennifer.wilson@school.edu',
    qualification: 'M.Sc. Chemistry',
    experience: 5,
    subjects: ['Chemistry', 'Science']
  },
  {
    id: 'teacher-5',
    name: 'Mr. David Thompson',
    email: 'david.thompson@school.edu',
    qualification: 'M.A. History',
    experience: 10,
    subjects: ['History', 'Social Studies']
  }
];

const mockClasses: ClassInfo[] = [
  { id: 'class-1', grade: '10', section: 'A', studentCount: 45 },
  { id: 'class-2', grade: '10', section: 'B', studentCount: 42 },
  { id: 'class-3', grade: '11', section: 'A', studentCount: 38 },
  { id: 'class-4', grade: '11', section: 'B', studentCount: 40 },
  { id: 'class-5', grade: '12', section: 'A', studentCount: 35 },
  { id: 'class-6', grade: '12', section: 'B', studentCount: 37 }
];

const mockSubjects: Subject[] = [
  {
    id: 'subject-1',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Advanced Mathematics covering Algebra, Geometry, and Calculus',
    teachers: [mockTeachers[0]],
    classes: [mockClasses[0], mockClasses[1], mockClasses[2]],
    avgGrade: 85.5,
    status: 'ACTIVE',
    curriculum: {
      fileName: 'mathematics_curriculum_2024.pdf',
      uploadedAt: '2024-01-15'
    }
  },
  {
    id: 'subject-2',
    name: 'English Literature',
    code: 'ENG101',
    description: 'English Language and Literature with focus on communication skills',
    teachers: [mockTeachers[1]],
    classes: [mockClasses[0], mockClasses[1], mockClasses[3]],
    avgGrade: 78.2,
    status: 'ACTIVE',
    curriculum: {
      fileName: 'english_curriculum_2024.pdf',
      uploadedAt: '2024-01-20'
    }
  },
  {
    id: 'subject-3',
    name: 'Physics',
    code: 'PHY101',
    description: 'Physics covering Mechanics, Thermodynamics, and Electromagnetism',
    teachers: [mockTeachers[2]],
    classes: [mockClasses[2], mockClasses[4], mockClasses[5]],
    avgGrade: 72.8,
    status: 'ACTIVE'
  },
  {
    id: 'subject-4',
    name: 'Chemistry',
    code: 'CHEM101',
    description: 'Organic and Inorganic Chemistry with laboratory practices',
    teachers: [mockTeachers[3]],
    classes: [mockClasses[2], mockClasses[4]],
    avgGrade: 79.4,
    status: 'ACTIVE'
  },
  {
    id: 'subject-5',
    name: 'History',
    code: 'HIST101',
    description: 'World History and Indian History from ancient to modern times',
    teachers: [mockTeachers[4]],
    classes: [mockClasses[0], mockClasses[3]],
    avgGrade: 81.3,
    status: 'ACTIVE'
  },
  {
    id: 'subject-6',
    name: 'Biology',
    code: 'BIO101',
    description: 'Life Sciences covering Cell Biology, Genetics, and Ecology',
    teachers: [],
    classes: [],
    avgGrade: 0,
    status: 'INACTIVE'
  },
  {
    id: 'subject-7',
    name: 'Computer Science',
    code: 'CS101',
    description: 'Programming fundamentals and Computer Science concepts',
    teachers: [],
    classes: [mockClasses[4], mockClasses[5]],
    avgGrade: 0,
    status: 'ACTIVE'
  }
];

const SubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [showAssignClass, setShowAssignClass] = useState(false);
  const [showTeacherProfile, setShowTeacherProfile] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Filtered subjects based on search and filter
  const filteredSubjects = useMemo(() => {
    return mockSubjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' ||
                          (filterStatus === 'without-teachers' && subject.teachers.length === 0) ||
                          (filterStatus === 'without-classes' && subject.classes.length === 0) ||
                          (filterStatus === 'active' && subject.status === 'ACTIVE') ||
                          (filterStatus === 'inactive' && subject.status === 'INACTIVE');
      
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

  const handleViewDetails = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowSubjectDetails(true);
  };

  const handleTeacherClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherProfile(true);
  };

  const handleClassClick = (classInfo: ClassInfo) => {
    navigate(`/classes/${classInfo.grade}/${classInfo.section}`);
  };

  const handleAssignTeachers = (teacherIds: string[]) => {
    // Mock implementation - in real app this would make API call
    console.log('Assigning teachers:', teacherIds, 'to subject:', selectedSubject?.id);
    // You can add notification/toast here
    alert(`Successfully assigned ${teacherIds.length} teacher(s) to ${selectedSubject?.name}`);
  };

  const handleAssignClasses = (classIds: string[]) => {
    // Mock implementation - in real app this would make API call
    console.log('Assigning classes:', classIds, 'to subject:', selectedSubject?.id);
    alert(`Successfully assigned ${classIds.length} class(es) to ${selectedSubject?.name}`);
  };

  const handleRemoveClasses = (classIds: string[]) => {
    // Mock implementation - in real app this would make API call
    console.log('Removing classes:', classIds, 'from subject:', selectedSubject?.id);
    alert(`Successfully removed ${classIds.length} class(es) from ${selectedSubject?.name}`);
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? 'default' : 'secondary';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600 mt-1">Manage subjects, teachers, and curriculum</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Subjects
            </Button>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold">{mockSubjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                  <p className="text-2xl font-bold">
                    {mockSubjects.filter(s => s.status === 'ACTIVE').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Without Teachers</p>
                  <p className="text-2xl font-bold">
                    {mockSubjects.filter(s => s.teachers.length === 0).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Without Classes</p>
                  <p className="text-2xl font-bold">
                    {mockSubjects.filter(s => s.classes.length === 0).length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subjects by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="without-teachers">Without Teachers</SelectItem>
                  <SelectItem value="without-classes">Without Classes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teachers Count</TableHead>
                    <TableHead>Classes Count</TableHead>
                    <TableHead>Avg Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-sm text-gray-500">{subject.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className={subject.teachers.length === 0 ? 'text-red-600 font-medium' : ''}>
                            {subject.teachers.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className={subject.classes.length === 0 ? 'text-red-600 font-medium' : ''}>
                            {subject.classes.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getGradeColor(subject.avgGrade)}`}>
                          {subject.avgGrade > 0 ? `${subject.avgGrade}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(subject.status)}>
                          {subject.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(subject)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Details Modal */}
      <Dialog open={showSubjectDetails} onOpenChange={setShowSubjectDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{selectedSubject?.name}</div>
                <div className="text-sm text-gray-500">{selectedSubject?.code}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedSubject && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedSubject.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadge(selectedSubject.status)}>
                          {selectedSubject.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Average Grade</label>
                      <p className={`text-sm font-medium mt-1 ${getGradeColor(selectedSubject.avgGrade)}`}>
                        {selectedSubject.avgGrade > 0 ? `${selectedSubject.avgGrade}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedSubject.teachers.length}</p>
                    <p className="text-sm text-gray-600">Teachers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedSubject.classes.length}</p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {selectedSubject.classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Students</p>
                  </CardContent>
                </Card>
              </div>

              {/* Teachers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Associated Teachers ({selectedSubject.teachers.length})</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAssignTeacher(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Teacher
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedSubject.teachers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSubject.teachers.map((teacher) => (
                        <div 
                          key={teacher.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleTeacherClick(teacher)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-gray-500">{teacher.qualification}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.experience} years exp.
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No teachers assigned to this subject</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Classes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Associated Classes ({selectedSubject.classes.length})</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAssignClass(true)}
                  >
                    <School className="h-4 w-4 mr-2" />
                    Assign Class
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedSubject.classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedSubject.classes.map((classInfo) => (
                        <div 
                          key={classInfo.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleClassClick(classInfo)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Building className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Grade {classInfo.grade} - {classInfo.section}</div>
                              <div className="text-sm text-gray-500">{classInfo.studentCount} students</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No classes assigned to this subject</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Curriculum</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowFileUpload(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Curriculum
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedSubject.curriculum ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedSubject.curriculum.fileName}</div>
                          <div className="text-sm text-gray-500">
                            Uploaded on {new Date(selectedSubject.curriculum.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No curriculum uploaded for this subject</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSubjectDetails(false)}>
                  Close
                </Button>
                <Button>
                  Edit Subject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Teacher Profile Modal */}
      <Dialog open={showTeacherProfile} onOpenChange={setShowTeacherProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              Teacher Profile
            </DialogTitle>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacher.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacher.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Qualification</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacher.qualification}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Experience</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacher.experience} years</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Subjects</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTeacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowTeacherProfile(false)}>
                  Close
                </Button>
                <Button onClick={() => navigate(`/teachers/${selectedTeacher.id}`)}>
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Assign Teacher Modal */}
      <AssignTeacherModal
        isOpen={showAssignTeacher}
        onClose={() => setShowAssignTeacher(false)}
        subject={selectedSubject}
        onAssignTeachers={handleAssignTeachers}
      />

      {/* Enhanced Assign Class Modal */}
      <AssignClassModal
        isOpen={showAssignClass}
        onClose={() => setShowAssignClass(false)}
        subject={selectedSubject}
        onAssignClasses={handleAssignClasses}
        onRemoveClasses={handleRemoveClasses}
      />

      {/* Mock File Upload Modal */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Curriculum</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Mock file upload interface for curriculum documents.</p>
            <p className="text-sm text-gray-500 mt-2">This would contain a drag-and-drop file upload area.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFileUpload(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFileUpload(false)}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubjectsPage;
