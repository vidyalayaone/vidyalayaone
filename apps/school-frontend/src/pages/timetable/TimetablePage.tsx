// Timetable management page for admin users

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Printer,
  Download,
  Clock,
  Calendar,
  BookOpen,
  Users,
  Check,
  X,
  Save,
  Copy,
  MoreVertical
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// Types for timetable data
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isBreak?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  teacherId: string;
}

export interface TimetableCell {
  id: string;
  timeSlotId: string;
  sectionId: string;
  subject?: Subject;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface Section {
  id: string;
  name: string;
  grade: string;
  classTeacher: string;
  studentCount: number;
}

export interface Timetable {
  id: string;
  name: string;
  academicYear: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  cells: TimetableCell[];
  timeSlots: TimeSlot[];
  sections: Section[];
}

// Mock data for demonstration
const mockTimeSlots: TimeSlot[] = [
  { id: '1', startTime: '08:00', endTime: '08:45', label: 'Period 1' },
  { id: '2', startTime: '08:45', endTime: '09:30', label: 'Period 2' },
  { id: '3', startTime: '09:30', endTime: '10:15', label: 'Period 3' },
  { id: '4', startTime: '10:15', endTime: '10:30', label: 'Short Break', isBreak: true },
  { id: '5', startTime: '10:30', endTime: '11:15', label: 'Period 4' },
  { id: '6', startTime: '11:15', endTime: '12:00', label: 'Period 5' },
  { id: '7', startTime: '12:00', endTime: '12:45', label: 'Period 6' },
  { id: '8', startTime: '12:45', endTime: '13:30', label: 'Lunch Break', isBreak: true },
  { id: '9', startTime: '13:30', endTime: '14:15', label: 'Period 7' },
  { id: '10', startTime: '14:15', endTime: '15:00', label: 'Period 8' },
];

const mockSections: Section[] = [
  { id: '1', name: 'Section A', grade: 'Grade 1', classTeacher: 'Ms. Johnson', studentCount: 30 },
  { id: '2', name: 'Section B', grade: 'Grade 1', classTeacher: 'Ms. Wilson', studentCount: 28 },
  { id: '3', name: 'Section A', grade: 'Grade 2', classTeacher: 'Mr. Brown', studentCount: 32 },
  { id: '4', name: 'Section B', grade: 'Grade 2', classTeacher: 'Ms. Davis', studentCount: 29 },
  { id: '5', name: 'Section A', grade: 'Grade 3', classTeacher: 'Ms. Miller', studentCount: 31 },
];

const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH', teacher: 'Mr. Smith', teacherId: '1' },
  { id: '2', name: 'English', code: 'ENG', teacher: 'Ms. Johnson', teacherId: '2' },
  { id: '3', name: 'Science', code: 'SCI', teacher: 'Dr. Wilson', teacherId: '3' },
  { id: '4', name: 'Social Studies', code: 'SS', teacher: 'Mr. Brown', teacherId: '4' },
  { id: '5', name: 'Physical Education', code: 'PE', teacher: 'Coach Davis', teacherId: '5' },
  { id: '6', name: 'Art', code: 'ART', teacher: 'Ms. Taylor', teacherId: '6' },
  { id: '7', name: 'Music', code: 'MUS', teacher: 'Mr. Anderson', teacherId: '7' },
];

// Mock timetable with sample data
const sampleTimetableCells: TimetableCell[] = [
  { id: '1-1', timeSlotId: '1', sectionId: '1', subject: mockSubjects[0] },
  { id: '1-2', timeSlotId: '1', sectionId: '2', subject: mockSubjects[1] },
  { id: '2-1', timeSlotId: '2', sectionId: '1', subject: mockSubjects[1] },
  { id: '2-2', timeSlotId: '2', sectionId: '2', subject: mockSubjects[0] },
  { id: '5-1', timeSlotId: '5', sectionId: '1', subject: mockSubjects[2] },
  { id: '5-2', timeSlotId: '5', sectionId: '2', subject: mockSubjects[3] },
  { id: '6-1', timeSlotId: '6', sectionId: '1', subject: mockSubjects[4] },
  { id: '6-2', timeSlotId: '6', sectionId: '2', subject: mockSubjects[5] },
  { id: '9-1', timeSlotId: '9', sectionId: '1', subject: mockSubjects[6] },
  { id: '9-2', timeSlotId: '9', sectionId: '2', subject: mockSubjects[2] },
];

const mockTimetables: Timetable[] = [
  {
    id: '1',
    name: 'Academic Year 2024-25',
    academicYear: '2024-25',
    status: 'active',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-15T00:00:00Z',
    cells: sampleTimetableCells,
    timeSlots: mockTimeSlots,
    sections: mockSections
  }
];

// Simple Timetable Builder Component
interface TimetableBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timetable: Partial<Timetable>) => void;
  editingTimetable?: Timetable | null;
}

const TimetableBuilder: React.FC<TimetableBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTimetable
}) => {
  const [name, setName] = useState(editingTimetable?.name || '');
  const [academicYear, setAcademicYear] = useState(editingTimetable?.academicYear || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCells, setEditingCells] = useState<TimetableCell[]>(editingTimetable?.cells || []);
  const [selectedCell, setSelectedCell] = useState<{timeSlotId: string, sectionId: string} | null>(null);

  const { toast } = useToast();

  const handleSave = () => {
    if (!name || !academicYear) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name,
      academicYear,
      cells: editingCells,
      timeSlots: mockTimeSlots,
      sections: mockSections
    });
    onClose();
    setName('');
    setAcademicYear('');
    setEditingCells([]);
  };

  const handleCellAssignment = (timeSlotId: string, sectionId: string, subject: Subject) => {
    const cellId = `${timeSlotId}-${sectionId}`;
    const newCell: TimetableCell = {
      id: cellId,
      timeSlotId,
      sectionId,
      subject
    };

    setEditingCells(prev => {
      const filtered = prev.filter(c => c.id !== cellId);
      return [...filtered, newCell];
    });
    setSelectedCell(null);
  };

  const getCellContent = (timeSlotId: string, sectionId: string) => {
    const timeSlot = mockTimeSlots.find(ts => ts.id === timeSlotId);
    
    if (timeSlot?.isBreak) {
      return (
        <div className="text-center py-3 bg-yellow-100 rounded text-sm text-yellow-800 font-medium">
          {timeSlot.label}
        </div>
      );
    }

    const cell = editingCells.find(c => c.timeSlotId === timeSlotId && c.sectionId === sectionId);
    
    if (cell?.subject) {
      return (
        <div className="text-center py-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors">
          <div className="font-medium text-sm text-blue-900">{cell.subject.name}</div>
          <div className="text-xs text-blue-700">{cell.subject.teacher}</div>
        </div>
      );
    }

    return (
      <div 
        className="text-center py-4 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => setSelectedCell({ timeSlotId, sectionId })}
      >
        <Plus className="mx-auto h-4 w-4 text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">Add Subject</span>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTimetable ? 'Edit Timetable' : 'Create New Timetable'}
            </DialogTitle>
            <DialogDescription>
              Set up your school timetable with subjects and schedules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Timetable Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Academic Year 2024-25"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="year">Academic Year</Label>
                <Input
                  id="year"
                  placeholder="e.g., 2024-25"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
            </div>

            {/* Timetable Grid */}
            {(name && academicYear) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Subject Assignment</h3>
                  <p className="text-sm text-gray-600">Click on empty cells to assign subjects</p>
                </div>
                
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Time</TableHead>
                        {mockSections.map((section) => (
                          <TableHead key={section.id} className="text-center min-w-32">
                            <div>
                              <div className="font-semibold">{section.grade}</div>
                              <div className="text-sm">{section.name}</div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTimeSlots.map((timeSlot) => (
                        <TableRow key={timeSlot.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="text-sm font-semibold">{timeSlot.label}</div>
                              <div className="text-xs text-gray-600">
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </div>
                            </div>
                          </TableCell>
                          {mockSections.map((section) => (
                            <TableCell key={section.id} className="p-2">
                              {getCellContent(timeSlot.id, section.id)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Timetable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Selection Dialog */}
      {selectedCell && (
        <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Subject</DialogTitle>
              <DialogDescription>
                Select a subject for this time slot.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2">
              {mockSubjects.map((subject) => (
                <Button
                  key={subject.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleCellAssignment(selectedCell.timeSlotId, selectedCell.sectionId, subject)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-sm text-gray-600">{subject.teacher}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCell(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Main TimetablePage Component
export const TimetablePage: React.FC = () => {
  const { toast } = useToast();
  const [timetables, setTimetables] = useState<Timetable[]>(mockTimetables);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<string | null>(null);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);

  // Check if any timetable exists
  const hasTimetables = timetables.length > 0;

  // Get current timetable or first timetable
  const currentTimetable = selectedTimetable || timetables[0];

  // Generate timetable matrix for display
  const timetableMatrix = useMemo(() => {
    if (!currentTimetable) return {};

    const matrix: { [key: string]: TimetableCell } = {};
    
    // Fill with existing data
    currentTimetable.cells.forEach(cell => {
      const key = `${cell.timeSlotId}-${cell.sectionId}`;
      matrix[key] = cell;
    });

    return matrix;
  }, [currentTimetable]);

  const handleCreateTimetable = (timetableData: Partial<Timetable>) => {
    const newTimetable: Timetable = {
      id: `timetable-${Date.now()}`,
      name: timetableData.name!,
      academicYear: timetableData.academicYear!,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cells: timetableData.cells || [],
      timeSlots: timetableData.timeSlots || mockTimeSlots,
      sections: timetableData.sections || mockSections
    };

    setTimetables(prev => [...prev, newTimetable]);
    setSelectedTimetable(newTimetable);
    
    toast({
      title: "Success",
      description: "Timetable created successfully.",
    });
  };

  const handleEditTimetable = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setShowBuilderDialog(true);
  };

  const handleUpdateTimetable = (timetableData: Partial<Timetable>) => {
    if (!editingTimetable) return;

    const updatedTimetable: Timetable = {
      ...editingTimetable,
      name: timetableData.name!,
      academicYear: timetableData.academicYear!,
      cells: timetableData.cells || [],
      updatedAt: new Date().toISOString()
    };

    setTimetables(prev => 
      prev.map(t => t.id === editingTimetable.id ? updatedTimetable : t)
    );
    
    setSelectedTimetable(updatedTimetable);
    setEditingTimetable(null);
    
    toast({
      title: "Success",
      description: "Timetable updated successfully.",
    });
  };

  const handleDeleteTimetable = (id: string) => {
    setTimetables(prev => prev.filter(t => t.id !== id));
    if (selectedTimetable?.id === id) {
      setSelectedTimetable(null);
    }
    setTimetableToDelete(null);
    setShowDeleteDialog(false);
    
    toast({
      title: "Success",
      description: "Timetable deleted successfully.",
    });
  };

  const handleFinalizeTimetable = () => {
    if (!currentTimetable) return;

    const updatedTimetable: Timetable = {
      ...currentTimetable,
      status: 'active',
      updatedAt: new Date().toISOString()
    };

    setTimetables(prev => 
      prev.map(t => t.id === currentTimetable.id ? updatedTimetable : t)
    );
    
    setSelectedTimetable(updatedTimetable);
    setShowFinalizeDialog(false);
    
    toast({
      title: "Success",
      description: "Timetable has been finalized and activated.",
    });
  };

  const handleDuplicateTimetable = (timetable: Timetable) => {
    const duplicatedTimetable: Timetable = {
      ...timetable,
      id: `timetable-${Date.now()}`,
      name: `${timetable.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTimetables(prev => [...prev, duplicatedTimetable]);
    
    toast({
      title: "Success",
      description: "Timetable duplicated successfully.",
    });
  };

  const handlePrintTimetable = () => {
    if (!currentTimetable) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Timetable - ${currentTimetable.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; }
            .break-cell { background-color: #fff3cd; }
            .subject-cell { background-color: #e7f3ff; }
            h1 { text-align: center; color: #333; }
            .info { text-align: center; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${currentTimetable.name}</h1>
          <div class="info">Academic Year: ${currentTimetable.academicYear}</div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                ${currentTimetable.sections.map(section => 
                  `<th>${section.grade}<br/>${section.name}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${currentTimetable.timeSlots.map(timeSlot => `
                <tr>
                  <td><strong>${timeSlot.label}</strong><br/>${timeSlot.startTime} - ${timeSlot.endTime}</td>
                  ${currentTimetable.sections.map(section => {
                    const cell = timetableMatrix[`${timeSlot.id}-${section.id}`];
                    if (timeSlot.isBreak) {
                      return `<td class="break-cell">${timeSlot.label}</td>`;
                    }
                    if (cell?.subject) {
                      return `<td class="subject-cell">${cell.subject.name}<br/><small>${cell.subject.teacher}</small></td>`;
                    }
                    return '<td>-</td>';
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    toast({
      title: "Print",
      description: "Timetable sent to printer.",
    });
  };

  const getCellContent = (timeSlotId: string, sectionId: string) => {
    const cell = timetableMatrix[`${timeSlotId}-${sectionId}`];
    const timeSlot = currentTimetable?.timeSlots.find(ts => ts.id === timeSlotId);
    
    if (timeSlot?.isBreak) {
      return (
        <div className="text-center py-3 bg-yellow-100 rounded text-sm text-yellow-800 font-medium">
          {timeSlot.label}
        </div>
      );
    }

    if (cell?.subject) {
      return (
        <div className="text-center py-3 bg-blue-50 border border-blue-200 rounded">
          <div className="font-semibold text-sm text-blue-900">{cell.subject.name}</div>
          <div className="text-xs text-blue-700 mt-1">{cell.subject.teacher}</div>
        </div>
      );
    }

    return (
      <div className="text-center py-3 text-gray-400">
        <span className="text-sm">Free Period</span>
      </div>
    );
  };

  if (!hasTimetables && !showBuilderDialog) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your First Timetable</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Get started by creating a timetable for your school. You can manage all class schedules in one place.
          </p>
          
          <Button 
            onClick={() => setShowBuilderDialog(true)}
            size="lg"
            className="px-8 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Timetable
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
            <p className="text-gray-600">Manage class schedules and timetables</p>
          </div>
          
          <div className="flex items-center gap-3">
            {currentTimetable && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePrintTimetable}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreVertical className="mr-2 h-4 w-4" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTimetable(currentTimetable)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Timetable
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTimetable(currentTimetable)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {currentTimetable.status === 'draft' && (
                      <DropdownMenuItem onClick={() => setShowFinalizeDialog(true)}>
                        <Check className="mr-2 h-4 w-4" />
                        Finalize
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        setTimetableToDelete(currentTimetable.id);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button onClick={() => setShowBuilderDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Timetable
            </Button>
          </div>
        </div>

        {/* Timetable Selection */}
        {timetables.length > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Select Timetable:</Label>
                <Select
                  value={currentTimetable?.id || ''}
                  onValueChange={(value) => {
                    const timetable = timetables.find(t => t.id === value);
                    setSelectedTimetable(timetable || null);
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((timetable) => (
                      <SelectItem key={timetable.id} value={timetable.id}>
                        <div className="flex items-center gap-2">
                          <span>{timetable.name}</span>
                          <Badge variant={timetable.status === 'active' ? 'default' : 'secondary'}>
                            {timetable.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timetable Stats */}
        {currentTimetable && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Time Slots</p>
                    <p className="text-2xl font-bold">{currentTimetable.timeSlots.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sections</p>
                    <p className="text-2xl font-bold">{currentTimetable.sections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Assigned Classes</p>
                    <p className="text-2xl font-bold">{currentTimetable.cells.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge variant={currentTimetable.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                      {currentTimetable.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timetable Display */}
        {currentTimetable && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {currentTimetable.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Academic Year: {currentTimetable.academicYear}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32 font-semibold">Time</TableHead>
                      {currentTimetable.sections.map((section) => (
                        <TableHead key={section.id} className="text-center min-w-40 font-semibold">
                          <div>
                            <div>{section.grade}</div>
                            <div className="text-sm font-normal text-gray-600">{section.name}</div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTimetable.timeSlots.map((timeSlot) => (
                      <TableRow key={timeSlot.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm font-semibold">{timeSlot.label}</div>
                            <div className="text-xs text-gray-600">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </div>
                          </div>
                        </TableCell>
                        {currentTimetable.sections.map((section) => (
                          <TableCell key={section.id} className="p-2">
                            {getCellContent(timeSlot.id, section.id)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timetable Builder Dialog */}
      <TimetableBuilder
        isOpen={showBuilderDialog}
        onClose={() => {
          setShowBuilderDialog(false);
          setEditingTimetable(null);
        }}
        onSave={editingTimetable ? handleUpdateTimetable : handleCreateTimetable}
        editingTimetable={editingTimetable}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timetable? This action cannot be undone and will remove all associated schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => timetableToDelete && handleDeleteTimetable(timetableToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Timetable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Timetable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalize this timetable? Once finalized, it will become the active timetable and changes will be restricted. Students and teachers will be able to view this schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalizeTimetable}>
              Finalize Timetable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TimetablePage;
