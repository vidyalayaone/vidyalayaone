// Mark student attendance page for taking attendance for a specific class section

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Save,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye
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
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { api } from '@/api/api';
import { useAuthStore } from '@/store/authStore';

// Types
type AttendanceStatus = 'present' | 'absent' | 'late';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  profilePhoto?: string;
  firstName: string;
  lastName: string;
  currentClass: {
    id: string;
    grade: string;
    section: string;
    className: string;
    academicYear: string;
  };
}

interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

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

// StudentAttendanceRow Component
interface StudentAttendanceRowProps {
  student: Student;
  attendance: AttendanceStatus | undefined;
  onAttendanceChange: (studentId: string, status: AttendanceStatus) => void;
  isViewMode: boolean;
}

const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  student,
  attendance,
  onAttendanceChange,
  isViewMode,
}) => {
  const getStatusIcon = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Not Marked</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
            </span>
          </div>
          <span>{student.name || `${student.firstName} ${student.lastName}`}</span>
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
        {isViewMode ? (
          <div className="flex items-center space-x-2">
            {getStatusIcon(attendance)}
            {getStatusBadge(attendance)}
          </div>
        ) : (
          <RadioGroup
            value={attendance || ''}
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
        )}
      </TableCell>
    </TableRow>
  );
};

// Main Component
const MarkStudentAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { school } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAcademicYear] = useState<string>('2025-26');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Attendance checking state
  const [attendanceExists, setAttendanceExists] = useState<boolean>(false);
  const [checkingAttendance, setCheckingAttendance] = useState<boolean>(false);
  const [existingAttendanceRecords, setExistingAttendanceRecords] = useState<any[]>([]);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  // Classes and sections data
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isFetchingClasses, setIsFetchingClasses] = useState<boolean>(false);
  const [fetchClassesError, setFetchClassesError] = useState<string | null>(null);

  // Teacher ID for attendance taker
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [fetchingTeacherId, setFetchingTeacherId] = useState<boolean>(false);

  // Transform backend class data to match our interface
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

  // Check if attendance exists for the selected date
  const checkAttendanceForDate = async (classId: string, sectionId: string, date: string) => {
    if (!classId || !sectionId || !date) return;

    setCheckingAttendance(true);
    try {
      const response = await api.checkAttendanceExists(classId, sectionId, date);
      
      if (response.success && response.data) {
        setAttendanceExists(response.data.attendanceExists);
        
        if (response.data.attendanceExists) {
          // Load existing attendance records
          await loadExistingAttendance(classId, sectionId, date);
        } else {
          setExistingAttendanceRecords([]);
          setIsViewMode(false);
        }
      } else {
        setAttendanceExists(false);
        setExistingAttendanceRecords([]);
        setIsViewMode(false);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      setAttendanceExists(false);
      setExistingAttendanceRecords([]);
      setIsViewMode(false);
    } finally {
      setCheckingAttendance(false);
    }
  };

  // Load existing attendance records
  const loadExistingAttendance = async (classId: string, sectionId: string, date: string) => {
    try {
      const response = await api.getClassAttendance(classId, sectionId, date);
      
      if (response.success && response.data) {
        setExistingAttendanceRecords(response.data.attendanceRecords);
        setIsViewMode(true);
        
        // Convert existing records to frontend format and populate attendance state
        const existingAttendanceMap: Record<string, AttendanceStatus> = {};
        response.data.attendanceRecords.forEach((record: any) => {
          let status: AttendanceStatus = 'present';
          switch (record.status) {
            case 'PRESENT':
              status = 'present';
              break;
            case 'ABSENT':
              status = 'absent';
              break;
            case 'LEAVE':
              status = 'late';
              break;
          }
          existingAttendanceMap[record.studentId] = status;
        });
        setAttendance(existingAttendanceMap);
      }
    } catch (error) {
      console.error('Error loading existing attendance:', error);
      toast.error('Failed to load existing attendance records');
    }
  };

  // Fetch teacher ID for the logged-in user
  useEffect(() => {
    const fetchTeacherId = async () => {
      setFetchingTeacherId(true);
      try {
        const response = await api.getMyTeacherId();
        if (response.success && response.data) {
          setTeacherId(response.data.teacherId);
        } else {
          toast.error('Failed to get teacher information. You may not have permission to mark attendance.');
        }
      } catch (err) {
        console.error('Error fetching teacher ID:', err);
        toast.error('Failed to get teacher information');
      } finally {
        setFetchingTeacherId(false);
      }
    };

    fetchTeacherId();
  }, []);

  // Fetch classes and sections
  useEffect(() => {
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

  // Get available classes
  const availableClasses = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes;
    }
    return [];
  }, [classes]);

  // Get sections for selected class
  const availableSections = useMemo(() => {
    if (classes && classes.length > 0 && selectedClass) {
      const cls = classes.find(c => c.id === selectedClass);
      if (cls) return cls.sections;
      return [];
    }
    return [];
  }, [classes, selectedClass]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection('');
    setAttendanceExists(false);
    setExistingAttendanceRecords([]);
    setIsViewMode(false);
  }, [selectedClass]);

  // Check attendance when class, section, or date changes
  useEffect(() => {
    if (selectedClass && selectedSection && selectedDate) {
      checkAttendanceForDate(selectedClass, selectedSection, selectedDate);
    } else {
      setAttendanceExists(false);
      setExistingAttendanceRecords([]);
      setIsViewMode(false);
    }
  }, [selectedClass, selectedSection, selectedDate]);

  // Load students when class and section are selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !selectedSection || !school?.id) {
        setStudents([]);
        setAttendance({});
        return;
      }

      setLoading(true);

      try {
        const response = await api.getStudentsBySchool({ 
          academicYear: selectedAcademicYear,
          classId: selectedClass,
          sectionId: selectedSection
        });

        if (response.success && response.data) {
          const payload = response.data as any;
          const users = Array.isArray(payload.students) ? payload.students : (payload.data || []);

          const mappedStudents: Student[] = (users || []).map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            rollNumber: u.rollNumber || u.rollNo || '',
            profilePhoto: u.profilePhoto || '/placeholder.svg',
            currentClass: {
              id: u.classId || '',
              grade: u.currentClass || 'N/A',
              section: u.currentSection || 'N/A',
              className: u.currentClass || 'N/A',
              academicYear: u.academicYear || selectedAcademicYear
            }
          }));

          setStudents(mappedStudents);

          // Only initialize attendance if not in view mode
          if (!isViewMode) {
            // Don't set default attendance, let users explicitly mark each student
            const initialAttendance: Record<string, AttendanceStatus> = {};
            setAttendance(initialAttendance);
          }
        } else {
          toast.error(response.message || 'Failed to fetch students');
          setStudents([]);
          setAttendance({});
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        toast.error('Failed to load students');
        setStudents([]);
        setAttendance({});
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSection, school?.id, selectedAcademicYear, isViewMode]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    // Only allow changes if not in view mode (attendance not already marked)
    if (!isViewMode) {
      setAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection || students.length === 0) {
      toast.error('Please select class and section first');
      return;
    }

    if (!teacherId) {
      toast.error('Unable to identify teacher. Please refresh the page and try again.');
      return;
    }

    if (attendanceExists) {
      toast.error('Attendance has already been marked for this date');
      return;
    }

    // Check if all students have attendance marked
    const unmarkedStudents = students.filter(student => !attendance[student.id]);
    if (unmarkedStudents.length > 0) {
      toast.error(`Please mark attendance for all students. ${unmarkedStudents.length} students are unmarked.`);
      return;
    }

    setSaving(true);
    
    try {
      // Convert attendance status to backend format
      const convertStatus = (status: AttendanceStatus): 'PRESENT' | 'ABSENT' | 'LEAVE' => {
        switch (status) {
          case 'present':
            return 'PRESENT';
          case 'absent':
            return 'ABSENT';
          case 'late':
            return 'LEAVE'; // Using LEAVE for late status as per backend schema
          default:
            return 'PRESENT';
        }
      };

      // Prepare attendance records
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        status: convertStatus(attendance[student.id] || 'present'),
        notes: attendance[student.id] === 'late' ? 'Student arrived late' : undefined
      }));

      const requestData = {
        classId: selectedClass,
        sectionId: selectedSection,
        attendanceDate: selectedDate,
        attendanceTakerId: teacherId,
        attendanceRecords
      };

      const response = await api.markAttendance(requestData);

      if (response.success) {
        const selectedClassObj = availableClasses.find(c => c.id === selectedClass);
        const selectedSectionObj = availableSections.find(s => s.id === selectedSection);
        
        toast.success(`Attendance marked successfully for ${selectedClassObj?.displayName} ${selectedSectionObj?.name} on ${selectedDate}`);
        
        // Refresh the attendance check to show the newly marked attendance
        await checkAttendanceForDate(selectedClass, selectedSection, selectedDate);
      } else {
        toast.error(response.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      if (error?.response?.status === 409) {
        toast.error('Attendance has already been marked for this class today');
      } else {
        toast.error('Failed to mark attendance. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    const unmarked = total - (present + absent + late);
    
    return { total, present, absent, late, unmarked };
  };

  const stats = getAttendanceStats();
  const selectedClassObj = availableClasses.find(c => c.id === selectedClass);
  const selectedSectionObj = availableSections.find(s => s.id === selectedSection);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                {/* <Calendar className="w-8 h-8 text-primary" /> */}
                {isViewMode ? 'View Student Attendance' : 'Mark Student Attendance'}
              </h1>
              {fetchingTeacherId && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Verifying teacher permissions...</span>
                </div>
              )}
              {!fetchingTeacherId && !teacherId && (
                <div className="flex items-center space-x-2 mt-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Unable to verify teacher permissions</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Class, Section, and Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Class, Section & Date
              {checkingAttendance && (
                <div className="flex items-center space-x-2 ml-4">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Checking attendance...</span>
                </div>
              )}
              {attendanceExists && !checkingAttendance && (
                <Badge variant="secondary" className="ml-4 bg-blue-100 text-blue-800">
                  <Eye className="w-4 h-4 mr-1" />
                  Already Marked
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-select">Attendance Date</Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Can't select future dates
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isFetchingClasses}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder={isFetchingClasses ? "Loading classes..." : "Select a class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fetchClassesError && (
                  <p className="text-sm text-red-600">{fetchClassesError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-select">Section</Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={setSelectedSection}
                  disabled={!selectedClass || availableSections.length === 0}
                >
                  <SelectTrigger id="section-select">
                    <SelectValue placeholder={!selectedClass ? "Select a class first" : "Select a section"} />
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

            {!isViewMode && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unmarked</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.unmarked}</p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Students Attendance Table */}
        {selectedClass && selectedSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Attendance for {selectedClassObj?.displayName} {selectedSectionObj?.name}
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
                        <TableHead>{isViewMode ? 'Attendance Status' : 'Mark Attendance'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <StudentAttendanceRow
                          key={student.id}
                          student={student}
                          attendance={attendance[student.id]}
                          onAttendanceChange={handleAttendanceChange}
                          isViewMode={isViewMode}
                        />
                      ))}
                    </TableBody>
                  </Table>

                  {/* Save Button or View Message */}
                  <div className="flex justify-end pt-4">
                    {isViewMode ? (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>Attendance has already been marked for this date</span>
                      </div>
                    ) : (
                      <Button
                        onClick={handleSaveAttendance}
                        disabled={saving || !teacherId || fetchingTeacherId || stats.unmarked > 0}
                        className="flex items-center space-x-2"
                        size="lg"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : fetchingTeacherId ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </>
                        ) : !teacherId ? (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Teacher ID Required</span>
                          </>
                        ) : stats.unmarked > 0 ? (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Mark All Students ({stats.unmarked} remaining)</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Mark Attendance</span>
                          </>
                        )}
                      </Button>
                    )}
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
                  Select a date, class and section above to start taking attendance or view existing attendance records
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default MarkStudentAttendancePage;
