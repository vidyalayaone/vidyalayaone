// Attendance management page for admin users

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for attendance data
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  timeOut?: string;
  reason?: string;
  markedBy: string;
}

interface ClassAttendance {
  className: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number;
}

// Mock data for attendance
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'John Doe',
    className: 'Grade 9-A',
    date: '2024-01-15',
    status: 'PRESENT',
    timeIn: '08:15',
    timeOut: '15:30',
    markedBy: 'Mrs. Johnson'
  },
  {
    id: '2',
    studentId: 'STU002',
    studentName: 'Jane Smith',
    className: 'Grade 9-A',
    date: '2024-01-15',
    status: 'ABSENT',
    reason: 'Sick',
    markedBy: 'Mrs. Johnson'
  },
  {
    id: '3',
    studentId: 'STU003',
    studentName: 'Mike Wilson',
    className: 'Grade 10-B',
    date: '2024-01-15',
    status: 'LATE',
    timeIn: '08:45',
    timeOut: '15:30',
    reason: 'Traffic',
    markedBy: 'Mr. Smith'
  },
  {
    id: '4',
    studentId: 'STU004',
    studentName: 'Sarah Brown',
    className: 'Grade 11-A',
    date: '2024-01-15',
    status: 'EXCUSED',
    reason: 'Medical appointment',
    markedBy: 'Ms. Davis'
  }
];

const mockClassAttendance: ClassAttendance[] = [
  {
    className: 'Grade 9-A',
    totalStudents: 30,
    presentCount: 28,
    absentCount: 1,
    lateCount: 1,
    attendancePercentage: 93.3
  },
  {
    className: 'Grade 9-B',
    totalStudents: 28,
    presentCount: 27,
    absentCount: 1,
    lateCount: 0,
    attendancePercentage: 96.4
  },
  {
    className: 'Grade 10-A',
    totalStudents: 32,
    presentCount: 30,
    absentCount: 2,
    lateCount: 0,
    attendancePercentage: 93.8
  },
  {
    className: 'Grade 10-B',
    totalStudents: 29,
    presentCount: 26,
    absentCount: 2,
    lateCount: 1,
    attendancePercentage: 89.7
  }
];

const AttendancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return mockAttendanceRecords.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesClass = classFilter === 'all' || record.className === classFilter;
      const matchesDate = record.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesClass && matchesDate;
    });
  }, [searchTerm, statusFilter, classFilter, dateFilter]);

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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate overall stats
  const totalRecords = mockAttendanceRecords.length;
  const presentCount = mockAttendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = mockAttendanceRecords.filter(r => r.status === 'ABSENT').length;
  const lateCount = mockAttendanceRecords.filter(r => r.status === 'LATE').length;
  const overallAttendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  const uniqueClasses = Array.from(new Set(mockAttendanceRecords.map(r => r.className)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Track and manage student attendance across all classes
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm">
              <UserCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="daily">Daily Records</TabsTrigger>
            <TabsTrigger value="classes">Class Summary</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallAttendanceRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Today's attendance rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Students present today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Students absent today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Students arrived late
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Daily Records Tab */}
          <TabsContent value="daily" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-40"
                    />

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PRESENT">Present</SelectItem>
                        <SelectItem value="ABSENT">Absent</SelectItem>
                        <SelectItem value="LATE">Late</SelectItem>
                        <SelectItem value="EXCUSED">Excused</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {uniqueClasses.map(className => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Attendance Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records ({filteredRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time In/Out</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Marked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(record.status)}
                            <div>
                              <div className="font-medium">{record.studentName}</div>
                              <div className="text-sm text-muted-foreground">{record.studentId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.className}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {record.timeIn && (
                            <div className="text-sm">
                              <div>In: {record.timeIn}</div>
                              {record.timeOut && <div>Out: {record.timeOut}</div>}
                            </div>
                          )}
                        </TableCell>
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
          </TabsContent>

          {/* Classes Summary Tab */}
          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Attendance Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Attendance overview for all classes today
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Students</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockClassAttendance.map((classData) => (
                      <TableRow key={classData.className}>
                        <TableCell className="font-medium">{classData.className}</TableCell>
                        <TableCell>{classData.totalStudents}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {classData.presentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            {classData.absentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            {classData.lateCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${getAttendanceColor(classData.attendancePercentage)}`}>
                            {classData.attendancePercentage.toFixed(1)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
