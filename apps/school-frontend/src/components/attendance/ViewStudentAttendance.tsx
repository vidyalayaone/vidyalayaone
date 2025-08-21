import React, { useState, useMemo } from 'react';
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
  ChevronRight
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

// Types
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
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
}

interface StudentAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

// Mock data
const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', rollNumber: 'STU001', className: 'Grade 9', section: 'A', profileImage: undefined },
  { id: '2', name: 'Jane Smith', rollNumber: 'STU002', className: 'Grade 9', section: 'A', profileImage: undefined },
  { id: '3', name: 'Mike Wilson', rollNumber: 'STU003', className: 'Grade 10', section: 'B', profileImage: undefined },
  { id: '4', name: 'Sarah Brown', rollNumber: 'STU004', className: 'Grade 11', section: 'A', profileImage: undefined },
  { id: '5', name: 'Alex Johnson', rollNumber: 'STU005', className: 'Grade 9', section: 'B', profileImage: undefined },
  { id: '6', name: 'Emily Davis', rollNumber: 'STU006', className: 'Grade 10', section: 'A', profileImage: undefined },
  { id: '7', name: 'David Miller', rollNumber: 'STU007', className: 'Grade 11', section: 'B', profileImage: undefined },
  { id: '8', name: 'Lisa Anderson', rollNumber: 'STU008', className: 'Grade 12', section: 'A', profileImage: undefined },
];

const mockAttendanceRecords: Record<string, AttendanceRecord[]> = {
  '1': [
    { id: '1', date: '2025-08-19', status: 'PRESENT', timeIn: '08:15', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '2', date: '2025-08-18', status: 'PRESENT', timeIn: '08:10', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '3', date: '2025-08-17', status: 'PRESENT', timeIn: '08:45', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '4', date: '2025-08-16', status: 'ABSENT', reason: 'Sick', markedBy: 'Mrs. Johnson' },
    { id: '5', date: '2025-08-15', status: 'PRESENT', timeIn: '08:12', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '6', date: '2025-08-14', status: 'LEAVE', reason: 'Medical appointment', markedBy: 'Mrs. Johnson' },
    { id: '7', date: '2025-08-13', status: 'PRESENT', timeIn: '08:08', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '8', date: '2025-08-12', status: 'PRESENT', timeIn: '08:20', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
  ]
};

interface ViewStudentAttendanceProps {
  onBack: () => void;
}

const ViewStudentAttendance: React.FC<ViewStudentAttendanceProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'rollNumber' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0; // Sunday
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAttendanceForDate = (studentId: string, date: string) => {
    const records = mockAttendanceRecords[studentId] || [];
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
    const classes = Array.from(new Set(mockStudents.map(student => student.className)));
    return classes.sort();
  }, []);

  const uniqueSections = useMemo(() => {
    const sections = Array.from(new Set(mockStudents.map(student => student.section)));
    return sections.sort();
  }, []);

  // Filter students based on search term, class, and section
  const filteredStudents = useMemo(() => {
    let filtered = mockStudents.filter(student => {
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
  }, [searchTerm, selectedClass, selectedSection, sortField, sortDirection]);

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
    const records = mockAttendanceRecords[studentId] || [];
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
    const studentRecords = mockAttendanceRecords[selectedStudent.id] || [];
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
            <p className="text-muted-foreground">
              Attendance records for {selectedStudent.name}
            </p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedStudent.profileImage} />
                <AvatarFallback className="text-lg">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
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
                <p className="text-sm text-muted-foreground">
                  Monthly view of attendance records
                </p>
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
                
                return (
                  <div
                    key={day}
                    className={`p-3 h-12 rounded text-center flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${cellStyle}`}
                    title={`${cellDate.toLocaleDateString()} - ${isWeekend(cellDate) ? 'School Closed' : getAttendanceForDate(selectedStudent.id, formatDate(cellDate))?.status || 'No Record'}`}
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
          <p className="text-muted-foreground">
            Search and select a student to view their attendance records
          </p>
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
            
            {/* Class Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Section Filter */}
            <div className="w-full md:w-32">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {uniqueSections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on a student to view their attendance records
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class & Section</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profileImage} />
                          <AvatarFallback className="text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.id}</TableCell>
                    <TableCell>{student.className} - {student.section}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewStudentAttendance;
