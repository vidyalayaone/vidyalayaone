// Dialog component for creating new exams

import React, { useState } from 'react';
import { Calendar, CalendarDays, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

// Mock data for classes and sections
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
      { id: '2-B', name: 'B', subjects: ['English', 'Mathematics', 'Science', 'Social Studies'] }
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
    id: '12',
    grade: '12',
    sections: [
      { id: '12-A', name: 'A', subjects: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'] },
      { id: '12-B', name: 'B', subjects: ['English', 'Mathematics', 'Economics', 'Business Studies', 'Accountancy'] }
    ]
  }
];

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExamCreated?: () => void;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({ open, onOpenChange, onExamCreated }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get all sections for "Select All" functionality
  const allSections = mockClasses.flatMap(cls => 
    cls.sections.map(section => section.id)
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSections(allSections);
    } else {
      setSelectedSections([]);
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections(prev => [...prev, sectionId]);
    } else {
      setSelectedSections(prev => prev.filter(id => id !== sectionId));
      setSelectAll(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter exam name",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.startDate >= formData.endDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSections.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one section",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare exam data
      const examData = {
        name: formData.name.trim(),
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        status: 'draft' as const,
        totalClasses: 0, // Will be calculated
        totalSections: selectedSections.length,
        selectedSections: selectedSections.map(sectionId => {
          const section = mockClasses
            .flatMap(cls => cls.sections)
            .find(s => s.id === sectionId);
          
          const grade = mockClasses.find(cls => 
            cls.sections.some(s => s.id === sectionId)
          )?.grade || '';
          
          return {
            id: sectionId,
            grade,
            section: section?.name || ''
          };
        }),
        isScheduled: false,
        isFinalised: false,
        description: `${formData.name.trim()} for selected classes and sections.`
      };

      // Create exam via API
      await examAPI.createExam(examData);

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      // Reset form and close dialog
      setFormData({ name: '', startDate: null, endDate: null });
      setSelectedSections([]);
      setSelectAll(false);
      onOpenChange(false);
      
      // Call callback to refresh parent component
      if (onExamCreated) {
        onExamCreated();
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', startDate: null, endDate: null });
    setSelectedSections([]);
    setSelectAll(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new examination
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Half Yearly Examination"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          {/* Date Selection */}
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
                    {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || null }))}
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
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date || null }))}
                    initialFocus
                    disabled={(date) => formData.startDate ? date < formData.startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Class and Section Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Classes & Sections *</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockClasses.map((cls) => (
                <Card key={cls.id} className="p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Grade {cls.grade}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      {cls.sections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={section.id}
                            checked={selectedSections.includes(section.id)}
                            onCheckedChange={(checked) => 
                              handleSectionToggle(section.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={section.id} className="text-sm">
                            Section {section.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Sections Summary */}
            {selectedSections.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Selected ({selectedSections.length} sections):
                </Label>
                <div className="flex flex-wrap gap-1">
                  {selectedSections.slice(0, 10).map((sectionId) => {
                    const section = mockClasses
                      .flatMap(cls => cls.sections)
                      .find(s => s.id === sectionId);
                    
                    if (!section) return null;
                    
                    const grade = mockClasses.find(cls => 
                      cls.sections.some(s => s.id === sectionId)
                    )?.grade;
                    
                    return (
                      <Badge key={sectionId} variant="secondary" className="text-xs">
                        {grade}-{section.name}
                      </Badge>
                    );
                  })}
                  {selectedSections.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedSections.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Exam'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamDialog;
