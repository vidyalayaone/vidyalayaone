import React, { useState, useMemo } from 'react';
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
  EyeOff
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
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedBy: string;
}

interface ClassAttendanceData {
  students: Student[];
  attendance: AttendanceRecord[];
  dateRange: string[];
}

// Mock data
const mockClasses: ClassOption[] = [
  {
    id: '9',
    name: 'Grade 9',
    sections: [
      { id: '9-A', name: 'A' },
      { id: '9-B', name: 'B' },
    ]
  },
  {
    id: '10',
    name: 'Grade 10',
    sections: [
      { id: '10-A', name: 'A' },
      { id: '10-B', name: 'B' },
    ]
  },
  {
    id: '11',
    name: 'Grade 11',
    sections: [
      { id: '11-default', name: 'Default' },
    ]
  },
];

const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', rollNumber: 'STU001' },
  { id: '2', name: 'Jane Smith', rollNumber: 'STU002' },
  { id: '3', name: 'Mike Wilson', rollNumber: 'STU003' },
  { id: '4', name: 'Sarah Brown', rollNumber: 'STU004' },
  { id: '5', name: 'Alex Johnson', rollNumber: 'STU005' },
];

const generateMockAttendance = (students: Student[], dateRange: string[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: ('PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED')[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  const teachers = ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Brown'];

  students.forEach(student => {
    dateRange.forEach(date => {
      // Randomly generate attendance (80% present, 10% absent, 5% late, 5% excused)
      const rand = Math.random();
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      
      if (rand < 0.8) status = 'PRESENT';
      else if (rand < 0.9) status = 'ABSENT';
      else if (rand < 0.95) status = 'LATE';
      else status = 'EXCUSED';

      records.push({
        studentId: student.id,
        date,
        status,
        markedBy: teachers[Math.floor(Math.random() * teachers.length)]
      });
    });
  });

  return records;
};

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
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2025-08-12');
  const [endDate, setEndDate] = useState<string>('2025-08-19');
  const [showAttendanceTaker, setShowAttendanceTaker] = useState<boolean>(false);

  // Export functions
  const exportToPDF = () => {
    if (!attendanceData) return;

    const className = mockClasses.find(c => c.id === selectedClass)?.name || '';
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
            .late { background-color: #fff3cd; color: #856404; }
            .excused { background-color: #d1ecf1; color: #0c5460; }
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
                <th rowspan="2">Late</th>
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
                      const statusSymbol = status === 'PRESENT' ? '●' : status === 'ABSENT' ? '✖' : status === 'LATE' ? '◐' : '△';
                      return `<td class="${statusClass}">${statusSymbol}</td>`;
                    }).join('')}
                    <td class="present">${stats.present}</td>
                    <td class="absent">${stats.absent}</td>
                    <td class="late">${stats.late}</td>
                    <td><strong>${stats.percentage.toFixed(1)}%</strong></td>
                  </tr>
                `;
              }).join('')}
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
              <div class="legend-box late"></div>
              <span>◐ Late</span>
            </div>
            <div class="legend-item">
              <div class="legend-box excused"></div>
              <span>△ Excused</span>
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

    const className = mockClasses.find(c => c.id === selectedClass)?.name || '';
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
        'Late Days',
        'Excused Days',
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
            return status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : status === 'LATE' ? 'L' : 'E';
          }),
          stats.present,
          stats.absent,
          stats.late,
          stats.excused,
          `${stats.percentage.toFixed(1)}%`
        ];
      }),
      
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
    const classData = mockClasses.find(c => c.id === selectedClass);
    return classData?.sections || [];
  }, [selectedClass]);

  // Generate attendance data for selected class/section
  const attendanceData = useMemo((): ClassAttendanceData | null => {
    if (!selectedClass || !selectedSection) return null;

    const dateRange = generateDateRange(startDate, endDate);
    const attendance = generateMockAttendance(mockStudents, dateRange);

    return {
      students: mockStudents,
      attendance,
      dateRange
    };
  }, [selectedClass, selectedSection, startDate, endDate]);

  // Calculate student statistics
  const calculateStudentStats = (studentId: string) => {
    if (!attendanceData) return { present: 0, absent: 0, late: 0, excused: 0, percentage: 0 };

    const studentRecords = attendanceData.attendance.filter(r => r.studentId === studentId);
    const present = studentRecords.filter(r => r.status === 'PRESENT').length;
    const absent = studentRecords.filter(r => r.status === 'ABSENT').length;
    const late = studentRecords.filter(r => r.status === 'LATE').length;
    const excused = studentRecords.filter(r => r.status === 'EXCUSED').length;
    const total = studentRecords.length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

    return { present, absent, late, excused, percentage };
  };

  // Get attendance status for specific student and date
  const getAttendanceStatus = (studentId: string, date: string) => {
    const record = attendanceData?.attendance.find(r => r.studentId === studentId && r.date === date);
    return record?.status || 'ABSENT';
  };

  // Get attendance taker for specific date
  const getAttendanceTaker = (date: string) => {
    const record = attendanceData?.attendance.find(r => r.date === date);
    return record?.markedBy || '-';
  };

  const getStatusIcon = (status: string, size = 'h-4 w-4') => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className={`${size} text-green-500`} />;
      case 'ABSENT':
        return <XCircle className={`${size} text-red-500`} />;
      case 'LATE':
        return <Clock className={`${size} text-yellow-500`} />;
      case 'EXCUSED':
        return <AlertTriangle className={`${size} text-blue-500`} />;
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
      case 'LATE':
        return 'bg-yellow-100 border-yellow-200';
      case 'EXCUSED':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-red-100 border-red-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map(classOption => (
                    <SelectItem key={classOption.id} value={classOption.id}>
                      {classOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select 
                value={selectedSection} 
                onValueChange={setSelectedSection}
                disabled={!selectedClass || availableSections.length <= 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableSections.length <= 1 && availableSections[0]?.name === 'Default' && (
                <p className="text-xs text-muted-foreground mt-1">Default section (no sections available)</p>
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
        </CardContent>
      </Card>

      {/* Attendance Matrix */}
      {attendanceData && (
        <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {mockClasses.find(c => c.id === selectedClass)?.name} - 
                  {availableSections.find(s => s.id === selectedSection)?.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Attendance from {formatDate(startDate)} to {formatDate(endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAttendanceTaker(!showAttendanceTaker)}
                >
                  {showAttendanceTaker ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showAttendanceTaker ? 'Hide' : 'Show'} Attendance Taker
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
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
                      <TableHead className="text-center min-w-[80px]">Late</TableHead>
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
                            {stats.late}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={stats.percentage >= 90 ? 'text-green-600' : stats.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                              {stats.percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Excused</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Selection State */}
      {(!selectedClass || !selectedSection) && (
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
    </div>
  );
};

export default ViewClassAttendance;
