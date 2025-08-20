import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  User, 
  AlertTriangle, 
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle,
  X,
  UserPlus
} from 'lucide-react';

// Enhanced Teacher interface for assignment modal
interface TeacherForAssignment {
  id: string;
  name: string;
  email: string;
  department: string;
  qualification: string;
  experience: number;
  subjectsCount: number;
  classesCount: number;
  totalLoad: number;
  isOverloaded: boolean;
  currentSubjects: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onAssignTeachers: (teacherIds: string[]) => void;
}

// Mock data for teachers with detailed load information
const mockTeachersForAssignment: TeacherForAssignment[] = [
  {
    id: 'teacher-1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    department: 'Mathematics',
    qualification: 'Ph.D. Mathematics',
    experience: 8,
    subjectsCount: 3,
    classesCount: 5,
    totalLoad: 8,
    isOverloaded: false,
    currentSubjects: ['Algebra', 'Geometry', 'Statistics'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-2',
    name: 'Prof. Michael Brown',
    email: 'michael.brown@school.edu',
    department: 'English',
    qualification: 'M.A. English Literature',
    experience: 12,
    subjectsCount: 4,
    classesCount: 6,
    totalLoad: 10,
    isOverloaded: false,
    currentSubjects: ['English Literature', 'Creative Writing', 'Grammar', 'Public Speaking'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@school.edu',
    department: 'Science',
    qualification: 'Ph.D. Physics',
    experience: 6,
    subjectsCount: 6,
    classesCount: 8,
    totalLoad: 14,
    isOverloaded: true,
    currentSubjects: ['Physics', 'Advanced Physics', 'Mechanics', 'Thermodynamics', 'Electronics', 'Lab Work'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-4',
    name: 'Ms. Jennifer Wilson',
    email: 'jennifer.wilson@school.edu',
    department: 'Science',
    qualification: 'M.Sc. Chemistry',
    experience: 5,
    subjectsCount: 2,
    classesCount: 3,
    totalLoad: 5,
    isOverloaded: false,
    currentSubjects: ['Organic Chemistry', 'Inorganic Chemistry'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-5',
    name: 'Mr. David Thompson',
    email: 'david.thompson@school.edu',
    department: 'Social Studies',
    qualification: 'M.A. History',
    experience: 10,
    subjectsCount: 3,
    classesCount: 4,
    totalLoad: 7,
    isOverloaded: false,
    currentSubjects: ['World History', 'Indian History', 'Civics'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-6',
    name: 'Dr. Lisa Anderson',
    email: 'lisa.anderson@school.edu',
    department: 'Mathematics',
    qualification: 'Ph.D. Applied Mathematics',
    experience: 4,
    subjectsCount: 2,
    classesCount: 2,
    totalLoad: 4,
    isOverloaded: false,
    currentSubjects: ['Calculus', 'Applied Mathematics'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-7',
    name: 'Mr. Robert Garcia',
    email: 'robert.garcia@school.edu',
    department: 'Computer Science',
    qualification: 'M.Tech Computer Science',
    experience: 7,
    subjectsCount: 5,
    classesCount: 7,
    totalLoad: 12,
    isOverloaded: true,
    currentSubjects: ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Web Development'],
    status: 'ACTIVE'
  },
  {
    id: 'teacher-8',
    name: 'Ms. Maria Rodriguez',
    email: 'maria.rodriguez@school.edu',
    department: 'English',
    qualification: 'M.A. English',
    experience: 3,
    subjectsCount: 1,
    classesCount: 2,
    totalLoad: 3,
    isOverloaded: false,
    currentSubjects: ['English Grammar'],
    status: 'ACTIVE'
  }
];

const departments = ['All', 'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science'];

const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  isOpen,
  onClose,
  subject,
  onAssignTeachers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showTeacherProfile, setShowTeacherProfile] = useState(false);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<TeacherForAssignment | null>(null);

  // Filter teachers based on search and department
  const filteredTeachers = useMemo(() => {
    return mockTeachersForAssignment.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'All' || teacher.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment && teacher.status === 'ACTIVE';
    });
  }, [searchTerm, selectedDepartment]);

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(teacher => teacher.id));
    }
  };

  const handleConfirmAssignment = () => {
    onAssignTeachers(selectedTeachers);
    setSelectedTeachers([]);
    setSearchTerm('');
    setSelectedDepartment('All');
    onClose();
  };

  const handleCancel = () => {
    setSelectedTeachers([]);
    setSearchTerm('');
    setSelectedDepartment('All');
    onClose();
  };

  const handleTeacherNameClick = (teacher: TeacherForAssignment) => {
    setSelectedTeacherForProfile(teacher);
    setShowTeacherProfile(true);
  };

  const getLoadBadge = (teacher: TeacherForAssignment) => {
    if (teacher.isOverloaded) {
      return <Badge variant="destructive" className="text-xs">Overloaded</Badge>;
    } else if (teacher.totalLoad >= 8) {
      return <Badge variant="secondary" className="text-xs">High Load</Badge>;
    } else if (teacher.totalLoad >= 5) {
      return <Badge variant="outline" className="text-xs">Medium Load</Badge>;
    } else {
      return <Badge variant="default" className="text-xs">Available</Badge>;
    }
  };

  const getLoadColor = (teacher: TeacherForAssignment) => {
    if (teacher.isOverloaded) return 'text-red-600';
    if (teacher.totalLoad >= 8) return 'text-yellow-600';
    if (teacher.totalLoad >= 5) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">Assign Teachers</div>
                <div className="text-sm text-gray-500 font-normal">
                  {subject ? `Subject: ${subject.name} (${subject.code})` : 'Select teachers to assign'}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 p-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search teachers by name, email, or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selection Summary */}
            {selectedTeachers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeachers([])}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Selection
                  </Button>
                </div>
                {selectedTeachers.length > 1 && (
                  <p className="text-sm text-blue-700 mt-2">
                    Multiple teachers selected for co-teaching arrangement
                  </p>
                )}
              </div>
            )}

            {/* Teachers Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all teachers"
                      />
                    </TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Load</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className={selectedTeachers.includes(teacher.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTeachers.includes(teacher.id)}
                          onCheckedChange={() => handleTeacherSelect(teacher.id)}
                          aria-label={`Select ${teacher.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <button
                              className="font-medium text-blue-600 hover:text-blue-800 text-left"
                              onClick={() => handleTeacherNameClick(teacher)}
                            >
                              {teacher.name}
                            </button>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                            <div className="text-xs text-gray-400">{teacher.qualification}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {teacher.department}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {teacher.experience}y exp.
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className={`text-sm font-medium ${getLoadColor(teacher)}`}>
                              {teacher.subjectsCount} subjects
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span className={`text-sm font-medium ${getLoadColor(teacher)}`}>
                              {teacher.classesCount} classes
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Total load: {teacher.totalLoad}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLoadBadge(teacher)}
                          {teacher.isOverloaded && (
                            <AlertTriangle className="h-4 w-4 text-red-500" title="Teacher is overloaded" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={selectedTeachers.includes(teacher.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTeacherSelect(teacher.id)}
                          disabled={teacher.isOverloaded}
                        >
                          {selectedTeachers.includes(teacher.id) ? 'Selected' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No teachers found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} available • {selectedTeachers.length} selected
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssignment}
                disabled={selectedTeachers.length === 0}
              >
                Confirm Assignment ({selectedTeachers.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher Profile Modal */}
      <Dialog open={showTeacherProfile} onOpenChange={setShowTeacherProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              Teacher Profile
            </DialogTitle>
          </DialogHeader>

          {selectedTeacherForProfile && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacherForProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacherForProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacherForProfile.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Experience</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacherForProfile.experience} years</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Qualification</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTeacherForProfile.qualification}</p>
                </div>
              </div>

              {/* Current Load */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Teaching Load</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedTeacherForProfile.subjectsCount}</p>
                    <p className="text-sm text-gray-600">Subjects</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedTeacherForProfile.classesCount}</p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedTeacherForProfile.totalLoad}</p>
                    <p className="text-sm text-gray-600">Total Load</p>
                  </div>
                </div>
              </div>

              {/* Current Subjects */}
              <div>
                <label className="text-sm font-medium text-gray-600">Current Subjects</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTeacherForProfile.currentSubjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Load Status */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Load Status:</label>
                {getLoadBadge(selectedTeacherForProfile)}
                {selectedTeacherForProfile.isOverloaded && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">This teacher is currently overloaded</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowTeacherProfile(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  // Navigate to full teacher profile
                  setShowTeacherProfile(false);
                }}>
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssignTeacherModal;
