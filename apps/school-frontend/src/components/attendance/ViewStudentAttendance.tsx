import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/api/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// Types
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  classId: string;
  sectionId: string;
  profileImage?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  timeIn?: string;
  timeOut?: string;
  reason?: string;
  markedBy: string;
  notes?: string;
}

interface StudentAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

// Types for classes and sections (from backend)
interface ClassSection {
  id: string;
  name: string;
  classTeacher: string | null;
  classTeacherId: string | null;
  totalStudents: number | null;
  totalBoys: number | null;
  totalGirls: number | null;
}

interface ClassData {
  grade: string;
  academicYear: string;
  sections: ClassSection[];
}

interface ViewStudentAttendanceProps {
  onBack: () => void;
}

const ViewStudentAttendance: React.FC<ViewStudentAttendanceProps> = ({ onBack }) => {
  // Auth store
  const { school } = useAuthStore();
  
  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedAcademicYear] = useState('2025-26');
  const [sortField, setSortField] = useState<'name' | 'rollNumber' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord[]>>({});

  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Error states
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Transform backend class data
  const transformBackendClassData = (backendData: any): ClassData[] => {
    if (!backendData || !Array.isArray(backendData)) return [];
    
    return backendData.map((classItem: any) => ({
      grade: classItem.grade || classItem.name || 'Unknown',
      academicYear: classItem.academicYear || selectedAcademicYear,
      sections: (classItem.sections || []).map((section: any) => ({
        id: section.id,
        name: section.name,
        classTeacher: section.classTeacher,
        classTeacherId: section.classTeacherId,
        totalStudents: section.totalStudents || null,
        totalBoys: section.totalBoys || null,
        totalGirls: section.totalGirls || null,
      }))
    }));
  };

  // Fetch classes and sections
  useEffect(() => {
    const fetchClasses = async () => {
      if (!school?.id) return;

      setIsLoadingClasses(true);
      setClassesError(null);

      try {
        const response = await api.getClassesAndSections(school.id, selectedAcademicYear);

        if (response.success && response.data) {
          const transformedData = transformBackendClassData(response.data);
          setClasses(transformedData);
        } else {
          setClassesError(response.message || 'Failed to fetch classes');
          toast.error('Failed to load classes and sections');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClassesError('Failed to load classes');
        toast.error('Failed to load classes and sections');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [school?.id, selectedAcademicYear]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!school?.id) return;

      setIsLoadingStudents(true);
      setStudentsError(null);

      try {
        const response = await api.getStudentsBySchool({ 
          academicYear: selectedAcademicYear,
          classId: selectedClass !== 'all' ? selectedClass : undefined,
          sectionId: selectedSection !== 'all' ? selectedSection : undefined
        });

        if (response.success && response.data) {
          const payload = response.data as any;
          const users = Array.isArray(payload.students) ? payload.students : (payload.data || []);

          const mappedStudents: Student[] = (users || []).map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            rollNumber: u.rollNumber || u.admissionNumber || '',
            className: u.currentClass || 'N/A',
            section: u.currentSection || 'N/A',
            classId: u.classId || '',
            sectionId: u.sectionId || '',
            profileImage: u.profilePhoto || undefined,
          }));

          setStudents(mappedStudents);
        } else {
          setStudentsError(response.message || 'Failed to fetch students');
          toast.error('Failed to load students');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudentsError('Failed to load students');
        toast.error('Failed to load students');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [school?.id, selectedAcademicYear, selectedClass, selectedSection]);

  // Fetch attendance for selected student
  useEffect(() => {
    const fetchStudentAttendance = async () => {
      if (!selectedStudent) return;

      setIsLoadingAttendance(true);

      try {
        // Get current month's start and end dates
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDate = startOfMonth.toISOString().split('T')[0];
        const endDate = endOfMonth.toISOString().split('T')[0];

        const response = await api.getStudentAttendance(selectedStudent.id, startDate, endDate);

        if (response.success && response.data) {
          const records = response.data.attendanceRecords || [];
          const mappedRecords: AttendanceRecord[] = records.map((record: any) => {
            // Use the utility function to safely extract the date
            const normalizedDate = extractDateFromBackend(record.attendanceDate || record.date);
            
            return {
              id: record.id,
              date: normalizedDate,
              status: record.status,
              timeIn: record.timeIn || undefined,
              timeOut: record.timeOut || undefined,
              reason: record.notes || record.reason || undefined,
              markedBy: record.attendanceTakerId || record.markedBy,
              notes: record.notes,
            };
          });

          console.log('Raw backend records:', records);
          console.log('Date conversion examples:');
          records.slice(0, 3).forEach((record: any, index: number) => {
            const original = record.attendanceDate || record.date;
            const converted = extractDateFromBackend(original);
            console.log(`Record ${index + 1}: "${original}" → "${converted}"`);
          });
          console.log('Mapped attendance records:', mappedRecords);
          console.log('Selected student ID:', selectedStudent.id);
          console.log('Current date for filtering:', currentDate);

          setAttendanceRecords({
            [selectedStudent.id]: mappedRecords
          });
        } else {
          toast.error('Failed to load attendance records');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        toast.error('Failed to load attendance records');
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchStudentAttendance();
  }, [selectedStudent, currentDate]);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Utility function to safely extract date from backend format
  const extractDateFromBackend = (backendDate: string): string => {
    if (!backendDate) return '';
    
    // Handle ISO date strings like "2025-09-02T00:00:00.000Z"
    if (backendDate.includes('T')) {
      // Extract just the date part before 'T'
      return backendDate.split('T')[0];
    }
    
    // Handle already formatted dates like "2025-09-02"
    if (backendDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return backendDate;
    }
    
    // For other formats, try to parse and format safely
    try {
      const date = new Date(backendDate);
      // Use getFullYear, getMonth, getDate to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Failed to parse date:', backendDate);
      return '';
    }
  };

  const getAttendanceForDate = (studentId: string, date: string) => {
    const records = attendanceRecords[studentId] || [];
    return records.find(record => record.date === date);
  };

  const getDateCellStyle = (date: Date, studentId: string) => {
    const dateStr = formatDate(date);
    const attendance = getAttendanceForDate(studentId, dateStr);
    
    if (isWeekend(date)) {
      return 'bg-gray-100 text-gray-400'; // School closed
    }
    
    if (!attendance) {
      return 'bg-white border hover:bg-gray-50'; // No record
    }
    
    switch (attendance.status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'LEAVE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-white border';
    }
  };

  const getDateCellContent = (date: Date, studentId: string) => {
    return date.getDate().toString(); // Always show the date number
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get unique classes and sections for filters
  const uniqueClasses = useMemo(() => {
    return classes.map(c => ({ id: c.grade, name: c.grade })).sort((a, b) => a.name.localeCompare(b.name));
  }, [classes]);

  const uniqueSections = useMemo(() => {
    if (selectedClass === 'all') {
      // Get all sections from all classes
      const allSections = classes.flatMap(c => c.sections);
      const uniqueSectionNames = Array.from(new Set(allSections.map(s => s.name)));
      return uniqueSectionNames.sort().map(name => ({ id: name, name }));
    } else {
      // Get sections for selected class
      const selectedClassData = classes.find(c => c.grade === selectedClass);
      if (selectedClassData) {
        return selectedClassData.sections.map(s => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    return [];
  }, [classes, selectedClass]);

  // Filter students based on search term, class, and section
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === 'all' || student.className === selectedClass;
      const matchesSection = selectedSection === 'all' || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        if (sortField === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortField === 'rollNumber') {
          aValue = a.rollNumber.toLowerCase();
          bValue = b.rollNumber.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filtered;
  }, [students, searchTerm, selectedClass, selectedSection, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: 'name' | 'rollNumber') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'name' | 'rollNumber') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Calculate attendance statistics for selected student
  const calculateStats = (studentId: string): StudentAttendanceStats => {
    const records = attendanceRecords[studentId] || [];
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'PRESENT').length;
    const absentDays = records.filter(r => r.status === 'ABSENT').length;
    const leaveDays = records.filter(r => r.status === 'LEAVE').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      attendancePercentage
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive">Absent</Badge>;
      case 'LEAVE':
        return <Badge variant="outline" className="border-blue-300 text-blue-800">Leave</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'LEAVE':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (selectedStudent) {
    const studentRecords = attendanceRecords[selectedStudent.id] || [];
    const stats = calculateStats(selectedStudent.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setSelectedStudent(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-xl">{selectedStudent.name}</CardTitle>
                <p className="text-muted-foreground">
                  Roll Number: {selectedStudent.rollNumber} | Class: {selectedStudent.className}-{selectedStudent.section}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.attendancePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalDays} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
              <p className="text-xs text-muted-foreground">
                Total absences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.leaveDays}</div>
              <p className="text-xs text-muted-foreground">
                Approved leaves
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Calendar</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[140px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading attendance records...</span>
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, index) => (
                    <div key={`empty-${index}`} className="p-3 h-12"></div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: getDaysInMonth(currentDate) }, (_, index) => {
                    const day = index + 1;
                    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const cellStyle = getDateCellStyle(cellDate, selectedStudent.id);
                    const cellContent = getDateCellContent(cellDate, selectedStudent.id);
                    const dateStr = formatDate(cellDate);
                    const attendance = getAttendanceForDate(selectedStudent.id, dateStr);
                    
                    // Log first few days for debugging
                    if (day <= 5) {
                      console.log(`Day ${day} (${dateStr}):`, {
                        cellDate: cellDate.toISOString(),
                        dateStr,
                        attendance,
                        cellStyle,
                        recordDates: attendanceRecords[selectedStudent.id]?.map(r => r.date),
                        isWeekend: isWeekend(cellDate)
                      });
                    }
                    
                    return (
                      <div
                        key={day}
                        className={`p-3 h-12 rounded text-center flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${cellStyle}`}
                        title={`${cellDate.toLocaleDateString()} - ${isWeekend(cellDate) ? 'School Closed' : attendance?.status || 'No Record'}`}
                        onClick={() => {
                          // Debug click to see data
                          console.log('Cell clicked:', {
                            date: dateStr,
                            attendance,
                            allRecords: attendanceRecords[selectedStudent.id],
                            isWeekend: isWeekend(cellDate)
                          });
                        }}
                      >
                        {cellContent}
                      </div>
                    );
                  })}
                </div>

                {/* Compact Legend */}
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <span>Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                      <span>School Closed</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">View Student Attendance</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name, roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading students...</span>
            </div>
          ) : studentsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Error loading students</p>
              <p className="text-muted-foreground text-sm">{studentsError}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('name')}
                          className="h-auto p-0 font-medium text-left justify-start"
                        >
                          Student Name
                          {getSortIcon('name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('rollNumber')}
                          className="h-auto p-0 font-medium text-left justify-start"
                        >
                          Roll No
                          {getSortIcon('rollNumber')}
                        </Button>
                      </TableHead>
                      <TableHead>Class & Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.className} - {student.section}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredStudents.length === 0 && !isLoadingStudents && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students found matching your search.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewStudentAttendance;
