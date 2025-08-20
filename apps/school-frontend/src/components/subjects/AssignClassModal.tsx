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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Filter,
  GraduationCap,
  Users,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
  X,
} from 'lucide-react';

// Interfaces
interface Subject {
  id: string;
  name: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  stream?: string;
  studentsCount: number;
  subjectsCount: number;
  isAssigned: boolean;
}

interface AuditLog {
  id: string;
  message: string;
  date: string;
  type: 'assigned' | 'removed';
}

interface AssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onAssignClasses: (classIds: string[]) => void;
  onRemoveClasses: (classIds: string[]) => void;
}

// Mock Data
const mockClasses: ClassInfo[] = [
  {
    id: 'class-1',
    name: 'Grade 9-A',
    grade: '9',
    section: 'A',
    stream: 'Science',
    studentsCount: 45,
    subjectsCount: 8,
    isAssigned: true,
  },
  {
    id: 'class-2',
    name: 'Grade 9-B',
    grade: '9',
    section: 'B',
    stream: 'Science',
    studentsCount: 42,
    subjectsCount: 9,
    isAssigned: false,
  },
  {
    id: 'class-3',
    name: 'Grade 10-A',
    grade: '10',
    section: 'A',
    stream: 'Science',
    studentsCount: 38,
    subjectsCount: 12,
    isAssigned: true,
  },
  {
    id: 'class-4',
    name: 'Grade 10-B',
    grade: '10',
    section: 'B',
    stream: 'Science',
    studentsCount: 40,
    subjectsCount: 11,
    isAssigned: false,
  },
  {
    id: 'class-5',
    name: 'Grade 11-A',
    grade: '11',
    section: 'A',
    stream: 'Science',
    studentsCount: 35,
    subjectsCount: 15,
    isAssigned: false,
  },
  {
    id: 'class-6',
    name: 'Grade 11-B',
    grade: '11',
    section: 'B',
    stream: 'Commerce',
    studentsCount: 37,
    subjectsCount: 13,
    isAssigned: true,
  },
  {
    id: 'class-7',
    name: 'Grade 12-A',
    grade: '12',
    section: 'A',
    stream: 'Science',
    studentsCount: 33,
    subjectsCount: 16,
    isAssigned: false,
  },
  {
    id: 'class-8',
    name: 'Grade 12-B',
    grade: '12',
    section: 'B',
    stream: 'Arts',
    studentsCount: 31,
    subjectsCount: 14,
    isAssigned: false,
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    message: 'Admin assigned Class IX-A to Mathematics on Aug 20, 2025',
    date: '2025-08-20T10:30:00Z',
    type: 'assigned',
  },
  {
    id: 'audit-2',
    message: 'Admin removed Class IX-B from Physics on Aug 19, 2025',
    date: '2025-08-19T14:15:00Z',
    type: 'removed',
  },
  {
    id: 'audit-3',
    message: 'Admin assigned Class X-A to Chemistry on Aug 19, 2025',
    date: '2025-08-19T11:45:00Z',
    type: 'assigned',
  },
  {
    id: 'audit-4',
    message: 'Admin assigned Class XI-A to Biology on Aug 18, 2025',
    date: '2025-08-18T16:20:00Z',
    type: 'assigned',
  },
  {
    id: 'audit-5',
    message: 'Admin removed Class XII-B from History on Aug 18, 2025',
    date: '2025-08-18T09:10:00Z',
    type: 'removed',
  },
];

const WORKLOAD_THRESHOLD = 12;

const AssignClassModal: React.FC<AssignClassModalProps> = ({
  isOpen,
  onClose,
  subject,
  onAssignClasses,
  onRemoveClasses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Filtered classes based on search and filters
  const filteredClasses = useMemo(() => {
    return mockClasses.filter((classInfo) => {
      const matchesSearch =
        classInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classInfo.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classInfo.stream?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = selectedGrade === 'all' || classInfo.grade === selectedGrade;
      const matchesStream = selectedStream === 'all' || classInfo.stream === selectedStream;
      const matchesSection = selectedSection === 'all' || classInfo.section === selectedSection;

      return matchesSearch && matchesGrade && matchesStream && matchesSection;
    });
  }, [searchTerm, selectedGrade, selectedStream, selectedSection]);

  const handleClassSelect = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses((prev) => [...prev, classId]);
    } else {
      setSelectedClasses((prev) => prev.filter((id) => id !== classId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClasses(filteredClasses.map((c) => c.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleAssignClasses = () => {
    const classesToAssign = selectedClasses.filter((id) => {
      const classInfo = mockClasses.find((c) => c.id === id);
      return classInfo && !classInfo.isAssigned;
    });
    
    if (classesToAssign.length > 0) {
      onAssignClasses(classesToAssign);
    }
    handleReset();
  };

  const handleRemoveClasses = () => {
    const classesToRemove = selectedClasses.filter((id) => {
      const classInfo = mockClasses.find((c) => c.id === id);
      return classInfo && classInfo.isAssigned;
    });
    
    if (classesToRemove.length > 0) {
      onRemoveClasses(classesToRemove);
    }
    handleReset();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedGrade('all');
    setSelectedStream('all');
    setSelectedSection('all');
    setSelectedClasses([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const getWorkloadBadge = (subjectsCount: number) => {
    if (subjectsCount > WORKLOAD_THRESHOLD) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          High ({subjectsCount})
        </Badge>
      );
    } else if (subjectsCount > WORKLOAD_THRESHOLD - 3) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Medium ({subjectsCount})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          Normal ({subjectsCount})
        </Badge>
      );
    }
  };

  const getStatusBadge = (isAssigned: boolean) => {
    return isAssigned ? (
      <Badge variant="default">Assigned</Badge>
    ) : (
      <Badge variant="outline">Available</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const assignedClasses = filteredClasses.filter((c) => selectedClasses.includes(c.id) && c.isAssigned);
  const unassignedClasses = filteredClasses.filter((c) => selectedClasses.includes(c.id) && !c.isAssigned);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">Assign Classes</div>
                <div className="text-sm text-gray-500 font-normal">
                  {subject ? `Subject: ${subject.name}` : 'No subject selected'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuditTrail(!showAuditTrail)}
            >
              <Clock className="h-4 w-4 mr-2" />
              {showAuditTrail ? 'Hide' : 'Show'} Audit Trail
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search classes by name, section, or stream..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStream} onValueChange={setSelectedStream}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Streams</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            {selectedClasses.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        Selected: {selectedClasses.length} classes
                      </span>
                      {unassignedClasses.length > 0 && (
                        <Badge variant="default">
                          {unassignedClasses.length} to assign
                        </Badge>
                      )}
                      {assignedClasses.length > 0 && (
                        <Badge variant="secondary">
                          {assignedClasses.length} to remove
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClasses([])}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Classes Table */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Classes ({filteredClasses.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        filteredClasses.length > 0 &&
                        selectedClasses.length === filteredClasses.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">Select All</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="border-t">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Workload</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((classInfo) => (
                        <TableRow key={classInfo.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedClasses.includes(classInfo.id)}
                              onCheckedChange={(checked) =>
                                handleClassSelect(classInfo.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium">{classInfo.name}</div>
                                <div className="text-sm text-gray-500">
                                  Grade {classInfo.grade}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{classInfo.section}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{classInfo.stream}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{classInfo.studentsCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getWorkloadBadge(classInfo.subjectsCount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(classInfo.isAssigned)}
                          </TableCell>
                          <TableCell>
                            {classInfo.isAssigned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleClassSelect(classInfo.id, !selectedClasses.includes(classInfo.id))
                                }
                              >
                                <Minus className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleClassSelect(classInfo.id, !selectedClasses.includes(classInfo.id))
                                }
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Trail Panel */}
          {showAuditTrail && (
            <Card className="w-80 flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2 p-4">
                    {mockAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 border rounded-lg text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              log.type === 'assigned'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-gray-900">{log.message}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {formatDate(log.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-white">
          <div className="text-sm text-gray-500">
            {selectedClasses.length > 0 && (
              <>
                {unassignedClasses.length > 0 && (
                  <span className="mr-4">
                    {unassignedClasses.length} class(es) will be assigned
                  </span>
                )}
                {assignedClasses.length > 0 && (
                  <span>
                    {assignedClasses.length} class(es) will be removed
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {unassignedClasses.length > 0 && (
              <Button onClick={handleAssignClasses}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Classes ({unassignedClasses.length})
              </Button>
            )}
            {assignedClasses.length > 0 && (
              <Button variant="destructive" onClick={handleRemoveClasses}>
                <Minus className="h-4 w-4 mr-2" />
                Remove Classes ({assignedClasses.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignClassModal;
