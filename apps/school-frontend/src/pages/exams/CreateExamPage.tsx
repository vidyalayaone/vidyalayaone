// Create Exam page (replaces modal)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CalendarDays, ChevronDown, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { examAPI } from '@/api/exams';

// Mock classes data (kept same as other mocks for now)
const mockClasses = [
  {
    id: '1',
    grade: '1',
    sections: [
      { id: '1-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '1-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] }
    ]
  },
  {
    id: '2',
    grade: '2',
    sections: [
      { id: '2-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '2-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '2-C', name: 'C', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] },
      { id: '2-D', name: 'D', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] }
    ]
  },
  {
    id: '6',
    grade: '6',
    sections: [
      { id: '6-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] },
      { id: '6-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] }
    ]
  },
  {
    id: '7',
    grade: '7',
    sections: [
      { id: '7-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] },
      { id: '7-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'] }
    ]
  },
  {
    id: '10',
    grade: '10',
    sections: [
      { id: '10-A', name: 'A', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'] },
      { id: '10-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Commerce'] }
    ]
  },
  {
    id: '11',
    grade: '11',
    sections: [
      { id: '11-Science', name: 'Science', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'] },
      { id: '11-Commerce', name: 'Commerce', subjects: ['Economics', 'Business Studies', 'Accountancy', 'Mathematics', 'English'] },
      { id: '11-Arts', name: 'Arts', subjects: ['History', 'Geography', 'Political Science', 'Economics', 'English'] }
    ]
  },
  {
    id: '12',
    grade: '12',
    sections: [
      { id: '12-Science', name: 'Science', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'] },
      { id: '12-Commerce', name: 'Commerce', subjects: ['Economics', 'Business Studies', 'Accountancy', 'Mathematics', 'English'] },
      { id: '12-Arts', name: 'Arts', subjects: ['History', 'Geography', 'Political Science', 'Economics', 'English'] }
    ]
  }
];

const commonExamNames = [
  'Quarterly Exam',
  'Halfyearly Exam',
  'Yearly Exam',
  'Final Exam',
  'Unit Test 1',
  'Unit Test 2',
  'Monthly Test'
];

const generateAcademicYears = (startYear = 2000, extraFuture = 3) => {
  const years: string[] = [];
  const now = new Date();
  const endYear = now.getFullYear() + extraFuture;

  for (let y = startYear; y <= endYear; y++) {
    const next = (y + 1) % 100;
    const nextStr = next < 10 ? `0${next}` : `${next}`;
    years.push(`${y}-${nextStr}`);
  }

  return years.reverse(); // show latest first
};

const allClassIds = mockClasses.map(c => c.id);

// Default slot
const defaultSlot = {
  id: '1',
  name: 'Morning Session',
  startTime: '09:00',
  endTime: '12:00'
};

const CreateExamPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return commonExamNames;
    return commonExamNames.filter(s => s.toLowerCase().includes(q));
  }, [name]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [academicYear, setAcademicYear] = useState<string | null>(null);

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectAllClasses, setSelectAllClasses] = useState(false);
  const [slots, setSlots] = useState([defaultSlot]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // default academic year to current academic year
    const now = new Date();
    const currYear = now.getFullYear();
    const next = (currYear + 1) % 100;
    setAcademicYear(`${currYear}-${next < 10 ? '0' + next : next}`);
  }, []);

  const academicYears = useMemo(() => generateAcademicYears(2000, 3), []);

  const handleSelectAllClasses = useCallback((checked: boolean) => {
    setSelectAllClasses(checked);
    if (checked) {
      setSelectedClasses(allClassIds);
    } else {
      setSelectedClasses([]);
    }
  }, []);

  const handleClassToggle = useCallback((classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => {
        const newSelected = Array.from(new Set([...prev, classId]));
        // Check if all classes are now selected
        if (newSelected.length === allClassIds.length) {
          setSelectAllClasses(true);
        }
        return newSelected;
      });
    } else {
      setSelectedClasses(prev => prev.filter(id => id !== classId));
      setSelectAllClasses(false);
    }
  }, []);

  const handleSuggestionClick = useCallback((s: string) => {
    setName(s);
    setShowSuggestions(false);
  }, []);

  const handleAddSlot = useCallback(() => {
    const newSlot = {
      id: Date.now().toString(),
      name: `Slot ${slots.length + 1}`,
      startTime: '09:00',
      endTime: '12:00'
    };
    setSlots(prev => [...prev, newSlot]);
  }, [slots.length]);

  const handleRemoveSlot = useCallback((slotId: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== slotId));
  }, []);

  const handleSlotChange = useCallback((slotId: string, field: string, value: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Please enter exam name', variant: 'destructive' });
      return;
    }

    if (!startDate || !endDate) {
      toast({ title: 'Error', description: 'Please select start and end dates', variant: 'destructive' });
      return;
    }

    if (startDate >= endDate) {
      toast({ title: 'Error', description: 'End date must be after start date', variant: 'destructive' });
      return;
    }

    if (!academicYear) {
      toast({ title: 'Error', description: 'Please select academic year', variant: 'destructive' });
      return;
    }

    if (selectedClasses.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one class', variant: 'destructive' });
      return;
    }

    if (slots.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one time slot', variant: 'destructive' });
      return;
    }

    // Validate slots
    for (const slot of slots) {
      if (!slot.name.trim()) {
        toast({ title: 'Error', description: 'Please enter name for all slots', variant: 'destructive' });
        return;
      }
      if (slot.startTime >= slot.endTime) {
        toast({ title: 'Error', description: 'End time must be after start time for all slots', variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create selected sections from selected classes (all sections for each selected class)
      const selectedSections = selectedClasses.flatMap(classId => {
        const cls = mockClasses.find(c => c.id === classId);
        return cls ? cls.sections.map(section => ({
          id: section.id,
          grade: cls.grade,
          section: section.name
        })) : [];
      });

      const examData = {
        name: name.trim(),
        academicYear,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'draft' as const,
        totalClasses: selectedClasses.length,
        totalSections: selectedSections.length,
        selectedSections,
        slots: slots.map(slot => ({
          id: slot.id,
          name: slot.name.trim(),
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        isScheduled: false,
        isFinalised: false,
        description: `${name.trim()} for ${academicYear}`
      };

      await examAPI.createExam(examData as any);

      toast({ title: 'Success', description: 'Exam created successfully' });
      navigate('/exams');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create exam', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/exams')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Exam</h1>
          <p className="text-muted-foreground">Create a new examination</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Half Yearly Examination"
                value={name}
                onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => setShowSuggestions(true)}
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-card border rounded-md mt-1 max-h-40 overflow-auto">
                  {filteredSuggestions.map(s => (
                    <div
                      key={s}
                      onMouseDown={() => handleSuggestionClick(s)}
                      className="px-3 py-2 hover:bg-muted cursor-pointer"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <select
                id="academicYear"
                className="w-full rounded-md border p-2"
                value={academicYear || ''}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="" disabled>Select academic year</option>
                {academicYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => setStartDate(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => setEndDate(date || null)}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">Timings *</Label>
                <p className="text-sm text-muted-foreground mt-1">Define time slots for this exam</p>
              </div>
            </div>

            {/* Slots List */}
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <Card key={slot.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label htmlFor={`slot-name-${slot.id}`} className="text-sm font-medium">
                        Slot Name
                      </Label>
                      <Input
                        id={`slot-name-${slot.id}`}
                        value={slot.name}
                        onChange={(e) => handleSlotChange(slot.id, 'name', e.target.value)}
                        placeholder="e.g., Morning Session"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`slot-start-${slot.id}`} className="text-sm font-medium">
                        Start Time
                      </Label>
                      <Input
                        id={`slot-start-${slot.id}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`slot-end-${slot.id}`} className="text-sm font-medium">
                        End Time
                      </Label>
                      <Input
                        id={`slot-end-${slot.id}`}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="mt-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddSlot}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">Classes *</Label>
                <p className="text-sm text-muted-foreground mt-1">Select the classes for this exam</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {selectedClasses.length} classes selected
                </div>
                <Button
                  type="button"
                  variant={selectAllClasses ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectAllClasses(!selectAllClasses)}
                >
                  {selectAllClasses ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
              {mockClasses.map(cls => {
                const isSelected = selectedClasses.includes(cls.id);

                return (
                  <Card key={cls.id} className={`p-3 transition-all border-2 cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}>
                    <CardContent className="p-0 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={isSelected}
                          onCheckedChange={(v) => handleClassToggle(cls.id, !!v)}
                        />
                        <CardTitle className="text-lg font-semibold">{cls.grade}</CardTitle>
                        <div className="text-xs text-muted-foreground">
                          {cls.sections.length} sections
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selection Summary */}
            {/* {selectedClasses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Classes:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedClasses.map(classId => {
                    const cls = mockClasses.find(c => c.id === classId);
                    if (!cls) return null;
                    return (
                      <Badge key={classId} variant="secondary" className="text-xs">
                        Class {cls.grade}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClassToggle(classId, false);
                          }}
                          className="ml-2 text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )} */}
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => navigate('/exams')}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateExamPage;