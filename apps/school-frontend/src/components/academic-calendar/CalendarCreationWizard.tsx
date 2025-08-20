// Calendar Creation Wizard Component

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  Check,
  School,
  CalendarDays,
  BookOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarWizardProps {
  onComplete: (data: {
    name: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    quickEvents: Array<{
      title: string;
      type: string;
      startDate: string;
      endDate?: string;
    }>;
  }) => void;
  onCancel: () => void;
}

const CalendarCreationWizard: React.FC<CalendarWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    quickEvents: [] as Array<{
      title: string;
      type: string;
      startDate: string;
      endDate?: string;
    }>
  });

  const quickEventTemplates = [
    { title: 'First Term Start', type: 'TERM_START', months: 0 },
    { title: 'Diwali Holiday', type: 'HOLIDAY', months: 2 },
    { title: 'Winter Break Start', type: 'VACATION', months: 3 },
    { title: 'Winter Break End', type: 'VACATION', months: 4 },
    { title: 'Mid-term Examinations', type: 'EXAM', months: 5 },
    { title: 'Second Term Start', type: 'TERM_START', months: 6 },
    { title: 'Annual Day', type: 'EVENT', months: 8 },
    { title: 'Final Examinations', type: 'EXAM', months: 10 },
    { title: 'Academic Year End', type: 'TERM_END', months: 11 }
  ];

  const generateAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth >= 3) { // April onwards
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const generateDates = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    let startYear, endYear;
    if (currentMonth >= 3) { // April onwards
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }
    
    return {
      startDate: `${startYear}-04-01`,
      endDate: `${endYear}-03-31`
    };
  };

  const handleQuickSetup = () => {
    const academicYear = generateAcademicYear();
    const dates = generateDates();
    
    setFormData({
      name: `Academic Calendar ${academicYear}`,
      academicYear,
      startDate: dates.startDate,
      endDate: dates.endDate,
      quickEvents: []
    });
  };

  const generateQuickEvents = () => {
    if (!formData.startDate) return;
    
    const startDate = new Date(formData.startDate);
    const events = quickEventTemplates.map(template => {
      const eventDate = new Date(startDate);
      eventDate.setMonth(startDate.getMonth() + template.months);
      
      return {
        title: template.title,
        type: template.type,
        startDate: eventDate.toISOString().split('T')[0],
        endDate: template.type === 'VACATION' ? 
          new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          undefined
      };
    });
    
    setFormData({ ...formData, quickEvents: events });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.academicYear && formData.startDate && formData.endDate;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <School className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
        <p className="text-muted-foreground">Set up your academic calendar with basic details</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Calendar Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Academic Calendar 2024-2025"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year *</Label>
          <Input
            id="academicYear"
            placeholder="e.g., 2024-2025"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Quick Setup</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Auto-fill with standard academic year dates (April to March)
          </p>
          <Button onClick={handleQuickSetup} variant="outline" className="w-full">
            Use Standard Academic Year
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CalendarDays className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Quick Events (Optional)</h3>
        <p className="text-muted-foreground">Add common academic events to get started quickly</p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Generate Common Events</h4>
          <p className="text-sm text-muted-foreground mb-3">
            We'll add typical academic events like term starts, holidays, and examinations
          </p>
          <Button 
            onClick={generateQuickEvents} 
            variant="outline" 
            className="w-full"
            disabled={!formData.startDate}
          >
            Generate Standard Events
          </Button>
        </div>
        
        {formData.quickEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Generated Events ({formData.quickEvents.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {formData.quickEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              You can modify these events later after creating the calendar
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Check className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Review & Create</h3>
        <p className="text-muted-foreground">Review your calendar setup before creating</p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calendar Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Academic Year:</span>
              <span className="font-medium">{formData.academicYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">
                {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Events:</span>
              <span className="font-medium">{formData.quickEvents.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Your calendar will be created in draft mode</li>
            <li>• You can add, edit, or remove events</li>
            <li>• Finalize when you're satisfied with the setup</li>
            <li>• Once finalized, events cannot be modified</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Create Academic Calendar
          </CardTitle>
          <Badge variant="outline">
            Step {currentStep} of 3
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            onClick={onCancel} 
            variant="outline"
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button 
                onClick={handlePrevious} 
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext} 
                disabled={!isStepValid()}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Create Calendar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarCreationWizard;
