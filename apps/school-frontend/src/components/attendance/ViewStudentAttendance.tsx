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
  AlertTriangle
} from 'lucide-react';

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
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  timeOut?: string;
  reason?: string;
  markedBy: string;
}

interface StudentAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
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
    { id: '3', date: '2025-08-17', status: 'LATE', timeIn: '08:45', timeOut: '15:30', reason: 'Traffic', markedBy: 'Mrs. Johnson' },
    { id: '4', date: '2025-08-16', status: 'ABSENT', reason: 'Sick', markedBy: 'Mrs. Johnson' },
    { id: '5', date: '2025-08-15', status: 'PRESENT', timeIn: '08:12', timeOut: '15:30', markedBy: 'Mrs. Johnson' },
    { id: '6', date: '2025-08-14', status: 'EXCUSED', reason: 'Medical appointment', markedBy: 'Mrs. Johnson' },
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

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Calculate attendance statistics for selected student
  const calculateStats = (studentId: string): StudentAttendanceStats => {
    const records = mockAttendanceRecords[studentId] || [];
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'PRESENT').length;
    const absentDays = records.filter(r => r.status === 'ABSENT').length;
    const lateDays = records.filter(r => r.status === 'LATE').length;
    const excusedDays = records.filter(r => r.status === 'EXCUSED').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive">Absent</Badge>;
      case 'LATE':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Late</Badge>;
      case 'EXCUSED':
        return <Badge variant="outline" className="border-blue-300 text-blue-800">Excused</Badge>;
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
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'EXCUSED':
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <p className="text-xs text-muted-foreground">
                Times late
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excused Days</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.excusedDays}</div>
              <p className="text-xs text-muted-foreground">
                Excused absences
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest attendance records (most recent first)
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </TableCell>
                    <TableCell>{record.timeIn || '-'}</TableCell>
                    <TableCell>{record.timeOut || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.reason || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.markedBy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name, roll number, class, or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={student.profileImage} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{student.name}</p>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.className}-{student.section}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
