import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  UserPlus,
  CheckCircle,
  Calendar,
  User,
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { useToast } from '@/hooks/use-toast';

// Types
interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  email: string;
  phone: string;
  profileImage?: string;
  isAvailable: boolean;
}

interface ClassOption {
  id: string;
  name: string;
  sections: SectionOption[];
}

interface SectionOption {
  id: string;
  name: string;
  defaultTeacher: string;
}

interface SubstituteAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  date: string;
  assignedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Mrs. Sarah Johnson',
    employeeId: 'EMP001',
    subject: 'Mathematics',
    email: 'sarah.johnson@school.edu',
    phone: '+1 (555) 123-4567',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Mr. David Smith',
    employeeId: 'EMP002',
    subject: 'English',
    email: 'david.smith@school.edu',
    phone: '+1 (555) 234-5678',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Ms. Emily Davis',
    employeeId: 'EMP003',
    subject: 'Science',
    email: 'emily.davis@school.edu',
    phone: '+1 (555) 345-6789',
    isAvailable: false
  },
  {
    id: '4',
    name: 'Mr. Michael Brown',
    employeeId: 'EMP004',
    subject: 'History',
    email: 'michael.brown@school.edu',
    phone: '+1 (555) 456-7890',
    isAvailable: true
  },
  {
    id: '5',
    name: 'Mrs. Lisa Anderson',
    employeeId: 'EMP005',
    subject: 'Physical Education',
    email: 'lisa.anderson@school.edu',
    phone: '+1 (555) 567-8901',
    isAvailable: true
  },
  {
    id: '6',
    name: 'Dr. Robert Wilson',
    employeeId: 'EMP006',
    subject: 'Chemistry',
    email: 'robert.wilson@school.edu',
    phone: '+1 (555) 678-9012',
    isAvailable: true
  },
];

const mockClasses: ClassOption[] = [
  {
    id: '9',
    name: 'Grade 9',
    sections: [
      { id: '9-A', name: 'A', defaultTeacher: 'Mrs. Johnson' },
      { id: '9-B', name: 'B', defaultTeacher: 'Mr. Smith' },
    ]
  },
  {
    id: '10',
    name: 'Grade 10',
    sections: [
      { id: '10-A', name: 'A', defaultTeacher: 'Ms. Davis' },
      { id: '10-B', name: 'B', defaultTeacher: 'Mr. Brown' },
    ]
  },
  {
    id: '11',
    name: 'Grade 11',
    sections: [
      { id: '11-default', name: 'Default', defaultTeacher: 'Mrs. Anderson' },
    ]
  },
];

const mockAssignments: SubstituteAssignment[] = [
  {
    id: '1',
    teacherId: '1',
    teacherName: 'Mrs. Sarah Johnson',
    classId: '10',
    className: 'Grade 10',
    sectionId: '10-A',
    sectionName: 'A',
    date: '2025-08-19',
    assignedBy: 'Admin',
    status: 'ACTIVE'
  },
  {
    id: '2',
    teacherId: '2',
    teacherName: 'Mr. David Smith',
    classId: '9',
    className: 'Grade 9',
    sectionId: '9-B',
    sectionName: 'B',
    date: '2025-08-19',
    assignedBy: 'Admin',
    status: 'ACTIVE'
  },
];

interface AssignSubstituteTeacherProps {
  onBack: () => void;
}

const AssignSubstituteTeacher: React.FC<AssignSubstituteTeacherProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [assignmentDate, setAssignmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignments, setAssignments] = useState<SubstituteAssignment[]>(mockAssignments);
  
  const { toast } = useToast();

  // Filter teachers based on search term and availability
  const filteredTeachers = useMemo(() => {
    return mockTeachers.filter(teacher => 
      teacher.isAvailable && (
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Get available sections for selected class
  const availableSections = useMemo(() => {
    const classData = mockClasses.find(c => c.id === selectedClass);
    return classData?.sections || [];
  }, [selectedClass]);

  // Get selected section details
  const selectedSectionDetails = useMemo(() => {
    return availableSections.find(s => s.id === selectedSection);
  }, [availableSections, selectedSection]);

  const handleAssignTeacher = () => {
    if (!selectedTeacher || !selectedClass || !selectedSection) return;

    const newAssignment: SubstituteAssignment = {
      id: `${Date.now()}`,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      classId: selectedClass,
      className: mockClasses.find(c => c.id === selectedClass)?.name || '',
      sectionId: selectedSection,
      sectionName: availableSections.find(s => s.id === selectedSection)?.name || '',
      date: assignmentDate,
      assignedBy: 'Admin',
      status: 'ACTIVE'
    };

    setAssignments(prev => [...prev, newAssignment]);
    setShowAssignDialog(false);
    setSelectedTeacher(null);
    setSelectedClass('');
    setSelectedSection('');
    
    toast({
      title: 'Assignment Successful',
      description: `${selectedTeacher.name} has been assigned to take attendance for ${newAssignment.className}-${newAssignment.sectionName}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="border-blue-300 text-blue-800">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Substitute Teacher</h1>
          <p className="text-muted-foreground">
            Assign substitute teachers to take attendance when regular teachers are absent
          </p>
        </div>
      </div>

      {/* Current Assignments */}
      {assignments.filter(a => a.status === 'ACTIVE').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Active Assignments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current substitute teacher assignments for today
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments
                .filter(a => a.status === 'ACTIVE' && a.date === new Date().toISOString().split('T')[0])
                .map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{assignment.teacherName}</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned to {assignment.className}-{assignment.sectionName}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Teachers */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, employee ID, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Available Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Teachers ({filteredTeachers.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on a teacher to assign them as substitute
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <Card 
                key={teacher.id} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setShowAssignDialog(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={teacher.profileImage} />
                      <AvatarFallback>
                        {teacher.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{teacher.name}</p>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{teacher.employeeId}</p>
                      <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No available teachers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Substitute Teacher</DialogTitle>
            <DialogDescription>
              Assign {selectedTeacher?.name} to take attendance for a specific class and section.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-4">
              {/* Teacher Info */}
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedTeacher.profileImage} />
                  <AvatarFallback>
                    {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedTeacher.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTeacher.subject}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{selectedTeacher.email}</span>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Class</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClasses.map(classOption => (
                          <SelectItem key={classOption.id} value={classOption.id}>
                            {classOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Section</label>
                    <Select 
                      value={selectedSection} 
                      onValueChange={setSelectedSection}
                      disabled={!selectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map(section => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedSectionDetails && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Regular teacher: {selectedSectionDetails.defaultTeacher}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTeacher}
              disabled={!selectedClass || !selectedSection}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignSubstituteTeacher;
