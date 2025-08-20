// Advanced timetable creation component

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock,
  BookOpen,
  Users,
  Save,
  X,
  Edit3,
  Move
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Types
interface TimeSlotConfig {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType?: 'short' | 'lunch';
}

interface SectionConfig {
  id: string;
  grade: string;
  section: string;
  classTeacher: string;
  studentCount: number;
}

interface SubjectAssignment {
  id: string;
  timeSlotId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
}

interface TimetableConfig {
  name: string;
  academicYear: string;
  timeSlots: TimeSlotConfig[];
  sections: SectionConfig[];
  assignments: SubjectAssignment[];
}

interface TimetableBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TimetableConfig) => void;
  existingConfig?: TimetableConfig;
}

// Mock data
const mockSubjects = [
  { id: '1', name: 'Mathematics', code: 'MATH' },
  { id: '2', name: 'English', code: 'ENG' },
  { id: '3', name: 'Science', code: 'SCI' },
  { id: '4', name: 'Social Studies', code: 'SS' },
  { id: '5', name: 'Physical Education', code: 'PE' },
  { id: '6', name: 'Art', code: 'ART' },
  { id: '7', name: 'Music', code: 'MUS' },
  { id: '8', name: 'Computer Science', code: 'CS' },
];

const mockTeachers = [
  { id: '1', name: 'Mr. Smith', subjects: ['1'] },
  { id: '2', name: 'Ms. Johnson', subjects: ['2'] },
  { id: '3', name: 'Dr. Wilson', subjects: ['3'] },
  { id: '4', name: 'Mr. Brown', subjects: ['4'] },
  { id: '5', name: 'Coach Davis', subjects: ['5'] },
  { id: '6', name: 'Ms. Taylor', subjects: ['6'] },
  { id: '7', name: 'Mr. Anderson', subjects: ['7'] },
  { id: '8', name: 'Ms. Garcia', subjects: ['8'] },
];

const defaultTimeSlots: TimeSlotConfig[] = [
  { id: '1', label: 'Period 1', startTime: '08:00', endTime: '08:45', isBreak: false },
  { id: '2', label: 'Period 2', startTime: '08:45', endTime: '09:30', isBreak: false },
  { id: '3', label: 'Period 3', startTime: '09:30', endTime: '10:15', isBreak: false },
  { id: '4', label: 'Short Break', startTime: '10:15', endTime: '10:30', isBreak: true, breakType: 'short' },
  { id: '5', label: 'Period 4', startTime: '10:30', endTime: '11:15', isBreak: false },
  { id: '6', label: 'Period 5', startTime: '11:15', endTime: '12:00', isBreak: false },
  { id: '7', label: 'Period 6', startTime: '12:00', endTime: '12:45', isBreak: false },
  { id: '8', label: 'Lunch Break', startTime: '12:45', endTime: '13:30', isBreak: true, breakType: 'lunch' },
  { id: '9', label: 'Period 7', startTime: '13:30', endTime: '14:15', isBreak: false },
  { id: '10', label: 'Period 8', startTime: '14:15', endTime: '15:00', isBreak: false },
];

const defaultSections: SectionConfig[] = [
  { id: '1', grade: 'Grade 1', section: 'A', classTeacher: 'Ms. Johnson', studentCount: 30 },
  { id: '2', grade: 'Grade 1', section: 'B', classTeacher: 'Ms. Wilson', studentCount: 28 },
  { id: '3', grade: 'Grade 2', section: 'A', classTeacher: 'Mr. Brown', studentCount: 32 },
  { id: '4', grade: 'Grade 2', section: 'B', classTeacher: 'Ms. Davis', studentCount: 29 },
  { id: '5', grade: 'Grade 3', section: 'A', classTeacher: 'Ms. Miller', studentCount: 31 },
];

const TimetableBuilder: React.FC<TimetableBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingConfig
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TimetableConfig>({
    name: '',
    academicYear: '',
    timeSlots: defaultTimeSlots,
    sections: defaultSections,
    assignments: []
  });

  const [activeStep, setActiveStep] = useState<'basic' | 'schedule' | 'assign'>('basic');
  const [selectedCell, setSelectedCell] = useState<{
    timeSlotId: string;
    sectionId: string;
  } | null>(null);

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    } else {
      setConfig({
        name: '',
        academicYear: '',
        timeSlots: defaultTimeSlots,
        sections: defaultSections,
        assignments: []
      });
    }
  }, [existingConfig, isOpen]);

  const handleSave = () => {
    if (!config.name || !config.academicYear) {
      toast({
        title: "Error",
        description: "Please fill in the basic information.",
        variant: "destructive",
      });
      return;
    }

    onSave(config);
    onClose();
  };

  const handleAssignSubject = (timeSlotId: string, sectionId: string, subjectId: string, teacherId: string) => {
    const newAssignment: SubjectAssignment = {
      id: `${timeSlotId}-${sectionId}`,
      timeSlotId,
      sectionId,
      subjectId,
      teacherId
    };

    setConfig(prev => ({
      ...prev,
      assignments: [
        ...prev.assignments.filter(a => a.id !== newAssignment.id),
        newAssignment
      ]
    }));

    setSelectedCell(null);
  };

  const handleRemoveAssignment = (timeSlotId: string, sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.timeSlotId !== timeSlotId || a.sectionId !== sectionId)
    }));
  };

  const getAssignment = (timeSlotId: string, sectionId: string) => {
    return config.assignments.find(a => a.timeSlotId === timeSlotId && a.sectionId === sectionId);
  };

  const getSubjectName = (subjectId: string) => {
    return mockSubjects.find(s => s.id === subjectId)?.name || '';
  };

  const getTeacherName = (teacherId: string) => {
    return mockTeachers.find(t => t.id === teacherId)?.name || '';
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Timetable Name</Label>
            <Input
              id="name"
              placeholder="e.g., Academic Year 2024-25"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="year">Academic Year</Label>
            <Input
              id="year"
              placeholder="e.g., 2024-25"
              value={config.academicYear}
              onChange={(e) => setConfig(prev => ({ ...prev, academicYear: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{section.grade} - {section.section}</div>
                    <div className="text-sm text-gray-600">{section.classTeacher}</div>
                    <div className="text-sm text-gray-500">{section.studentCount} students</div>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduleSetup = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Time Slots</h3>
        <div className="space-y-2">
          {config.timeSlots.map((slot) => (
            <Card key={slot.id} className={slot.isBreak ? 'bg-yellow-50 border-yellow-200' : ''}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{slot.label}</div>
                      <div className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  </div>
                  
                  {slot.isBreak && (
                    <Badge variant="secondary">
                      {slot.breakType === 'lunch' ? 'Lunch' : 'Break'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubjectAssignment = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Subject Assignment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click on empty cells to assign subjects to time slots.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50 text-left w-32">Time</th>
                {config.sections.map((section) => (
                  <th key={section.id} className="border border-gray-300 p-2 bg-gray-50 text-center min-w-32">
                    <div>
                      <div className="font-semibold">{section.grade}</div>
                      <div className="text-sm">{section.section}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.timeSlots.map((timeSlot) => (
                <tr key={timeSlot.id}>
                  <td className="border border-gray-300 p-2 font-medium">
                    <div>
                      <div className="text-sm font-semibold">{timeSlot.label}</div>
                      <div className="text-xs text-gray-600">
                        {timeSlot.startTime} - {timeSlot.endTime}
                      </div>
                    </div>
                  </td>
                  {config.sections.map((section) => (
                    <td key={section.id} className="border border-gray-300 p-1">
                      {timeSlot.isBreak ? (
                        <div className="text-center py-2 bg-yellow-100 rounded text-sm text-yellow-800">
                          {timeSlot.label}
                        </div>
                      ) : (
                        <TimetableCell
                          timeSlotId={timeSlot.id}
                          sectionId={section.id}
                          assignment={getAssignment(timeSlot.id, section.id)}
                          onAssign={() => setSelectedCell({ timeSlotId: timeSlot.id, sectionId: section.id })}
                          onRemove={() => handleRemoveAssignment(timeSlot.id, section.id)}
                          getSubjectName={getSubjectName}
                          getTeacherName={getTeacherName}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingConfig ? 'Edit Timetable' : 'Create New Timetable'}
          </DialogTitle>
          <DialogDescription>
            Set up your school timetable with time slots, sections, and subject assignments.
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          {[
            { key: 'basic', label: 'Basic Info', icon: Edit3 },
            { key: 'schedule', label: 'Schedule', icon: Clock },
            { key: 'assign', label: 'Subjects', icon: BookOpen }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <Button
                variant={activeStep === step.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStep(step.key as any)}
                className="h-10"
              >
                <step.icon className="mr-2 h-4 w-4" />
                {step.label}
              </Button>
              {index < 2 && <div className="w-8 h-px bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {activeStep === 'basic' && renderBasicInfo()}
          {activeStep === 'schedule' && renderScheduleSetup()}
          {activeStep === 'assign' && renderSubjectAssignment()}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {activeStep !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps = ['basic', 'schedule', 'assign'];
                  const currentIndex = steps.indexOf(activeStep);
                  if (currentIndex > 0) {
                    setActiveStep(steps[currentIndex - 1] as any);
                  }
                }}
              >
                Previous
              </Button>
            )}
            
            {activeStep !== 'assign' ? (
              <Button
                onClick={() => {
                  const steps = ['basic', 'schedule', 'assign'];
                  const currentIndex = steps.indexOf(activeStep);
                  if (currentIndex < steps.length - 1) {
                    setActiveStep(steps[currentIndex + 1] as any);
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Timetable
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Subject Assignment Dialog */}
      {selectedCell && (
        <SubjectAssignmentDialog
          timeSlotId={selectedCell.timeSlotId}
          sectionId={selectedCell.sectionId}
          onClose={() => setSelectedCell(null)}
          onAssign={handleAssignSubject}
        />
      )}
    </Dialog>
  );
};

// Individual timetable cell component
interface TimetableCellProps {
  timeSlotId: string;
  sectionId: string;
  assignment?: SubjectAssignment;
  onAssign: () => void;
  onRemove: () => void;
  getSubjectName: (id: string) => string;
  getTeacherName: (id: string) => string;
}

const TimetableCell: React.FC<TimetableCellProps> = ({
  assignment,
  onAssign,
  onRemove,
  getSubjectName,
  getTeacherName
}) => {
  if (assignment) {
    return (
      <div className="relative group">
        <div className="text-center py-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors">
          <div className="font-medium text-sm text-blue-900">
            {getSubjectName(assignment.subjectId)}
          </div>
          <div className="text-xs text-blue-700">
            {getTeacherName(assignment.teacherId)}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-red-300 hover:bg-red-50"
          onClick={onRemove}
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="text-center py-4 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      onClick={onAssign}
    >
      <Plus className="mx-auto h-4 w-4 text-gray-400 mb-1" />
      <span className="text-xs text-gray-500">Add Subject</span>
    </div>
  );
};

// Subject assignment dialog
interface SubjectAssignmentDialogProps {
  timeSlotId: string;
  sectionId: string;
  onClose: () => void;
  onAssign: (timeSlotId: string, sectionId: string, subjectId: string, teacherId: string) => void;
}

const SubjectAssignmentDialog: React.FC<SubjectAssignmentDialogProps> = ({
  timeSlotId,
  sectionId,
  onClose,
  onAssign
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const availableTeachers = selectedSubject 
    ? mockTeachers.filter(t => t.subjects.includes(selectedSubject))
    : [];

  const handleAssign = () => {
    if (!selectedSubject || !selectedTeacher) return;
    
    onAssign(timeSlotId, sectionId, selectedSubject, selectedTeacher);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Select a subject and teacher for this time slot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {mockSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="teacher">Teacher</Label>
            <Select 
              value={selectedTeacher} 
              onValueChange={setSelectedTeacher}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {availableTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedSubject || !selectedTeacher}
          >
            Assign Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableBuilder;
