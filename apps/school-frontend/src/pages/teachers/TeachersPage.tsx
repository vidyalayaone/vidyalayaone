import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Users,
  BookOpen,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
  Check,
  X,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  ChevronDown
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

import { Teacher, Subject } from '@/api/types';
import { getTeachersBySchool, getSchoolSubjects, deleteTeachers } from '@/api/api';
import { DeleteTeachersRequest } from '@/api/types';
import { transformProfileTeachersToTeachers } from '@/utils/teacherTransform';
import { downloadTeachers } from '@/utils/teacherDownloadUtils';
import toast from 'react-hot-toast';

// Utility function to format joining date
const formatJoiningDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Format as DD/MM/YYYY
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};


const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  // State for sorting
  const [sortField, setSortField] = useState<'name' | 'employeeId' | 'subjects'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // State for bulk operations
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch teachers and subjects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch teachers
        const teachersResponse = await getTeachersBySchool({
          gender: genderFilter !== 'all' ? genderFilter : undefined,
        });

        // Fetch subjects
        const subjectsResponse = await getSchoolSubjects();

        if (teachersResponse.success && teachersResponse.data) {
          const transformedTeachers = transformProfileTeachersToTeachers(teachersResponse.data.teachers);
          setTeachers(transformedTeachers);
        } else {
          setError(teachersResponse.message || 'Failed to fetch teachers');
        }

        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data.subjects);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [genderFilter]);

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = searchTerm === '' || 
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = subjectFilter === 'all' ||
        teacher.subjects.some(subject => subject.name === subjectFilter);

      return matchesSearch && matchesSubject;
    });
  }, [teachers, searchTerm, subjectFilter]);

  // Filter and sort teachers
  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = [...filteredTeachers];

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'employeeId':
          aValue = a.employeeId.toLowerCase();
          bValue = b.employeeId.toLowerCase();
          break;
        case 'subjects':
          aValue = a.subjects.length;
          bValue = b.subjects.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [filteredTeachers, sortField, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = filteredAndSortedTeachers.slice(startIndex, endIndex);

    // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, subjectFilter]);

  // Reset filters when component mounts
  React.useEffect(() => {
    setSubjectFilter('all');
    setGenderFilter('all');
    setSelectedTeachers([]);
  }, []);

  // Helper functions
  const handleSort = (field: 'name' | 'employeeId' | 'subjects') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === currentTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(currentTeachers.map(t => t.id));
    }
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setDeleteTeacherId(teacher.id);
  };

  const handleDeleteTeachers = async (teacherIds: string[]) => {
    if (teacherIds.length === 0) return;

    setIsDeleting(true);
    try {
      const deleteRequest: DeleteTeachersRequest = { teacherIds };
      const response = await deleteTeachers(deleteRequest);
      
      if (response.success && response.data) {
        const { summary, results } = response.data;
        
        // Remove deleted teachers from the local state
        setTeachers(prev => prev.filter(t => !results.deletedTeachers.includes(t.id)));
        
        // Clear selection
        setSelectedTeachers([]);
        
        // Show success message
        if (summary.successfulDeletions === summary.totalRequested) {
          toast.success(`Successfully deleted ${summary.successfulDeletions} teacher${summary.successfulDeletions > 1 ? 's' : ''}`);
        } else {
          toast.error(`Deleted ${summary.successfulDeletions} out of ${summary.totalRequested} teachers. ${summary.failedDeletions} failed.`);
        }
      } else {
        toast.error(response.message || 'Failed to delete teachers');
      }
    } catch (error) {
      console.error('Error deleting teachers:', error);
      toast.error('Failed to delete teachers. Please try again.');
    } finally {
      setIsDeleting(false);
      setBulkDeleteDialogOpen(false);
      setDeleteTeacherId(null);
    }
  };

  const confirmDelete = async () => {
    if (deleteTeacherId) {
      await handleDeleteTeachers([deleteTeacherId]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTeachers.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedTeachers.length > 0) {
      await handleDeleteTeachers(selectedTeachers);
    }
  };

  // Download functionality
  const handleDownload = (format: 'excel' | 'pdf') => {
    try {
      let teachersToDownload: Teacher[] = [];
      let filename = 'teachers';

      if (selectedTeachers.length > 0) {
        // Download selected teachers
        teachersToDownload = teachers.filter(t => selectedTeachers.includes(t.id));
        filename = `selected_teachers_${selectedTeachers.length}`;
      } else {
        // Download all filtered teachers
        teachersToDownload = filteredAndSortedTeachers;
        filename = 'all_teachers';
      }

      if (teachersToDownload.length === 0) {
        toast.error('No teachers to download');
        return;
      }

      downloadTeachers(teachersToDownload, format, filename);
      
      const count = teachersToDownload.length;
      const type = format === 'excel' ? 'Excel' : 'PDF';
      toast.success(`${type} file downloaded successfully (${count} teacher${count > 1 ? 's' : ''})`);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive).length, // All teachers from API are considered active
    inactive: 0, // Backend doesn't provide inactive teachers in this endpoint
    subjects: subjects.length
  };

  React.useEffect(() => {
    setShowBulkActions(selectedTeachers.length > 0);
  }, [selectedTeachers]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading teachers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-destructive">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Error loading teachers</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="space-x-2"
              onClick={() => navigate('/teachers/create')}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Teacher</span>
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
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                    {selectedTeachers.length} teacher{selectedTeachers.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Selected
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload('excel')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download as Excel ({selectedTeachers.length} teachers)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download as PDF ({selectedTeachers.length} teachers)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTeachers([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Total: {filteredAndSortedTeachers.length}
              </CardTitle>
              {loading && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-600">
                {error}
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
          checked={selectedTeachers.length === currentTeachers.length && currentTeachers.length > 0}
          onCheckedChange={handleSelectAll}
          className="rounded-none"
        />
      </TableHead>
      <TableHead 
        className="cursor-pointer"
        onClick={() => handleSort('employeeId')}
      >
        <div className="flex items-center space-x-1">
          <span>Employee ID</span>
          <ArrowUpDown className="h-4 w-4" />
        </div>
      </TableHead>
      <TableHead 
        className="cursor-pointer"
        onClick={() => handleSort('name')}
      >
        <div className="flex items-center space-x-1">
          <span>Teacher Name</span>
          <ArrowUpDown className="h-4 w-4" />
        </div>
      </TableHead>
      <TableHead>Joining Date</TableHead>
      <TableHead 
        className="cursor-pointer"
        onClick={() => handleSort('subjects')}
      >
        <div className="flex items-center space-x-1">
          <span>Subjects</span>
          <ArrowUpDown className="h-4 w-4" />
        </div>
      </TableHead>
      <TableHead className="w-12">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {currentTeachers.map((teacher) => (
      <TableRow 
        key={teacher.id}
        className={`hover:bg-muted/50 transition-colors cursor-pointer ${
          !teacher.isActive ? 'opacity-60' : ''
        }`}
        onClick={() => navigate(`/teachers/${teacher.id}`)}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedTeachers.includes(teacher.id)}
            onCheckedChange={() => handleSelectTeacher(teacher.id)}
            className="rounded-none"
          />
        </TableCell>
        <TableCell>
          <div className="font-mono text-sm font-medium">{teacher.employeeId}</div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium">
                {teacher.firstName} {teacher.lastName}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium">
            {formatJoiningDate(teacher.joiningDate)}
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
              <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Teacher
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteTeacher(teacher)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

              
              {currentTeachers.length === 0 && (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-muted-foreground">
                    {loading 
                      ? 'Loading teachers...' 
                      : error 
                        ? 'Failed to load teachers' 
                        : 'No teachers found.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredAndSortedTeachers.length > teachersPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTeachers.length)} of {filteredAndSortedTeachers.length} teachers
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
        <AlertDialog open={!!deleteTeacherId} onOpenChange={() => setDeleteTeacherId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the teacher
                and remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Teacher'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedTeachers.length} Teachers</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {selectedTeachers.length} teacher{selectedTeachers.length > 1 ? 's' : ''} and 
                remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : `Delete ${selectedTeachers.length} Teacher${selectedTeachers.length > 1 ? 's' : ''}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default TeachersPage;
