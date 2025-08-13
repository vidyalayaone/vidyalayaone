// Teachers management page for admin users

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Users,
  BookOpen,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Teacher, Subject } from '@/api/types';

// Mock data for teachers
const mockTeachers: Teacher[] = [
  {
    id: '1',
    username: 'john.smith',
    email: 'john.smith@school.edu',
    firstName: 'John',
    lastName: 'Smith',
    role: 'TEACHER',
    avatar: '/placeholder.svg',
    phoneNumber: '+1-555-0101',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    employeeId: 'EMP001',
    joiningDate: '2024-01-15',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experience: 8,
    subjects: [
      { id: 'math-1', name: 'Mathematics', code: 'MATH', description: 'Advanced Mathematics', isActive: true },
      { id: 'physics-1', name: 'Physics', code: 'PHY', description: 'General Physics', isActive: true }
    ],
    classes: [
      {
        id: 'class-1',
        classId: '10-A',
        className: 'Grade 10 Section A',
        grade: '10',
        section: 'A',
        subject: { id: 'math-1', name: 'Mathematics', code: 'MATH', description: 'Advanced Mathematics', isActive: true },
        isClassTeacher: true
      },
      {
        id: 'class-2',
        classId: '10-B',
        className: 'Grade 10 Section B',
        grade: '10',
        section: 'B',
        subject: { id: 'math-1', name: 'Mathematics', code: 'MATH', description: 'Advanced Mathematics', isActive: true },
        isClassTeacher: false
      }
    ],
    address: {
      street: '123 Teacher Lane',
      city: 'Education City',
      state: 'Academic State',
      postalCode: '12345',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0102',
      email: 'jane.smith@email.com'
    },
    salary: 75000,
    dateOfBirth: '1985-03-20',
    gender: 'MALE',
    bloodGroup: 'A+',
    maritalStatus: 'MARRIED'
  },
  {
    id: '2',
    username: 'sarah.johnson',
    email: 'sarah.johnson@school.edu',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'TEACHER',
    phoneNumber: '+1-555-0201',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    employeeId: 'EMP002',
    joiningDate: '2024-02-01',
    qualification: 'M.A. English Literature, B.Ed.',
    experience: 5,
    subjects: [
      { id: 'english-1', name: 'English', code: 'ENG', description: 'English Literature', isActive: true }
    ],
    classes: [
      {
        id: 'class-3',
        classId: '9-A',
        className: 'Grade 9 Section A',
        grade: '9',
        section: 'A',
        subject: { id: 'english-1', name: 'English', code: 'ENG', description: 'English Literature', isActive: true },
        isClassTeacher: true
      }
    ],
    address: {
      street: '456 Academic Ave',
      city: 'Learning Town',
      state: 'Knowledge State',
      postalCode: '54321',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Robert Johnson',
      relationship: 'Father',
      phoneNumber: '+1-555-0202'
    },
    salary: 68000,
    dateOfBirth: '1988-07-15',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    maritalStatus: 'SINGLE'
  },
  {
    id: '3',
    username: 'michael.brown',
    email: 'michael.brown@school.edu',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'TEACHER',
    phoneNumber: '+1-555-0301',
    schoolId: 'school-1',
    isActive: false,
    createdAt: '2023-09-01T08:00:00Z',
    updatedAt: '2024-08-01T08:00:00Z',
    employeeId: 'EMP003',
    joiningDate: '2023-09-01',
    qualification: 'M.Sc. Chemistry, B.Ed.',
    experience: 12,
    subjects: [
      { id: 'chemistry-1', name: 'Chemistry', code: 'CHEM', description: 'Organic Chemistry', isActive: true },
      { id: 'biology-1', name: 'Biology', code: 'BIO', description: 'General Biology', isActive: true }
    ],
    classes: [],
    address: {
      street: '789 Science St',
      city: 'Research City',
      state: 'Innovation State',
      postalCode: '98765',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lisa Brown',
      relationship: 'Wife',
      phoneNumber: '+1-555-0302',
      email: 'lisa.brown@email.com'
    },
    salary: 82000,
    dateOfBirth: '1980-11-10',
    gender: 'MALE',
    bloodGroup: 'O+',
    maritalStatus: 'MARRIED'
  }
];

const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);

  // Get unique subjects for filter
  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    teachers.forEach(teacher => {
      teacher.subjects.forEach(subject => {
        subjects.add(subject.name);
      });
    });
    return Array.from(subjects);
  }, [teachers]);

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = searchTerm === '' || 
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && teacher.isActive) ||
        (statusFilter === 'inactive' && !teacher.isActive);

      const matchesSubject = subjectFilter === 'all' ||
        teacher.subjects.some(subject => subject.name === subjectFilter);

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [teachers, searchTerm, statusFilter, subjectFilter]);

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setDeleteTeacherId(null);
  };

  const handleResetPassword = (teacherId: string) => {
    // Mock password reset
    console.log('Password reset for teacher:', teacherId);
    // In real implementation, this would call an API
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Email', 'Phone', 'Subjects', 'Classes', 'Status', 'Experience'].join(','),
      ...filteredTeachers.map(teacher => [
        teacher.employeeId,
        `${teacher.firstName} ${teacher.lastName}`,
        teacher.email,
        teacher.phoneNumber || '',
        teacher.subjects.map(s => s.name).join('; '),
        teacher.classes.length.toString(),
        teacher.isActive ? 'Active' : 'Inactive',
        `${teacher.experience} years`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive).length,
    inactive: teachers.filter(t => !t.isActive).length,
    subjects: allSubjects.length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground">Manage teaching staff and their assignments</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/teachers/create">
                <Plus className="w-4 h-4" />
                Add Teacher
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subjects}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search teachers by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {allSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
            <p className="text-sm text-muted-foreground">Click on any teacher row to view details</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow 
                      key={teacher.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={teacher.avatar} alt={`${teacher.firstName} ${teacher.lastName}`} />
                            <AvatarFallback>{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                            <div className="text-sm text-muted-foreground">{teacher.qualification}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{teacher.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {teacher.email}
                          </div>
                          {teacher.phoneNumber && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {teacher.phoneNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject) => (
                            <Badge key={subject.id} variant="secondary" className="text-xs">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{teacher.classes.length} Classes</div>
                          {teacher.classes.some(c => c.isClassTeacher) && (
                            <Badge variant="outline" className="text-xs">Class Teacher</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {teacher.experience} years
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={teacher.isActive ? "default" : "secondary"}>
                          {teacher.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(teacher.id)}>
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteTeacherId(teacher.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">No teachers found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding a new teacher.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTeacherId} onOpenChange={() => setDeleteTeacherId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the teacher
                account and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTeacherId && handleDeleteTeacher(deleteTeacherId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default TeachersPage;
