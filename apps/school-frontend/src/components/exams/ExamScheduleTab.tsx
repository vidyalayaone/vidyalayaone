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
import { timeSlotAPI, type TimeSlot as APITimeSlot, type Exam } from '@/api/exams';

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
  exam: Exam;
}

const ExamScheduleTab: React.FC<ExamScheduleTabProps> = ({ examId, exam }) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ slotId: string; classId: string; date: string } | null>(null);
  const [finaliseDialog, setFinaliseDialog] = useState<{ slotId: string; isOpen: boolean; hasWarnings: boolean }>({ slotId: '', isOpen: false, hasWarnings: false });
  
  const [newSlot, setNewSlot] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  // Generate exam dates from the exam start and end dates
  const examDates = React.useMemo(() => {
    const dates: string[] = [];
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  }, [exam.startDate, exam.endDate]);

  // Generate class subjects mapping from exam data (grouped by class, not section)
  const mockClassSubjects = React.useMemo(() => {
    const classSubjects: Record<string, string[]> = {};
    
    // Group sections by class
    const classesByGrade: Record<string, any[]> = {};
    exam.selectedSections.forEach(section => {
      if (!classesByGrade[section.grade]) {
        classesByGrade[section.grade] = [];
      }
      classesByGrade[section.grade].push(section);
    });
    
    // Create subjects mapping for each class (not section)
    Object.keys(classesByGrade).forEach(grade => {
      const classKey = `Class ${grade}`;
      // Mock subjects for now - in real app this would come from API
      classSubjects[classKey] = ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi'];
    });
    
    return classSubjects;
  }, [exam.selectedSections]);

  // Load time slots on component mount
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        // Use exam slots if they exist, otherwise load from API
        if (exam.slots && exam.slots.length > 0) {
          const slotsWithTimetable = exam.slots.map(slot => {
            // Initialize timetable with all selected classes (not sections)
            const timetable: Record<string, Record<string, string>> = {};
            
            // Group sections by class
            const classesByGrade: Record<string, any[]> = {};
            exam.selectedSections.forEach(section => {
              if (!classesByGrade[section.grade]) {
                classesByGrade[section.grade] = [];
              }
              classesByGrade[section.grade].push(section);
            });
            
            // Create timetable for each class
            Object.keys(classesByGrade).forEach(grade => {
              const classKey = `Class ${grade}`;
              timetable[classKey] = {};
              examDates.forEach(date => {
                timetable[classKey][date] = '';
              });
            });

            return {
              id: slot.id,
              name: slot.name,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isFinalised: false,
              timetable
            };
          });
          setTimeSlots(slotsWithTimetable);
        } else {
          const timeSlotsData = await timeSlotAPI.getTimeSlots(examId);
          setTimeSlots(timeSlotsData);
        }
      } catch (error) {
        console.error('Error loading time slots:', error);
        // Fallback to exam slots if API fails
        if (exam.slots && exam.slots.length > 0) {
          const slotsWithTimetable = exam.slots.map(slot => {
            // Initialize timetable with all selected classes (not sections)
            const timetable: Record<string, Record<string, string>> = {};
            
            // Group sections by class
            const classesByGrade: Record<string, any[]> = {};
            exam.selectedSections.forEach(section => {
              if (!classesByGrade[section.grade]) {
                classesByGrade[section.grade] = [];
              }
              classesByGrade[section.grade].push(section);
            });
            
            // Create timetable for each class
            Object.keys(classesByGrade).forEach(grade => {
              const classKey = `Class ${grade}`;
              timetable[classKey] = {};
              examDates.forEach(date => {
                timetable[classKey][date] = '';
              });
            });

            return {
              id: slot.id,
              name: slot.name,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isFinalised: false,
              timetable
            };
          });
          setTimeSlots(slotsWithTimetable);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [examId, exam.slots, exam.selectedSections, examDates]);

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
    
    // Get all subjects already assigned for this class in this slot (excluding current date)
    const usedSubjects = Object.entries(slot.timetable[classId] || {})
      .filter(([date, subject]) => date !== currentDate && subject)
      .map(([_, subject]) => subject);

    // Return subjects that haven't been used yet
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

  const handleSave = async (slotId: string) => {
    try {
      await timeSlotAPI.finaliseTimeSlot(examId, slotId);
      
      setTimeSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, isFinalised: true } : slot
      ));
      
      setFinaliseDialog({ slotId: '', isOpen: false, hasWarnings: false });
      
      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (slotId: string) => {
    try {
      // Clear any pending edit state
      setEditingCell(null);
      
      // Enable editing mode by setting isFinalised to false
      setTimeSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, isFinalised: false } : slot
      ));
      
      toast({
        title: "Success",
        description: "Timetable is now editable",
      });
    } catch (error) {
      console.error('Error enabling edit mode:', error);
      toast({
        title: "Error",
        description: "Failed to enable edit mode",
        variant: "destructive",
      });
    }
  };

  const handleOpenSaveDialog = (slotId: string) => {
    const missingSubjects = checkMissingSubjects(slotId);
    setFinaliseDialog({ 
      slotId, 
      isOpen: true, 
      hasWarnings: missingSubjects.length > 0 
    });
  };

  const handlePrint = (slot: TimeSlot) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }

    const classes = Object.keys(slot.timetable);
    
    // Generate the HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exam Schedule - ${slot.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .exam-info {
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .exam-info div {
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: center;
              font-size: 12px;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .class-cell {
              background-color: #f9f9f9;
              font-weight: bold;
              text-align: left;
            }
            .subject-cell {
              background-color: #e8f4fd;
              color: #1a73e8;
              font-weight: 500;
            }
            .empty-cell {
              background-color: #fff;
              height: 30px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Exam Schedule</h1>
            <p><strong>${exam.name}</strong> - ${exam.academicYear}</p>
            <p>Time Slot: ${slot.name} (${slot.startTime} - ${slot.endTime})</p>
          </div>
          
          <div class="exam-info">
            <div><strong>Exam Period:</strong> ${format(new Date(exam.startDate), 'MMM dd, yyyy')} - ${format(new Date(exam.endDate), 'MMM dd, yyyy')}</div>
            <div><strong>Status:</strong> ${slot.isFinalised ? 'Saved' : 'Draft'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Class</th>
                ${examDates.map(date => `<th>${format(new Date(date), 'MMM dd')}<br/><small>${format(new Date(date), 'EEEE')}</small></th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${classes.map(classId => `
                <tr>
                  <td class="class-cell">${classId}</td>
                  ${examDates.map(date => {
                    const subject = slot.timetable[classId]?.[date] || '';
                    return `<td class="${subject ? 'subject-cell' : 'empty-cell'}">${subject}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}</p>
            <p>Note: Empty cells indicate no exam scheduled for that subject on that date.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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
                          value={subject || undefined}
                          onValueChange={(value) => {
                            if (value === "clear") {
                              handleSubjectAssignment(slot.id, classId, date, "");
                            } else {
                              handleSubjectAssignment(slot.id, classId, date, value);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subject && (
                              <SelectItem value="clear" className="text-red-600">
                                Clear Subject
                              </SelectItem>
                            )}
                            {getAvailableSubjects(slot.id, classId, date).map(subj => (
                              <SelectItem key={subj} value={subj}>
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div
                          className={`min-h-8 p-1 rounded text-sm ${
                            subject 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : slot.isFinalised 
                                ? 'bg-white border border-gray-200'
                                : 'bg-gray-50 text-gray-400 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100'
                          } ${slot.isFinalised ? '' : 'cursor-pointer'}`}
                          onClick={() => {
                            if (!slot.isFinalised) {
                              setEditingCell({ slotId: slot.id, classId, date });
                            }
                          }}
                        >
                          {subject || (slot.isFinalised ? '' : 'Add Subject')}
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
                Manage exam timetables for each time slot
              </p>
            </div>
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
                        Saved
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
                      onClick={() => handleOpenSaveDialog(slot.id)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(slot.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrint(slot)}
                      >
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
                  Time slots need to be defined during exam creation to build the schedule
                </p>
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

      {/* Save Confirmation Dialog */}
      <AlertDialog 
        open={finaliseDialog.isOpen} 
        onOpenChange={(open) => setFinaliseDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Timetable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this timetable? The schedule will be locked and cells without subjects will appear as blank spaces.
              {finaliseDialog.hasWarnings && (
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
                  <p className="mt-2 text-sm text-yellow-700">
                    You can still save the timetable with missing subjects and edit later if needed.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSave(finaliseDialog.slotId)}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamScheduleTab;
