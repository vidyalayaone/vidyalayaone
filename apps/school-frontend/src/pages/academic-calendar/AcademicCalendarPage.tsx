// Academic Calendar management page for admin users

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Printer, 
  Save,
  Check,
  AlertTriangle,
  CalendarDays,
  BookOpen,
  GraduationCap
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import CalendarCreationWizard from '@/components/academic-calendar/CalendarCreationWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'react-hot-toast';

// Types
interface AcademicCalendar {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'FINALIZED';
  events: AcademicEvent[];
  createdAt: string;
  finalizedAt?: string;
}

interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  type: 'TERM_START' | 'TERM_END' | 'HOLIDAY' | 'EXAM' | 'EVENT' | 'VACATION';
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  color: string;
}

// Mock API functions
const mockAPI = {
  getAcademicCalendar: async (): Promise<AcademicCalendar | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const savedCalendar = localStorage.getItem('academic-calendar');
    return savedCalendar ? JSON.parse(savedCalendar) : null;
  },

  createAcademicCalendar: async (data: Partial<AcademicCalendar>): Promise<AcademicCalendar> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const calendar: AcademicCalendar = {
      id: Date.now().toString(),
      name: data.name || '',
      academicYear: data.academicYear || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: 'DRAFT',
      events: data.events || [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
    return calendar;
  },

  updateAcademicCalendar: async (id: string, data: Partial<AcademicCalendar>): Promise<AcademicCalendar> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingCalendar = localStorage.getItem('academic-calendar');
    if (!existingCalendar) throw new Error('Calendar not found');
    
    const calendar = { ...JSON.parse(existingCalendar), ...data };
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
    return calendar;
  },

  finalizeCalendar: async (id: string): Promise<AcademicCalendar> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingCalendar = localStorage.getItem('academic-calendar');
    if (!existingCalendar) throw new Error('Calendar not found');
    
    const calendar = { 
      ...JSON.parse(existingCalendar), 
      status: 'FINALIZED',
      finalizedAt: new Date().toISOString()
    };
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
    return calendar;
  },

  deleteCalendar: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('academic-calendar');
  },

  addEvent: async (calendarId: string, event: Omit<AcademicEvent, 'id'>): Promise<AcademicEvent> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingCalendar = localStorage.getItem('academic-calendar');
    if (!existingCalendar) throw new Error('Calendar not found');
    
    const calendar = JSON.parse(existingCalendar);
    const newEvent = { ...event, id: Date.now().toString() };
    calendar.events.push(newEvent);
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
    return newEvent;
  },

  updateEvent: async (calendarId: string, eventId: string, event: Partial<AcademicEvent>): Promise<AcademicEvent> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingCalendar = localStorage.getItem('academic-calendar');
    if (!existingCalendar) throw new Error('Calendar not found');
    
    const calendar = JSON.parse(existingCalendar);
    const eventIndex = calendar.events.findIndex((e: AcademicEvent) => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    
    calendar.events[eventIndex] = { ...calendar.events[eventIndex], ...event };
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
    return calendar.events[eventIndex];
  },

  deleteEvent: async (calendarId: string, eventId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingCalendar = localStorage.getItem('academic-calendar');
    if (!existingCalendar) throw new Error('Calendar not found');
    
    const calendar = JSON.parse(existingCalendar);
    calendar.events = calendar.events.filter((e: AcademicEvent) => e.id !== eventId);
    localStorage.setItem('academic-calendar', JSON.stringify(calendar));
  }
};

const eventTypeColors = {
  TERM_START: '#10b981',
  TERM_END: '#ef4444',
  HOLIDAY: '#f59e0b',
  EXAM: '#8b5cf6',
  EVENT: '#3b82f6',
  VACATION: '#ec4899'
};

const eventTypeLabels = {
  TERM_START: 'Term Start',
  TERM_END: 'Term End',
  HOLIDAY: 'Holiday',
  EXAM: 'Examination',
  EVENT: 'School Event',
  VACATION: 'Vacation'
};

const AcademicCalendarPage: React.FC = () => {
  const [calendar, setCalendar] = useState<AcademicCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'EVENT' as AcademicEvent['type'],
    startDate: '',
    endDate: '',
    isRecurring: false
  });

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await mockAPI.getAcademicCalendar();
      setCalendar(data);
    } catch (error) {
      console.error('Failed to load calendar:', error);
      toast.error('Failed to load academic calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async (wizardData: {
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
  }) => {
    try {
      const events = wizardData.quickEvents.map(event => ({
        ...event,
        id: Date.now().toString() + Math.random().toString(),
        description: '',
        isRecurring: false,
        color: eventTypeColors[event.type as keyof typeof eventTypeColors]
      }));

      const newCalendar = await mockAPI.createAcademicCalendar({
        ...wizardData,
        events
      });
      
      setCalendar(newCalendar);
      setShowCreateWizard(false);
      toast.success('Academic calendar created successfully');
    } catch (error) {
      console.error('Failed to create calendar:', error);
      toast.error('Failed to create academic calendar');
    }
  };

  const handleFinalizeCalendar = async () => {
    if (!calendar) return;

    try {
      const updatedCalendar = await mockAPI.finalizeCalendar(calendar.id);
      setCalendar(updatedCalendar);
      setShowFinalizeDialog(false);
      toast.success('Academic calendar finalized successfully');
    } catch (error) {
      console.error('Failed to finalize calendar:', error);
      toast.error('Failed to finalize academic calendar');
    }
  };

  const handleDeleteCalendar = async () => {
    if (!calendar) return;

    try {
      await mockAPI.deleteCalendar(calendar.id);
      setCalendar(null);
      setShowDeleteDialog(false);
      toast.success('Academic calendar deleted successfully');
    } catch (error) {
      console.error('Failed to delete calendar:', error);
      toast.error('Failed to delete academic calendar');
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      type: 'EVENT',
      startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      endDate: '',
      isRecurring: false
    });
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: AcademicEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate || '',
      isRecurring: event.isRecurring
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!calendar) return;

    try {
      if (!eventForm.title || !eventForm.startDate) {
        toast.error('Please fill all required fields');
        return;
      }

      const eventData = {
        ...eventForm,
        color: eventTypeColors[eventForm.type]
      };

      if (editingEvent) {
        await mockAPI.updateEvent(calendar.id, editingEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await mockAPI.addEvent(calendar.id, eventData);
        toast.success('Event added successfully');
      }

      loadCalendar();
      setShowEventDialog(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!calendar) return;

    try {
      await mockAPI.deleteEvent(calendar.id, eventId);
      loadCalendar();
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handlePrintCalendar = () => {
    // Add print classes to the body for better print styling
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Remove print classes after printing
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading academic calendar...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!calendar) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Academic Calendar</h1>
              <p className="text-muted-foreground">Manage your school's academic calendar and events</p>
            </div>
          </div>

          {/* No Calendar State */}
          <Card className="text-center py-12">
            <CardContent>
              <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Academic Calendar Found</h3>
              <p className="text-muted-foreground mb-6">
                Create your first academic calendar to start managing school events and important dates.
              </p>
              <Button onClick={() => setShowCreateWizard(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Academic Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Create Calendar Wizard */}
          {showCreateWizard && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <CalendarCreationWizard
                onComplete={handleCreateCalendar}
                onCancel={() => setShowCreateWizard(false)}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print-container">
        {/* Header */}
        <div className="flex items-center justify-between print-header">
          <div>
            <h1 className="text-2xl font-bold text-foreground print-title">Academic Calendar</h1>
            <p className="text-muted-foreground print-subtitle">
              {calendar.name} - {calendar.academicYear}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Badge 
              variant={calendar.status === 'FINALIZED' ? 'default' : 'secondary'}
              className="gap-1"
            >
              {calendar.status === 'FINALIZED' ? (
                <Check className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
              {calendar.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          <Button onClick={handleAddEvent} className="gap-2" disabled={calendar.status === 'FINALIZED'}>
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
          
          {calendar.status === 'DRAFT' && (
            <Button 
              onClick={() => setShowFinalizeDialog(true)} 
              variant="outline" 
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Finalize Calendar
            </Button>
          )}
          
          <Button onClick={handlePrintCalendar} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          
          <Button 
            onClick={() => setShowDeleteDialog(true)} 
            variant="destructive" 
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Calendar
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date && calendar.status === 'DRAFT') {
                      // Quick add event on double click
                      const now = Date.now();
                      const lastClick = (window as any).lastCalendarClick || 0;
                      if (now - lastClick < 300) {
                        handleAddEvent();
                      }
                      (window as any).lastCalendarClick = now;
                    }
                  }}
                  className="rounded-md border w-full"
                />
                {calendar.status === 'DRAFT' && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    💡 Double-click on a date to quickly add an event
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Academic Events ({calendar.events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calendar.events.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No events added yet</p>
                    <Button 
                      onClick={handleAddEvent} 
                      variant="outline" 
                      className="mt-4 gap-2"
                      disabled={calendar.status === 'FINALIZED'}
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Event
                    </Button>
                  </div>
                ) : (
                  <Table className="print-events-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        {calendar.status === 'DRAFT' && <TableHead className="no-print">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calendar.events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              style={{ backgroundColor: event.color, color: 'white' }}
                              className="text-xs print-badge"
                            >
                              {eventTypeLabels[event.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(event.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {event.endDate ? new Date(event.endDate).toLocaleDateString() : '-'}
                          </TableCell>
                          {calendar.status === 'DRAFT' && (
                            <TableCell className="no-print">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar Info Sidebar */}
          <div className="space-y-6 no-print">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Academic Year</Label>
                  <p className="text-sm text-muted-foreground">{calendar.academicYear}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Period</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(calendar.startDate).toLocaleDateString()} - {new Date(calendar.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {calendar.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Events</Label>
                  <p className="text-sm text-muted-foreground">{calendar.events.length}</p>
                </div>
                {calendar.finalizedAt && (
                  <div>
                    <Label className="text-sm font-medium">Finalized On</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(calendar.finalizedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(eventTypeLabels).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: eventTypeColors[type as keyof typeof eventTypeColors] }}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the event details.' : 'Add a new event to the academic calendar.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="e.g., Mid-term Examinations"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Description</Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Additional details about the event..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select
                  value={eventForm.type}
                  onValueChange={(value) => setEventForm({ ...eventForm, type: value as AcademicEvent['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: eventTypeColors[value as keyof typeof eventTypeColors] }}
                          />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventStartDate">Start Date *</Label>
                  <Input
                    id="eventStartDate"
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventEndDate">End Date</Label>
                  <Input
                    id="eventEndDate"
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Finalize Confirmation Dialog */}
        <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalize Academic Calendar?</AlertDialogTitle>
              <AlertDialogDescription>
                Once finalized, you won't be able to add, edit, or delete events. 
                Are you sure you want to finalize this calendar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinalizeCalendar}>
                Yes, Finalize
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Academic Calendar?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the calendar 
                and all associated events.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCalendar} className="bg-destructive text-destructive-foreground">
                Delete Calendar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AcademicCalendarPage;
