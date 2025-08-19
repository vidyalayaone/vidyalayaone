// Exam schedule tab component with time slots and timetable management

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar,
  Edit,
  Printer,
  Save,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { timeSlotAPI, type TimeSlot as APITimeSlot } from '@/api/exams';

// Mock data
interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isFinalised: boolean;
  timetable: Record<string, Record<string, string>>;
}

const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    name: 'Morning Session',
    startTime: '09:00',
    endTime: '12:00',
    isFinalised: true,
    timetable: {
      '10-A': {
        '2024-09-15': 'Mathematics',
        '2024-09-16': 'English',
        '2024-09-17': 'Science'
      },
      '10-B': {
        '2024-09-15': 'Mathematics',
        '2024-09-16': 'English',
        '2024-09-17': 'Science'
      }
    }
  },
  {
    id: '2',
    name: 'Afternoon Session',
    startTime: '14:00',
    endTime: '17:00',
    isFinalised: false,
    timetable: {
      '12-A': {
        '2024-09-15': 'Physics',
        '2024-09-16': '',
        '2024-09-17': 'Chemistry'
      },
      '12-B': {
        '2024-09-15': 'Economics',
        '2024-09-16': 'Business Studies',
        '2024-09-17': ''
      }
    }
  }
];

const mockClassSubjects: Record<string, string[]> = {
  '10-A': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science'],
  '10-B': ['Mathematics', 'English', 'Science', 'Social Studies', 'Commerce'],
  '12-A': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'],
  '12-B': ['English', 'Mathematics', 'Economics', 'Business Studies', 'Accountancy']
};

const examDates = [
  '2024-09-15',
  '2024-09-16',
  '2024-09-17',
  '2024-09-18',
  '2024-09-19'
];

interface ExamScheduleTabProps {
  examId: string;
}

const ExamScheduleTab: React.FC<ExamScheduleTabProps> = ({ examId }) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ slotId: string; classId: string; date: string } | null>(null);
  const [finaliseDialog, setFinaliseDialog] = useState<{ slotId: string; isOpen: boolean }>({ slotId: '', isOpen: false });
  
  const [newSlot, setNewSlot] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  // Load time slots on component mount
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        const timeSlotsData = await timeSlotAPI.getTimeSlots(examId);
        setTimeSlots(timeSlotsData);
      } catch (error) {
        console.error('Error loading time slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [examId]);

  const handleAddTimeSlot = async () => {
    if (!newSlot.name || !newSlot.startTime || !newSlot.endTime) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTimeSlot = await timeSlotAPI.createTimeSlot(examId, {
        name: newSlot.name,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isFinalised: false,
        timetable: {}
      });

      setTimeSlots(prev => [...prev, newTimeSlot]);
      setNewSlot({ name: '', startTime: '', endTime: '' });
      setIsAddSlotDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Time slot added successfully",
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      });
    }
  };

  const handleSubjectAssignment = (slotId: string, classId: string, date: string, subject: string) => {
    setTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          timetable: {
            ...slot.timetable,
            [classId]: {
              ...slot.timetable[classId],
              [date]: subject
            }
          }
        };
      }
      return slot;
    }));
    setEditingCell(null);
  };

  const getAvailableSubjects = (slotId: string, classId: string, currentDate: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return [];

    const allSubjects = mockClassSubjects[classId] || [];
    const usedSubjects = Object.entries(slot.timetable[classId] || {})
      .filter(([date, subject]) => date !== currentDate && subject)
      .map(([, subject]) => subject);

    return allSubjects.filter(subject => !usedSubjects.includes(subject));
  };

  const checkMissingSubjects = (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return [];

    const missingSubjects: string[] = [];
    
    Object.keys(slot.timetable).forEach(classId => {
      const allSubjects = mockClassSubjects[classId] || [];
      const assignedSubjects = Object.values(slot.timetable[classId] || {})
        .filter(subject => subject);
      
      const missing = allSubjects.filter(subject => !assignedSubjects.includes(subject));
      if (missing.length > 0) {
        missingSubjects.push(`${classId}: ${missing.join(', ')}`);
      }
    });
    
    return missingSubjects;
  };

  const handleFinalise = async (slotId: string) => {
    const missingSubjects = checkMissingSubjects(slotId);
    
    if (missingSubjects.length > 0) {
      toast({
        title: "Warning",
        description: `Some subjects are missing: ${missingSubjects.join('; ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await timeSlotAPI.finaliseTimeSlot(examId, slotId);
      
      setTimeSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, isFinalised: true } : slot
      ));
      
      setFinaliseDialog({ slotId: '', isOpen: false });
      
      toast({
        title: "Success",
        description: "Timetable finalised successfully",
      });
    } catch (error) {
      console.error('Error finalising timetable:', error);
      toast({
        title: "Error",
        description: "Failed to finalise timetable",
        variant: "destructive",
      });
    }
  };

  const renderTimetableMatrix = (slot: TimeSlot) => {
    const classes = Object.keys(slot.timetable);
    
    if (classes.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <p>No classes assigned to this time slot</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-50 font-medium">Class</th>
              {examDates.map(date => (
                <th key={date} className="border border-gray-300 p-2 bg-gray-50 font-medium min-w-[120px]">
                  {format(new Date(date), 'MMM dd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map(classId => (
              <tr key={classId}>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                  {classId}
                </td>
                {examDates.map(date => {
                  const subject = slot.timetable[classId]?.[date] || '';
                  const isEditing = editingCell?.slotId === slot.id && 
                                   editingCell?.classId === classId && 
                                   editingCell?.date === date;
                  
                  return (
                    <td key={date} className="border border-gray-300 p-1">
                      {isEditing ? (
                        <Select
                          value={subject}
                          onValueChange={(value) => handleSubjectAssignment(slot.id, classId, date, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Subject</SelectItem>
                            {getAvailableSubjects(slot.id, classId, date).map(subj => (
                              <SelectItem key={subj} value={subj}>
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div
                          className={`min-h-8 p-1 rounded cursor-pointer text-sm ${
                            subject 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-gray-50 text-gray-400 border border-dashed border-gray-300'
                          } ${slot.isFinalised ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
                          onClick={() => {
                            if (!slot.isFinalised) {
                              setEditingCell({ slotId: slot.id, classId, date });
                            }
                          }}
                        >
                          {subject || 'Click to add'}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Exam Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Create time slots and manage exam timetables
              </p>
            </div>
            <Button onClick={() => setIsAddSlotDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>

      {/* Time Slots */}
      <div className="space-y-6">
        {timeSlots.map((slot) => (
          <Card key={slot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {slot.name}
                    {slot.isFinalised && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalised
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!slot.isFinalised ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setFinaliseDialog({ slotId: slot.id, isOpen: true })}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Finalise
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderTimetableMatrix(slot)}
            </CardContent>
          </Card>
        ))}
      </div>

          {timeSlots.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Time Slots</h3>
                <p className="text-muted-foreground mb-4">
                  Create time slots to start building your exam schedule
                </p>
                <Button onClick={() => setIsAddSlotDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Time Slot Dialog */}
      <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
            <DialogDescription>
              Create a new time slot for the exam schedule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slotName">Slot Name</Label>
              <Input
                id="slotName"
                placeholder="e.g., Morning Session"
                value={newSlot.name}
                onChange={(e) => setNewSlot(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot}>
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalise Confirmation Dialog */}
      <AlertDialog 
        open={finaliseDialog.isOpen} 
        onOpenChange={(open) => setFinaliseDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalise Timetable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalise this timetable? This action cannot be undone easily.
              {checkMissingSubjects(finaliseDialog.slotId).length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Missing Subjects:</span>
                  </div>
                  <ul className="mt-1 text-sm text-yellow-700">
                    {checkMissingSubjects(finaliseDialog.slotId).map((missing, index) => (
                      <li key={index}>• {missing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleFinalise(finaliseDialog.slotId)}>
              Finalise
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamScheduleTab;
