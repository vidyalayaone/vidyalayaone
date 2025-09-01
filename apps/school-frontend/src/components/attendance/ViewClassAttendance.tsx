import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
interface ClassOption {
  id: string;
  name: string;
  sections: SectionOption[];
}

interface SectionOption {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  attendanceTakerId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceTaker {
  id: string;
  name: string;
}

interface ClassAttendanceData {
  students: Student[];
  attendance: AttendanceRecord[];
  dateRange: string[];
  attendanceTakers: AttendanceTaker[];
}

// Helper function to generate date range
const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};

interface ViewClassAttendanceProps {
  onBack: () => void;
}

const ViewClassAttendance: React.FC<ViewClassAttendanceProps> = ({ onBack }) => {
  const { school } = useAuthStore();
  const selectedAcademicYear = '2025-26';

  // State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2025-01-20');
  const [endDate, setEndDate] = useState<string>('2025-01-27');
  const [showAttendanceTaker, setShowAttendanceTaker] = useState<boolean>(false);

  // Data state
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceTakers, setAttendanceTakers] = useState<AttendanceTaker[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{
    totalWorkingDays: number;
    totalStudents: number;
    totalRecords: number;
    attendanceByStatus: {
      PRESENT: number;
      ABSENT: number;
      LEAVE: number;
    };
  } | null>(null);

  // Loading states
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);

  // Transform backend class data to frontend format
  const transformClassData = (backendData: any): ClassOption[] => {
    return backendData.classes.map((backendClass: any) => ({
      id: backendClass.id,
      name: backendClass.name,
      sections: backendClass.sections.map((backendSection: any) => ({
        id: backendSection.id,
        name: backendSection.name,
      }))
    }));
  };

  // Transform backend student data to frontend format
  const transformStudentData = (backendData: any): Student[] => {
    if (!backendData.students) return [];
    return backendData.students.map((student: any) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`.trim(),
      rollNumber: student.rollNumber || student.admissionNumber || 'N/A',
    }));
  };

  // Fetch classes and sections
  useEffect(() => {
    const fetchClasses = async () => {
      if (!school?.id) return;

      setIsLoadingClasses(true);
      try {
        const response = await api.getClassesAndSections(school.id, selectedAcademicYear);
        if (response.success && response.data) {
          const transformedData = transformClassData(response.data);
          setClasses(transformedData);
        } else {
          toast.error(response.message || 'Failed to fetch classes');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        toast.error('Failed to load classes');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [school?.id, selectedAcademicYear]);

  // Fetch students when class/section is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!school?.id || !selectedClass || !selectedSection) {
        setStudents([]);
        return;
      }

      setIsLoadingStudents(true);
      try {
        const response = await api.getStudentsBySchool({
          academicYear: selectedAcademicYear,
          classId: selectedClass,
          sectionId: selectedSection,
        });

        if (response.success && response.data) {
          const transformedStudents = transformStudentData(response.data);
          setStudents(transformedStudents);
        } else {
          toast.error(response.message || 'Failed to fetch students');
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        toast.error('Failed to load students');
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [school?.id, selectedClass, selectedSection, selectedAcademicYear]);

  // Fetch attendance data for date range
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass || !selectedSection || !students.length) {
        setAttendanceRecords([]);
        setAttendanceTakers([]);
        setWorkingDays([]);
        setAttendanceStats(null);
        return;
      }

      setIsLoadingAttendance(true);
      try {
        const response = await api.getClassAttendanceRange(selectedClass, selectedSection, startDate, endDate);
        
        if (response.success && response.data) {
          const { attendanceRecords, workingDays, stats, meta } = response.data;
          
          setAttendanceRecords(attendanceRecords);
          setWorkingDays(workingDays);
          setAttendanceStats(stats);

          // Extract unique attendance takers with better mapping
          const takerMap = new Map<string, AttendanceTaker>();
          attendanceRecords.forEach((record: AttendanceRecord) => {
            if (record.attendanceTakerId && !takerMap.has(record.attendanceTakerId)) {
              takerMap.set(record.attendanceTakerId, {
                id: record.attendanceTakerId,
                name: 'Teacher', // We'll need to fetch teacher names separately if needed
              });
            }
          });

          setAttendanceTakers(Array.from(takerMap.values()));
        } else {
          toast.error(response.error?.message || 'Failed to load attendance data');
          setAttendanceRecords([]);
          setAttendanceTakers([]);
          setWorkingDays([]);
          setAttendanceStats(null);
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        toast.error('Failed to load attendance data');
        setAttendanceRecords([]);
        setAttendanceTakers([]);
        setWorkingDays([]);
        setAttendanceStats(null);
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendanceData();
  }, [selectedClass, selectedSection, students, startDate, endDate]);

  // Export functions
  const exportToPDF = () => {
    if (!attendanceData) return;

    const className = classes.find(c => c.id === selectedClass)?.name || '';
    const sectionName = availableSections.find(s => s.id === selectedSection)?.name || '';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${className} ${sectionName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .school-info {
              margin-bottom: 20px;
              text-align: center;
            }
            .report-info { 
              margin-bottom: 20px; 
              display: flex;
              justify-content: space-between;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 4px; 
              text-align: center; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .student-name { 
              text-align: left; 
              font-weight: bold;
            }
            .present { background-color: #d4edda; color: #155724; }
            .absent { background-color: #f8d7da; color: #721c24; }
            .leave { background-color: #fff3cd; color: #856404; }
            .summary { 
              margin-top: 20px; 
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .legend {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin-top: 15px;
              font-size: 11px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .legend-box {
              width: 15px;
              height: 15px;
              border: 1px solid #ccc;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>School Attendance Report</h1>
            <div class="school-info">
              <h2>${className} - Section ${sectionName}</h2>
            </div>
          </div>
          
          <div class="report-info">
            <div><strong>Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
            <div><strong>Total Students:</strong> ${attendanceData.students.length}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th rowspan="2">Student Name</th>
                <th rowspan="2">Roll Number</th>
                ${attendanceData.dateRange.map(date => `<th>${formatDate(date)}</th>`).join('')}
                <th rowspan="2">Present</th>
                <th rowspan="2">Absent</th>
                <th rowspan="2">Leave</th>
                <th rowspan="2">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceData.students.map(student => {
                const stats = calculateStudentStats(student.id);
                return `
                  <tr>
                    <td class="student-name">${student.name}</td>
                    <td>${student.rollNumber}</td>
                    ${attendanceData.dateRange.map(date => {
                      const status = getAttendanceStatus(student.id, date);
                      const statusClass = status.toLowerCase();
                      const statusSymbol = status === 'PRESENT' ? '●' : status === 'ABSENT' ? '✖' : '△';
                      return `<td class="${statusClass}">${statusSymbol}</td>`;
                    }).join('')}
                    <td class="present">${stats.present}</td>
                    <td class="absent">${stats.absent}</td>
                    <td class="leave">${stats.leave}</td>
                    <td><strong>${stats.percentage.toFixed(1)}%</strong></td>
                  </tr>
                `;
              }).join('')}
              <tr style="background-color: #f8f9fa; border-top: 2px solid #333;">
                <td colspan="2" style="font-weight: bold; text-align: center;">Daily Attendance %</td>
                ${attendanceData.dateRange.map(date => {
                  const percentage = getDateAttendancePercentage(date);
                  return `<td style="font-weight: bold;">${percentage.toFixed(1)}%</td>`;
                }).join('')}
                <td colspan="4" style="text-align: center; font-style: italic;">
                  Average: ${(attendanceData.dateRange.reduce((acc, date) => acc + getDateAttendancePercentage(date), 0) / attendanceData.dateRange.length).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>

          <div class="legend">
            <div class="legend-item">
              <div class="legend-box present"></div>
              <span>● Present</span>
            </div>
            <div class="legend-item">
              <div class="legend-box absent"></div>
              <span>✖ Absent</span>
            </div>
            <div class="legend-item">
              <div class="legend-box leave"></div>
              <span>△ Leave</span>
            </div>
          </div>

          <div class="summary">
            <h3>Summary Statistics</h3>
            <p><strong>Class Average Attendance:</strong> ${(attendanceData.students.reduce((acc, student) => acc + calculateStudentStats(student.id).percentage, 0) / attendanceData.students.length).toFixed(1)}%</p>
            <p><strong>Total School Days:</strong> ${attendanceData.dateRange.length}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const exportToExcel = () => {
    if (!attendanceData) return;

    const className = classes.find(c => c.id === selectedClass)?.name || '';
    const sectionName = availableSections.find(s => s.id === selectedSection)?.name || '';

    // Create CSV content
    const csvContent = [
      // Header rows
      [`Attendance Report - ${className} Section ${sectionName}`],
      [`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [], // Empty row
      
      // Table headers
      [
        'Student Name',
        'Roll Number',
        ...attendanceData.dateRange.map(date => formatDate(date)),
        'Present Days',
        'Absent Days', 
        'Leave Days',
        'Attendance %'
      ],
      
      // Student data
      ...attendanceData.students.map(student => {
        const stats = calculateStudentStats(student.id);
        return [
          student.name,
          student.rollNumber,
          ...attendanceData.dateRange.map(date => {
            const status = getAttendanceStatus(student.id, date);
            return status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : 'L';
          }),
          stats.present,
          stats.absent,
          stats.leave,
          `${stats.percentage.toFixed(1)}%`
        ];
      }),
      
      // Daily percentage row
      [
        'Daily Attendance %',
        '',
        ...attendanceData.dateRange.map(date => `${getDateAttendancePercentage(date).toFixed(1)}%`),
        '',
        '',
        '',
        `Average: ${(attendanceData.dateRange.reduce((acc, date) => acc + getDateAttendancePercentage(date), 0) / attendanceData.dateRange.length).toFixed(1)}%`
      ],
      
      [], // Empty row
      ['Summary Statistics'],
      [`Class Average: ${(attendanceData.students.reduce((acc, student) => acc + calculateStudentStats(student.id).percentage, 0) / attendanceData.students.length).toFixed(1)}%`],
      [`Total Students: ${attendanceData.students.length}`],
      [`Total School Days: ${attendanceData.dateRange.length}`]
    ];

    // Convert to CSV string
    const csvString = csvContent
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${className}_${sectionName}_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get available sections for selected class
  const availableSections = useMemo(() => {
    const classData = classes.find(c => c.id === selectedClass);
    return classData?.sections || [];
  }, [classes, selectedClass]);

  // Reset section when class changes
  useEffect(() => {
    if (selectedClass && availableSections.length === 1) {
      // Auto-select if only one section
      setSelectedSection(availableSections[0].id);
    } else if (selectedClass && availableSections.length > 1) {
      // Reset selection if multiple sections
      setSelectedSection('');
    }
  }, [selectedClass, availableSections]);

  // Generate attendance data for display
  const attendanceData = useMemo((): ClassAttendanceData | null => {
    if (!selectedClass || !selectedSection || !students.length || !workingDays.length) return null;

    return {
      students,
      attendance: attendanceRecords,
      dateRange: workingDays, // Use working days from backend
      attendanceTakers,
    };
  }, [selectedClass, selectedSection, students, attendanceRecords, workingDays, attendanceTakers]);

  // Calculate student statistics
  const calculateStudentStats = (studentId: string) => {
    if (!attendanceData) return { present: 0, absent: 0, leave: 0, percentage: 0 };

    const studentRecords = attendanceData.attendance.filter(r => r.studentId === studentId);
    const present = studentRecords.filter(r => r.status === 'PRESENT').length;
    const absent = studentRecords.filter(r => r.status === 'ABSENT').length;
    const leave = studentRecords.filter(r => r.status === 'LEAVE').length;
    const total = studentRecords.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { present, absent, leave, percentage };
  };

  // Get attendance status for specific student and date
  const getAttendanceStatus = (studentId: string, date: string) => {
    const record = attendanceData?.attendance.find(r => r.studentId === studentId && r.attendanceDate === date);
    return record?.status || 'ABSENT';
  };

  // Get attendance taker for specific date
  const getAttendanceTaker = (date: string) => {
    const record = attendanceData?.attendance.find(r => r.attendanceDate === date);
    if (!record?.attendanceTakerId) return '-';
    
    const taker = attendanceData?.attendanceTakers.find(t => t.id === record.attendanceTakerId);
    return taker?.name || 'Unknown';
  };

  // Calculate attendance percentage for a specific date
  const getDateAttendancePercentage = (date: string) => {
    if (!attendanceData) return 0;
    
    const totalStudents = attendanceData.students.length;
    const presentStudents = attendanceData.students.filter(student => {
      const status = getAttendanceStatus(student.id, date);
      return status === 'PRESENT';
    }).length;
    
    return totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;
  };

  const getStatusIcon = (status: string, size = 'h-4 w-4') => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className={`${size} text-green-500`} />;
      case 'ABSENT':
        return <XCircle className={`${size} text-red-500`} />;
      case 'LEAVE':
        return <AlertTriangle className={`${size} text-yellow-500`} />;
      default:
        return <XCircle className={`${size} text-red-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 border-green-200';
      case 'ABSENT':
        return 'bg-red-100 border-red-200';
      case 'LEAVE':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-red-100 border-red-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Debug information for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ViewClassAttendance Debug Info:', {
        selectedClass,
        selectedSection,
        studentsCount: students.length,
        attendanceRecordsCount: attendanceRecords.length,
        workingDaysCount: workingDays.length,
        attendanceStats,
        dateRange: workingDays,
        isLoadingClasses,
        isLoadingStudents,
        isLoadingAttendance,
      });
    }
  }, [selectedClass, selectedSection, students, attendanceRecords, workingDays, attendanceStats, isLoadingClasses, isLoadingStudents, isLoadingAttendance]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">View Class Attendance</h1>
          <p className="text-muted-foreground">
            View detailed attendance matrix for classes and sections
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class and Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingClasses ? "Loading classes..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(classOption => (
                    <SelectItem key={classOption.id} value={classOption.id}>
                      {classOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingClasses && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading classes...
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select 
                value={selectedSection} 
                onValueChange={setSelectedSection}
                disabled={!selectedClass || availableSections.length === 0 || isLoadingClasses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClass ? "Select class first" :
                    isLoadingClasses ? "Loading..." :
                    availableSections.length === 0 ? "No sections available" :
                    "Select section"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableSections.length === 1 && (
                <p className="text-xs text-muted-foreground mt-1">Auto-selected: {availableSections[0].name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Loading indicator for students */}
          {isLoadingStudents && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading students...
            </div>
          )}

          {/* Loading indicator for attendance */}
          {isLoadingAttendance && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading attendance data...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Statistics Overview */}
      {attendanceStats && attendanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attendanceStats.totalWorkingDays}</div>
                <div className="text-sm text-blue-600">Working Days</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendanceStats.attendanceByStatus.PRESENT}</div>
                <div className="text-sm text-green-600">Present Records</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{attendanceStats.attendanceByStatus.ABSENT}</div>
                <div className="text-sm text-red-600">Absent Records</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{attendanceStats.attendanceByStatus.LEAVE}</div>
                <div className="text-sm text-yellow-600">Leave Records</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total Records: {attendanceStats.totalRecords} • 
              Average Attendance: {attendanceStats.totalRecords > 0 ? 
                ((attendanceStats.attendanceByStatus.PRESENT / attendanceStats.totalRecords) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Matrix */}
      {attendanceData && (
        <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {classes.find(c => c.id === selectedClass)?.name} - 
                  Section {availableSections.find(s => s.id === selectedSection)?.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Attendance from {formatDate(startDate)} to {formatDate(endDate)} • {students.length} students
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAttendanceTaker(!showAttendanceTaker)}
                  disabled={!attendanceData}
                >
                  {showAttendanceTaker ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showAttendanceTaker ? 'Hide' : 'Show'} Attendance Taker
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!attendanceData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToExcel}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background border-r min-w-[200px]">
                        Student
                      </TableHead>
                      {attendanceData.dateRange.map(date => (
                        <TableHead key={date} className="text-center min-w-[80px] text-xs">
                          {formatDate(date)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[80px]">Present</TableHead>
                      <TableHead className="text-center min-w-[80px]">Absent</TableHead>
                      <TableHead className="text-center min-w-[80px]">Leave</TableHead>
                      <TableHead className="text-center min-w-[80px]">%</TableHead>
                    </TableRow>
                    {showAttendanceTaker && (
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background border-r text-xs">
                          Attendance Taker
                        </TableHead>
                        {attendanceData.dateRange.map(date => (
                          <TableHead key={date} className="text-center text-xs px-1">
                            {getAttendanceTaker(date)}
                          </TableHead>
                        ))}
                        <TableHead colSpan={4}></TableHead>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    {attendanceData.students.map(student => {
                      const stats = calculateStudentStats(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="sticky left-0 bg-background border-r">
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                            </div>
                          </TableCell>
                          {attendanceData.dateRange.map(date => {
                            const status = getAttendanceStatus(student.id, date);
                            return (
                              <TableCell 
                                key={`${student.id}-${date}`} 
                                className={`text-center p-1 border ${getStatusColor(status)}`}
                              >
                                {getStatusIcon(status, 'h-5 w-5')}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-medium text-green-600">
                            {stats.present}
                          </TableCell>
                          <TableCell className="text-center font-medium text-red-600">
                            {stats.absent}
                          </TableCell>
                          <TableCell className="text-center font-medium text-yellow-600">
                            {stats.leave}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={stats.percentage >= 90 ? 'text-green-600' : stats.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                              {stats.percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Date-wise Percentage Row */}
                    <TableRow className="bg-gray-50 border-t-2">
                      <TableCell className="sticky left-0 bg-gray-50 border-r font-medium text-sm">
                        Daily Attendance %
                      </TableCell>
                      {attendanceData.dateRange.map(date => {
                        const percentage = getDateAttendancePercentage(date);
                        return (
                          <TableCell 
                            key={`percentage-${date}`} 
                            className="text-center p-2 border font-medium text-sm"
                          >
                            <span className={percentage >= 90 ? 'text-green-600' : percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                              {percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        Average: {(attendanceData.dateRange.reduce((acc, date) => acc + getDateAttendancePercentage(date), 0) / attendanceData.dateRange.length).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Leave</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Selection State */}
      {(!selectedClass || !selectedSection) && !isLoadingClasses && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Class and Section</h3>
            <p className="text-muted-foreground">
              Please select a class and section to view the attendance matrix
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(isLoadingClasses || isLoadingStudents || isLoadingAttendance) && selectedClass && selectedSection && (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Loading Attendance Data</h3>
            <p className="text-muted-foreground">
              {isLoadingStudents ? 'Fetching student list...' : 
               isLoadingAttendance ? 'Loading attendance records...' : 
               'Preparing data...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {selectedClass && selectedSection && !isLoadingStudents && !isLoadingAttendance && students.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              No students found for the selected class and section
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewClassAttendance;
