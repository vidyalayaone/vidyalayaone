// Substitute Teacher Timetable Management Page

import React, { useState, useMemo } from 'react';
import { 
  Calendar,
  Edit,
  Save,
  X,
  Clock,
  User,
  BookOpen,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  ArrowLeftRight
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Types
interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  employeeId: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
}

interface ClassAssignment {
  classId: string;
  className: string;
  section: string;
  subject?: string;
}

interface TimetableEntry {
  teacherId: string;
  periodId: string;
  assignment: ClassAssignment | null;
  isEditable: boolean;
}

interface DayTimetable {
  [key: string]: TimetableEntry; // key format: "teacherId-periodId"
}

// Mock data
const mockPeriods: Period[] = [
  { id: '1', name: 'Period 1', startTime: '08:00', endTime: '08:45' },
  { id: '2', name: 'Period 2', startTime: '08:50', endTime: '09:35' },
  { id: '3', name: 'Period 3', startTime: '09:40', endTime: '10:25' },
  { id: '4', name: 'Break', startTime: '10:25', endTime: '10:45' },
  { id: '5', name: 'Period 4', startTime: '10:45', endTime: '11:30' },
  { id: '6', name: 'Period 5', startTime: '11:35', endTime: '12:20' },
  { id: '7', name: 'Period 6', startTime: '12:25', endTime: '13:10' },
  { id: '8', name: 'Lunch', startTime: '13:10', endTime: '14:00' },
  { id: '9', name: 'Period 7', startTime: '14:00', endTime: '14:45' },
  { id: '10', name: 'Period 8', startTime: '14:50', endTime: '15:35' },
];

const mockTeachers: Teacher[] = [
  { id: '1', name: 'Mrs. Sarah Johnson', subject: 'Mathematics', employeeId: 'EMP001', status: 'PRESENT' },
  { id: '2', name: 'Mr. David Smith', subject: 'English', employeeId: 'EMP002', status: 'ABSENT' },
  { id: '3', name: 'Ms. Emily Davis', subject: 'Science', employeeId: 'EMP003', status: 'ON_LEAVE' },
  { id: '4', name: 'Mr. Michael Brown', subject: 'History', employeeId: 'EMP004', status: 'PRESENT' },
  { id: '5', name: 'Mrs. Lisa Anderson', subject: 'Physical Education', employeeId: 'EMP005', status: 'PRESENT' },
  { id: '6', name: 'Dr. Robert Wilson', subject: 'Chemistry', employeeId: 'EMP006', status: 'ABSENT' },
  { id: '7', name: 'Ms. Jennifer Lee', subject: 'Biology', employeeId: 'EMP007', status: 'ON_LEAVE' },
  { id: '8', name: 'Mr. Thomas Garcia', subject: 'Physics', employeeId: 'EMP008', status: 'PRESENT' },
];

const mockClasses = [
  { classId: '9A', className: 'Grade 9', section: 'A' },
  { classId: '9B', className: 'Grade 9', section: 'B' },
  { classId: '10A', className: 'Grade 10', section: 'A' },
  { classId: '10B', className: 'Grade 10', section: 'B' },
  { classId: '11A', className: 'Grade 11', section: 'A' },
  { classId: '12A', className: 'Grade 12', section: 'A' },
];

// Generate mock timetable data
const generateMockTimetable = (): DayTimetable => {
  const timetable: DayTimetable = {};
  
  mockTeachers.forEach(teacher => {
    mockPeriods.forEach(period => {
      const key = `${teacher.id}-${period.id}`;
      
      // Skip break and lunch periods
      if (period.name === 'Break' || period.name === 'Lunch') {
        timetable[key] = {
          teacherId: teacher.id,
          periodId: period.id,
          assignment: null,
          isEditable: false
        };
        return;
      }
      
      // Randomly assign classes (some periods will be free)
      const shouldAssign = Math.random() > 0.3; // 70% chance of assignment
      let assignment: ClassAssignment | null = null;
      
      if (shouldAssign) {
        const randomClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
        assignment = {
          ...randomClass,
          subject: teacher.subject
        };
      }
      
      timetable[key] = {
        teacherId: teacher.id,
        periodId: period.id,
        assignment,
        isEditable: true
      };
    });
  });
  
  return timetable;
};

const SubstituteTeacherPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timetable, setTimetable] = useState<DayTimetable>(generateMockTimetable());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<ClassAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'PRESENT' | 'ABSENT' | 'ON_LEAVE'>('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
  const [substituteAssignment, setSubstituteAssignment] = useState<{
    originalTeacherId: string;
    periodId: string;
    assignment: ClassAssignment;
  } | null>(null);
  
  const { toast } = useToast();

  // Filter teachers based on search and subject
  const filteredTeachers = useMemo(() => {
    return mockTeachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || teacher.subject === selectedSubject;
      const matchesStatus = selectedStatus === 'all' || teacher.status === selectedStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [searchTerm, selectedSubject, selectedStatus]);

  // Get unique subjects
  const subjects = useMemo(() => {
    const uniqueSubjects = [...new Set(mockTeachers.map(t => t.subject))];
    return uniqueSubjects.sort();
  }, []);

  // Get day of week for selected date
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get row styling based on teacher status
  const getTeacherRowClasses = (status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE') => {
    switch (status) {
      case 'ABSENT':
        return 'bg-red-50 hover:bg-red-100';
      case 'ON_LEAVE':
        return 'bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  // Get cell background color based on teacher status
  const getCellBackgroundColor = (status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE', period: Period, hasAssignment: boolean) => {
    const baseClasses = 'text-center border-r p-0';
    
    if (status === 'ABSENT') {
      return `${baseClasses} bg-red-50`;
    } else if (status === 'ON_LEAVE') {
      return `${baseClasses} bg-yellow-50`;
    } else {
      // For present teachers, use the original logic
      if (hasAssignment) {
        return `${baseClasses} bg-blue-50`;
      } else if (period.name === 'Break' || period.name === 'Lunch') {
        return `${baseClasses} bg-gray-50`;
      } else {
        return `${baseClasses} bg-white hover:bg-gray-50`;
      }
    }
  };

  // Handle cell edit
  const handleCellEdit = (teacherId: string, periodId: string) => {
    const key = `${teacherId}-${periodId}`;
    const entry = timetable[key];
    
    if (!entry.isEditable) return;
    
    setEditingCell(key);
    setEditingAssignment(entry.assignment);
    setShowAssignDialog(true);
  };

  // Handle substitute assignment
  const handleAssignSubstitute = (teacherId: string, periodId: string, assignment: ClassAssignment) => {
    setSubstituteAssignment({
      originalTeacherId: teacherId,
      periodId,
      assignment
    });
    setShowSubstituteDialog(true);
  };

  // Get available teachers for a specific period (teachers who are present and free)
  const getAvailableTeachers = (periodId: string, excludeTeacherId: string) => {
    return mockTeachers.filter(teacher => {
      // Exclude the original teacher and only include present teachers
      if (teacher.id === excludeTeacherId || teacher.status !== 'PRESENT') {
        return false;
      }
      
      // Check if teacher is free during this period
      const key = `${teacher.id}-${periodId}`;
      const entry = timetable[key];
      return !entry?.assignment; // Teacher is free if no assignment
    });
  };

  // Save cell changes
  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    setTimetable(prev => ({
      ...prev,
      [editingCell]: {
        ...prev[editingCell],
        assignment: editingAssignment
      }
    }));
    
    setEditingCell(null);
    setEditingAssignment(null);
    setShowAssignDialog(false);
    
    toast({
      title: 'Assignment Updated',
      description: 'Timetable has been updated successfully.',
    });
  };

  // Assign substitute teacher
  const handleSubstituteAssign = (substituteTeacherId: string) => {
    if (!substituteAssignment) return;
    
    const { originalTeacherId, periodId, assignment } = substituteAssignment;
    const originalKey = `${originalTeacherId}-${periodId}`;
    const substituteKey = `${substituteTeacherId}-${periodId}`;
    
    // Remove assignment from original teacher and assign to substitute
    setTimetable(prev => ({
      ...prev,
      [originalKey]: {
        ...prev[originalKey],
        assignment: null
      },
      [substituteKey]: {
        ...prev[substituteKey],
        assignment: assignment
      }
    }));
    
    setSubstituteAssignment(null);
    setShowSubstituteDialog(false);
    
    const substituteTeacher = mockTeachers.find(t => t.id === substituteTeacherId);
    const originalTeacher = mockTeachers.find(t => t.id === originalTeacherId);
    
    toast({
      title: 'Substitute Assigned',
      description: `${substituteTeacher?.name} has been assigned to cover ${originalTeacher?.name}'s class: ${assignment.className}-${assignment.section}`,
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingAssignment(null);
    setShowAssignDialog(false);
  };

  // Clear assignment (remove class assignment from the period)
  const handleClearAssignment = () => {
    if (!editingCell) return;
    
    setTimetable(prev => ({
      ...prev,
      [editingCell]: {
        ...prev[editingCell],
        assignment: null
      }
    }));
    
    setEditingCell(null);
    setEditingAssignment(null);
    setShowAssignDialog(false);
    
    toast({
      title: 'Assignment Cleared',
      description: 'Class assignment has been removed from this period.',
    });
  };

  // Clear assignment by teacher and period ID (used externally if needed)
  const handleClearAssignmentById = (teacherId: string, periodId: string) => {
    const key = `${teacherId}-${periodId}`;
    setTimetable(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        assignment: null
      }
    }));
    
    toast({
      title: 'Assignment Cleared',
      description: 'Class assignment has been removed.',
    });
  };

  // Render table cell content
  const renderCellContent = (entry: TimetableEntry, period: Period) => {
    const key = `${entry.teacherId}-${entry.periodId}`;
    const teacher = mockTeachers.find(t => t.id === entry.teacherId);
    const isAbsentOrOnLeave = teacher?.status === 'ABSENT' || teacher?.status === 'ON_LEAVE';
    
    // Break and lunch periods
    if (period.name === 'Break' || period.name === 'Lunch') {
      return (
        <div className="p-2 text-center">
          <Badge variant="outline" className="text-xs">
            {period.name}
          </Badge>
        </div>
      );
    }
    
    // Free period
    if (!entry.assignment) {
      return (
        <div className="p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleCellEdit(entry.teacherId, entry.periodId)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Free
          </Button>
        </div>
      );
    }
    
    // Assigned period
    return (
      <div className="p-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium truncate">
              {entry.assignment.className}-{entry.assignment.section}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleCellEdit(entry.teacherId, entry.periodId)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {isAbsentOrOnLeave && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-blue-700 hover:text-blue-800"
                  onClick={() => handleAssignSubstitute(entry.teacherId, entry.periodId, entry.assignment)}
                  title="Assign substitute teacher"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          {entry.assignment.subject && (
            <span className="text-xs text-muted-foreground truncate">
              {entry.assignment.subject}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Substitute Teacher Timetable</h1>
            <p className="text-muted-foreground">
              Manage daily timetable and class assignments for substitute teachers
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Date Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>
                  {getDayOfWeek(selectedDate)} - {new Date(selectedDate).toLocaleDateString()}
                </span>
              </CardTitle>
              
              {/* Status Legend */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Teacher Status:</span>
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedStatus === 'all' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStatus('all')}
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-red-50 via-yellow-50 to-white border border-gray-200 rounded"></div>
                  <span>All ({mockTeachers.length})</span>
                </div>
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedStatus === 'ABSENT' ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStatus('ABSENT')}
                >
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                  <span>Absent ({mockTeachers.filter(t => t.status === 'ABSENT').length})</span>
                </div>
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedStatus === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStatus('ON_LEAVE')}
                >
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                  <span>On Leave ({mockTeachers.filter(t => t.status === 'ON_LEAVE').length})</span>
                </div>
                <div 
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedStatus === 'PRESENT' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStatus('PRESENT')}
                >
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                  <span>Present ({mockTeachers.filter(t => t.status === 'PRESENT').length})</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timetable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Daily Timetable 
                {selectedStatus !== 'all' && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    - Showing {selectedStatus === 'ABSENT' ? 'Absent' : selectedStatus === 'ON_LEAVE' ? 'On Leave' : 'Present'} Teachers ({filteredTeachers.length})
                  </span>
                )}
              </CardTitle>
              {selectedStatus !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  Show All Teachers
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Click on cells to assign or edit class assignments. Free periods are shown in gray.
              {selectedStatus !== 'all' && ' Use status filters above to view specific teacher groups.'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48 sticky left-0 bg-background z-10">Teacher</TableHead>
                    {mockPeriods.map(period => (
                      <TableHead key={period.id} className="text-center min-w-32">
                        <div className="space-y-1">
                          <div className="font-medium">{period.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {period.startTime} - {period.endTime}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map(teacher => (
                    <TableRow key={teacher.id} className={getTeacherRowClasses(teacher.status)}>
                      <TableCell className={`sticky left-0 z-10 ${
                        teacher.status === 'ABSENT' ? 'bg-red-50' :
                        teacher.status === 'ON_LEAVE' ? 'bg-yellow-50' :
                        'bg-background'
                      }`}>
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-xs text-muted-foreground">{teacher.employeeId}</div>
                          <Badge variant="secondary" className="text-xs w-fit">
                            {teacher.subject}
                          </Badge>
                        </div>
                      </TableCell>
                      {mockPeriods.map(period => {
                        const key = `${teacher.id}-${period.id}`;
                        const entry = timetable[key];
                        
                        return (
                          <TableCell 
                            key={period.id} 
                            className={getCellBackgroundColor(teacher.status, period, !!entry?.assignment)}
                          >
                            {entry && renderCellContent(entry, period)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Class Assignment</DialogTitle>
              <DialogDescription>
                Assign or modify the class for this time period.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Class Assignment</label>
                <Select 
                  value={editingAssignment?.classId || ''} 
                  onValueChange={(value) => {
                    const selectedClass = mockClasses.find(c => c.classId === value);
                    setEditingAssignment(selectedClass ? {
                      ...selectedClass,
                      subject: editingAssignment?.subject || ''
                    } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class or leave empty for free period" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map(classOption => (
                      <SelectItem key={classOption.classId} value={classOption.classId}>
                        {classOption.className} - Section {classOption.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {editingAssignment && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={editingAssignment.subject || ''}
                    onChange={(e) => setEditingAssignment(prev => prev ? {
                      ...prev,
                      subject: e.target.value
                    } : null)}
                    placeholder="Enter subject name"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex justify-between w-full">
                <div>
                  {editingAssignment && (
                    <Button 
                      variant="outline" 
                      onClick={handleClearAssignment}
                      className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Assignment
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Substitute Teacher Assignment Dialog */}
        <Dialog open={showSubstituteDialog} onOpenChange={setShowSubstituteDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Assign Substitute Teacher</DialogTitle>
              <DialogDescription>
                Select an available teacher to cover this class period.
              </DialogDescription>
            </DialogHeader>
            
            {substituteAssignment && (
              <div className="space-y-4">
                {/* Original Assignment Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Original Assignment</h4>
                    <Badge variant="destructive">
                      {mockTeachers.find(t => t.id === substituteAssignment.originalTeacherId)?.status === 'ABSENT' ? 'Absent' : 'On Leave'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Teacher:</strong> {mockTeachers.find(t => t.id === substituteAssignment.originalTeacherId)?.name}</p>
                    <p><strong>Class:</strong> {substituteAssignment.assignment.className} - Section {substituteAssignment.assignment.section}</p>
                    <p><strong>Subject:</strong> {substituteAssignment.assignment.subject}</p>
                    <p><strong>Period:</strong> {mockPeriods.find(p => p.id === substituteAssignment.periodId)?.name} 
                      ({mockPeriods.find(p => p.id === substituteAssignment.periodId)?.startTime} - {mockPeriods.find(p => p.id === substituteAssignment.periodId)?.endTime})</p>
                  </div>
                </div>

                {/* Available Teachers */}
                <div>
                  <h4 className="font-medium mb-3">Available Teachers ({getAvailableTeachers(substituteAssignment.periodId, substituteAssignment.originalTeacherId).length})</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {getAvailableTeachers(substituteAssignment.periodId, substituteAssignment.originalTeacherId).map(teacher => (
                      <div 
                        key={teacher.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSubstituteAssign(teacher.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-muted-foreground">{teacher.employeeId} • {teacher.subject}</p>
                          </div>
                        </div>
                        <Button size="sm">
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      </div>
                    ))}
                    
                    {getAvailableTeachers(substituteAssignment.periodId, substituteAssignment.originalTeacherId).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No teachers are available for this period</p>
                        <p className="text-sm">All other teachers are either absent, on leave, or have assignments</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubstituteDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SubstituteTeacherPage;
