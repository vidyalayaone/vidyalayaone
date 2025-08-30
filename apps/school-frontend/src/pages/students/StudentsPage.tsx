// Enhanced Students management page for admin users

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
  UserPlus,
  Upload,
  ChevronDown,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  X,
  ArrowUpDown,
  Check,
  FileSpreadsheet,
  FileX
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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

import { api } from '@/api/api'; // <-- add API import to fetch real students
import { useAuthStore } from '@/store/authStore';

// Student type with enhanced fields
type EnhancedStudent = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT';
  avatar: string;
  phoneNumber: string;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  rollNo: string;
  admissionDate: string;
  currentClass: {
    id: string;
    grade: string;
    section: string;
    class: string;
    academicYear: string;
  };
  parentGuardian: {
    fatherName: string;
    fatherPhone: string;
    fatherEmail: string;
    fatherOccupation: string;
    motherName: string;
    motherPhone: string;
    motherEmail: string;
    motherOccupation: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email: string;
  };
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  feeStatus: {
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate?: string;
    status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  };
};

// Types for classes and sections
interface ClassSection {
  id: string;
  name: string;
  classTeacher: string | null;
  classTeacherId: string | null;
  totalStudents: number | null;
  totalBoys: number | null;
  totalGirls: number | null;
}

interface SchoolClass {
  id: string;
  grade: string;
  displayName: string;
  sections: ClassSection[];
}

// Sort types
type SortField = 'name' | 'rollNo' | 'admissionDate' | 'feeStatus';
type SortOrder = 'asc' | 'desc';

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Academic year constant
  const selectedAcademicYear = '2025-26';

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');

  // Students data fetched from backend (start with mock as fallback until fetch completes)
  const [students, setStudents] = useState<EnhancedStudent[]>([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState<boolean>(false);
  const [fetchStudentsError, setFetchStudentsError] = useState<string | null>(null);

  // Classes data fetched from API
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isFetchingClasses, setIsFetchingClasses] = useState<boolean>(false);
  const [fetchClassesError, setFetchClassesError] = useState<string | null>(null);

  const { school } = useAuthStore();

  // Transform backend data to frontend format
  const transformBackendClassData = (backendData: any): SchoolClass[] => {
    return backendData.classes.map((backendClass: any) => ({
      id: backendClass.id,
      grade: backendClass.name,
      displayName: backendClass.name,
      sections: backendClass.sections.map((backendSection: any) => ({
        id: backendSection.id,
        name: backendSection.name,
        classTeacher: null,
        classTeacherId: null,
        totalStudents: null,
        totalBoys: null,
        totalGirls: null,
      }))
    }));
  };

  // Fetch classes and sections based on selected academic year
  React.useEffect(() => {
    const fetchClasses = async () => {
      if (!school?.id) return;

      setIsFetchingClasses(true);
      setFetchClassesError(null);

      try {
        const response = await api.getClassesAndSections(school.id, selectedAcademicYear);

        if (response.success && response.data) {
          const transformedData = transformBackendClassData(response.data);
          setClasses(transformedData);
        } else {
          setFetchClassesError(response.message || 'Failed to fetch classes');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setFetchClassesError('Failed to load classes');
      } finally {
        setIsFetchingClasses(false);
      }
    };

    fetchClasses();
  }, [school?.id, selectedAcademicYear]);

  React.useEffect(() => {
    const fetchStudents = async () => {
      if (!school?.id) return;

      setIsFetchingStudents(true);
      setFetchStudentsError(null);

      try {
        const response = await api.getStudentsBySchool({ academicYear: selectedAcademicYear });

        if (response.success && response.data) {
          const payload = response.data as any;
          const users = Array.isArray(payload.students) ? payload.students : (payload.data || []);

          const mapped: EnhancedStudent[] = (users || []).map((u: any) => ({
            id: u.id,
            username: u.userId || u.admissionNumber || '',
            email: u.email || '',
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            role: 'STUDENT',
            avatar: u.profilePhoto || '/placeholder.svg',
            phoneNumber: '',
            schoolId: response.data.schoolId || school.id,
            isActive: u.isActive || true,
            createdAt: '',
            updatedAt: '',
            studentId: u.admissionNumber || '',
            rollNo: u.rollNumber || u.rollNumber || '',
            admissionDate: u.admissionDate || '',
            currentClass: {
              id: u.classId || '',
              section: u.currentSection || 'N/A',
              class: u.currentClass || (u.currentClass ? `${u.currentClass}` : 'N/A'),
              academicYear: u.academicYear || selectedAcademicYear
            },
            parentGuardian: {
              fatherName: '', fatherPhone: '', fatherEmail: '', fatherOccupation: '',
              motherName: '', motherPhone: '', motherEmail: '', motherOccupation: ''
            },
            address: { street: '', city: '', state: '', postalCode: '', country: '' },
            emergencyContact: { name: '', relationship: '', phoneNumber: '', email: '' },
            dateOfBirth: '',
            gender: 'OTHER',
            bloodGroup: '',
            feeStatus: { totalFee: 0, paidAmount: 0, pendingAmount: 0, status: 'N/A' }
          }));

          setStudents(mapped.length > 0 ? mapped : []);
        } else {
          setFetchStudentsError(response.message || 'Failed to fetch students');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setFetchStudentsError('Failed to load students');
      } finally {
        setIsFetchingStudents(false);
      }
    };

    fetchStudents();
  }, [school?.id, selectedAcademicYear]);

  // Helper function to get available classes
  const availableClasses = useMemo(() => {
    // Use classes from the API based on selected academic year
    if (classes && classes.length > 0) {
      return classes.map(c => c.grade).sort();
    }

    // Fallback to inferring from fetched students
    const classesFromStudents = [...new Set(students.map(student => student.currentClass.grade))].sort();
    return classesFromStudents;
  }, [classes, students]);

  // Helper function to get available sections for selected class
  const availableSections = useMemo(() => {
    // Use classes from the API based on selected academic year
    if (classes && classes.length > 0) {
      if (classFilter === 'all') {
        const all = classes.flatMap(c => c.sections.map(s => s.name));
        return [...new Set(all)].sort();
      }

      const cls = classes.find(c => c.grade === classFilter || c.displayName === classFilter || c.id === classFilter);
      if (cls) return cls.sections.map(s => s.name).sort();
      return [];
    }

    // Fallback to inferring from fetched students
    if (classFilter === 'all') {
      return [...new Set(students.map(student => student.currentClass.section))].sort();
    }
    const sections = [...new Set(
      students
        .filter(student => student.currentClass.grade === classFilter)
        .map(student => student.currentClass.section)
    )].sort();
    return sections;
  }, [classes, classFilter, students]);

  // Reset section filter when class changes
  React.useEffect(() => {
    if (classFilter !== 'all' && availableSections.length === 1) {
      // If only one section available, auto-select it
      setSectionFilter(availableSections[0]);
    } else if (classFilter === 'all') {
      // Reset to all when class is reset
      setSectionFilter('all');
    } else {
      // Reset to all when changing classes
      setSectionFilter('all');
    }
  }, [classFilter, availableSections]);

  // State for sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // State for bulk operations
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<EnhancedStudent | null>(null);

  // Mock API functions
  const mockBulkActions = {
    sendMessage: (studentIds: string[]) => {
      console.log('Sending message to students:', studentIds);
      alert(`Sending messages to ${studentIds.length} students`);
    },
    promoteStudents: (studentIds: string[]) => {
      console.log('Promoting students:', studentIds);
      alert(`Promoting ${studentIds.length} students`);
    },
    exportData: (format: 'csv' | 'excel' | 'pdf') => {
      console.log(`Exporting ${format} for students:`, selectedStudents.length > 0 ? selectedStudents : 'all');
      alert(`Exporting ${format} for ${selectedStudents.length > 0 ? selectedStudents.length : 'all'} students`);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newAdmissions = students.filter(s => {
      const admissionDate = new Date(s.admissionDate);
      return admissionDate >= thirtyDaysAgo;
    }).length;

    return { totalStudents, activeStudents, newAdmissions };
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower);

      // Class filter
      const matchesClass = classFilter === 'all' || student.currentClass.grade === classFilter;

      // Section filter
      const matchesSection = sectionFilter === 'all' || student.currentClass.section === sectionFilter;

      // Fee status filter
      const matchesFeeStatus = feeStatusFilter === 'all' || student.feeStatus.status === feeStatusFilter;

      // Quick filter
      let matchesQuickFilter = true;
      if (quickFilter === 'paid') {
        matchesQuickFilter = student.feeStatus.status === 'PAID';
      } else if (quickFilter === 'pending') {
        matchesQuickFilter = student.feeStatus.status === 'PENDING' || student.feeStatus.status === 'PARTIAL';
      } else if (quickFilter.startsWith('class-')) {
        const grade = quickFilter.split('-')[1];
        matchesQuickFilter = student.currentClass.grade === grade;
      }

      return matchesSearch && matchesClass && matchesSection && matchesFeeStatus && matchesQuickFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'rollNo':
          // Convert roll numbers to integers for proper numerical sorting
          aValue = parseInt(a.rollNo) || 0;
          bValue = parseInt(b.rollNo) || 0;
          break;
        case 'admissionDate':
          aValue = new Date(a.admissionDate);
          bValue = new Date(b.admissionDate);
          break;
        case 'feeStatus':
          const statusOrder = { 'OVERDUE': 0, 'PENDING': 1, 'PARTIAL': 2, 'PAID': 3 };
          aValue = statusOrder[a.feeStatus.status as keyof typeof statusOrder] ?? 99;
          bValue = statusOrder[b.feeStatus.status as keyof typeof statusOrder] ?? 99;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchTerm, classFilter, sectionFilter, feeStatusFilter, quickFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, classFilter, sectionFilter, feeStatusFilter, quickFilter]);

  // Reset filters when component mounts
  React.useEffect(() => {
    setClassFilter('all');
    setSectionFilter('all');
    setFeeStatusFilter('all');
    setQuickFilter('all');
    setSelectedStudents([]);
  }, []);

  // Helper functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(s => s.id));
    }
  };

  const handleDeleteStudent = (student: EnhancedStudent) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      console.log('Deleting student:', studentToDelete.id);
      alert(`Deleting student: ${studentToDelete.firstName} ${studentToDelete.lastName}`);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  React.useEffect(() => {
    setShowBulkActions(selectedStudents.length > 0);
  }, [selectedStudents]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="space-x-2"
              onClick={() => navigate('/admission')}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, admission number, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Class</label>
                  <Select 
                    value={classFilter} 
                    onValueChange={setClassFilter}
                    disabled={isFetchingClasses}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableClasses.map(classGrade => (
                        <SelectItem key={classGrade} value={classGrade}>
                          Class {classGrade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  <Select 
                    value={sectionFilter} 
                    onValueChange={setSectionFilter}
                    disabled={isFetchingClasses || (classFilter !== 'all' && availableSections.length === 1)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {availableSections.map(section => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Fee Status</label>
                  <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => mockBulkActions.exportData('excel')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => mockBulkActions.exportData('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log('Deactivating students:', selectedStudents)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Total: {filteredAndSortedStudents.length}
              </CardTitle>
              {(isFetchingStudents || isFetchingClasses) && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
            </div>
            {(fetchStudentsError || fetchClassesError) && (
              <div className="text-sm text-red-600">
                {fetchStudentsError || fetchClassesError}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="rounded-none"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('rollNo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Roll No</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('feeStatus')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fee Status</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('admissionDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Admission Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                        !student.isActive ? 'opacity-60' : ''
                      }`}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleSelectStudent(student.id)}
                          className="rounded-none"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">{student.rollNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            {!student.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{student.studentId}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.currentClass.class} {student.currentClass.section }</div>
                          {/* <div className="text-sm text-muted-foreground">
                            {student.currentClass.section}
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getFeeStatusBadge(student.feeStatus.status)}
                          {student.feeStatus.pendingAmount > 0 && (
                            <div className="text-sm text-muted-foreground">
                              ${student.feeStatus.pendingAmount} pending
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigate(`/students/${student.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/students/${student.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {student.isActive ? 'Deactivate' : 'Delete'} Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {currentStudents.length === 0 && (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-muted-foreground">
                    {isFetchingStudents 
                      ? 'Loading students...' 
                      : fetchStudentsError 
                        ? 'Failed to load students' 
                        : 'No students found for the selected academic year.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredAndSortedStudents.length > studentsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently {studentToDelete?.isActive ? 'deactivate' : 'delete'} the student
                <strong> {studentToDelete?.firstName} {studentToDelete?.lastName}</strong> and 
                {studentToDelete?.isActive ? ' remove their access to the system.' : ' remove all associated data from the system.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {studentToDelete?.isActive ? 'Deactivate' : 'Delete'} Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentsPage;
