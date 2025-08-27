// Daily attendance page for taking attendance for a specific class section

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Users,
  Save,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

// Types
type AttendanceStatus = 'present' | 'absent' | 'late';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  profilePhoto?: string;
}

interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

interface Class {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  classId: string;
}

// Mock data
const mockClasses: Class[] = [
  { id: '1', name: 'Class 1' },
  { id: '2', name: 'Class 2' },
  { id: '3', name: 'Class 3' },
  { id: '4', name: 'Class 4' },
  { id: '5', name: 'Class 5' },
  { id: '6', name: 'Class 6' },
  { id: '7', name: 'Class 7' },
  { id: '8', name: 'Class 8' },
  { id: '9', name: 'Class 9' },
  { id: '10', name: 'Class 10' },
];

const mockSections: Section[] = [
  { id: '1', name: 'Section A', classId: '1' },
  { id: '2', name: 'Section B', classId: '1' },
  { id: '3', name: 'Section A', classId: '2' },
  { id: '4', name: 'Section B', classId: '2' },
  { id: '5', name: 'Section C', classId: '2' },
  { id: '6', name: 'Section A', classId: '3' },
  { id: '7', name: 'Section B', classId: '3' },
  { id: '8', name: 'Section A', classId: '4' },
  { id: '9', name: 'Section B', classId: '4' },
  { id: '10', name: 'Section A', classId: '5' },
];

const mockStudents: Record<string, Student[]> = {
  '1': [ // Class 1, Section A
    { id: '1', name: 'Aarav Sharma', rollNumber: '001' },
    { id: '2', name: 'Diya Patel', rollNumber: '002' },
    { id: '3', name: 'Arjun Singh', rollNumber: '003' },
    { id: '4', name: 'Ananya Gupta', rollNumber: '004' },
    { id: '5', name: 'Vihaan Kumar', rollNumber: '005' },
    { id: '6', name: 'Ishita Verma', rollNumber: '006' },
    { id: '7', name: 'Reyansh Jain', rollNumber: '007' },
    { id: '8', name: 'Saanvi Agarwal', rollNumber: '008' },
  ],
  '2': [ // Class 1, Section B
    { id: '9', name: 'Kabir Mehta', rollNumber: '009' },
    { id: '10', name: 'Myra Shah', rollNumber: '010' },
    { id: '11', name: 'Rudra Pandey', rollNumber: '011' },
    { id: '12', name: 'Kiara Reddy', rollNumber: '012' },
    { id: '13', name: 'Aarush Mishra', rollNumber: '013' },
    { id: '14', name: 'Aadhya Chopra', rollNumber: '014' },
  ],
  '3': [ // Class 2, Section A
    { id: '15', name: 'Atharv Rao', rollNumber: '015' },
    { id: '16', name: 'Navya Sinha', rollNumber: '016' },
    { id: '17', name: 'Shaurya Bansal', rollNumber: '017' },
    { id: '18', name: 'Prisha Malhotra', rollNumber: '018' },
    { id: '19', name: 'Vivaan Saxena', rollNumber: '019' },
    { id: '20', name: 'Anika Bhatt', rollNumber: '020' },
  ],
};

// StudentAttendanceRow Component
interface StudentAttendanceRowProps {
  student: Student;
  attendance: AttendanceStatus;
  onAttendanceChange: (studentId: string, status: AttendanceStatus) => void;
}

const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  student,
  attendance,
  onAttendanceChange,
}) => {
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span>{student.name}</span>
        </div>
      </TableCell>
      <TableCell>{student.rollNumber}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getStatusIcon(attendance)}
          {getStatusBadge(attendance)}
        </div>
      </TableCell>
      <TableCell>
        <RadioGroup
          value={attendance}
          onValueChange={(value) => onAttendanceChange(student.id, value as AttendanceStatus)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="present" id={`${student.id}-present`} />
            <Label htmlFor={`${student.id}-present`} className="text-sm">Present</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absent" id={`${student.id}-absent`} />
            <Label htmlFor={`${student.id}-absent`} className="text-sm">Absent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="late" id={`${student.id}-late`} />
            <Label htmlFor={`${student.id}-late`} className="text-sm">Late</Label>
          </div>
        </RadioGroup>
      </TableCell>
    </TableRow>
  );
};

// Main Component
const DailyAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get sections for selected class
  const availableSections = selectedClass 
    ? mockSections.filter(section => section.classId === selectedClass)
    : [];

  // Load students when class and section are selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const studentsForSection = mockStudents[selectedSection] || [];
        setStudents(studentsForSection);
        
        // Initialize attendance with 'present' as default
        const initialAttendance: Record<string, AttendanceStatus> = {};
        studentsForSection.forEach(student => {
          initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
        setLoading(false);
      }, 500);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedSection]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection('');
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection || students.length === 0) {
      toast.error('Please select class and section first');
      return;
    }

    setSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedClassName = mockClasses.find(c => c.id === selectedClass)?.name;
      const selectedSectionName = availableSections.find(s => s.id === selectedSection)?.name;
      
      toast.success(`Attendance saved successfully for ${selectedClassName} ${selectedSectionName}`);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    
    return { total, present, absent, late };
  };

  const stats = getAttendanceStats();
  const selectedClassName = mockClasses.find(c => c.id === selectedClass)?.name;
  const selectedSectionName = availableSections.find(s => s.id === selectedSection)?.name;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attendance')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Attendance</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                Daily Attendance
              </h1>
              <p className="text-muted-foreground mt-1">
                Take attendance for {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Class and Section Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Class & Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-select">Section</Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={setSelectedSection}
                  disabled={!selectedClass}
                >
                  <SelectTrigger id="section-select">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students Attendance Table */}
        {selectedClass && selectedSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Attendance for {selectedClassName} {selectedSectionName}
                </span>
                {loading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-muted-foreground">Loading students...</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mark Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <StudentAttendanceRow
                          key={student.id}
                          student={student}
                          attendance={attendance[student.id] || 'present'}
                          onAttendanceChange={handleAttendanceChange}
                        />
                      ))}
                    </TableBody>
                  </Table>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className="flex items-center space-x-2"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Attendance</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students found for this section</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedClass || !selectedSection ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Take Attendance</h3>
                <p className="text-muted-foreground">
                  Select a class and section above to start taking attendance for today
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default DailyAttendancePage;
