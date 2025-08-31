import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Loader2, User } from 'lucide-react';
import { api } from '@/api/api';
import { ProfileServiceTeacherDetail } from '@/api/types';
import toast from 'react-hot-toast';

interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  profileImage?: string;
  subjectNames?: string[];
}

interface AssignClassTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  currentTeacher: { id: string; name: string } | null;
  onAssignSuccess: (teacher: Teacher) => void;
}

const AssignClassTeacherDialog: React.FC<AssignClassTeacherDialogProps> = ({
  open,
  onOpenChange,
  sectionId,
  currentTeacher,
  onAssignSuccess,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Fetch teachers when dialog opens
  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

  // Filter teachers based on search
  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.getTeachersBySchool();
      if (response.success && response.data) {
        const formattedTeachers: Teacher[] = response.data.teachers.map((teacher: any) => ({
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          employeeId: teacher.employeeId,
          profileImage: teacher.profileImage,
          subjectNames: teacher.subjectNames || [],
        }));
        setTeachers(formattedTeachers);
      } else {
        toast.error('Failed to load teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    setAssigning(true);
    try {
      const response = await api.assignClassTeacher({
        sectionId,
        teacherId: selectedTeacher.id,
      });

      if (response.success) {
        toast.success(`${selectedTeacher.name} has been assigned as class teacher`);
        onAssignSuccess(selectedTeacher);
        onOpenChange(false);
        setSelectedTeacher(null);
        setSearchTerm('');
      } else {
        toast.error(response.message || 'Failed to assign class teacher');
      }
    } catch (error) {
      console.error('Error assigning class teacher:', error);
      toast.error('Failed to assign class teacher');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedTeacher(null);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Class Teacher</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Current teacher info */}
          {currentTeacher && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Current class teacher:</p>
              <p className="font-medium">{currentTeacher.name}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search teachers by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Teachers list */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading teachers...</span>
                </div>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
                <p className="text-muted-foreground">
                  {teachers.length === 0 
                    ? 'No teachers are available in your school.' 
                    : 'No teachers match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTeacher?.id === teacher.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    } ${
                      currentTeacher?.id === teacher.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    onClick={() => {
                      if (currentTeacher?.id !== teacher.id) {
                        setSelectedTeacher(teacher);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={teacher.profileImage} />
                        <AvatarFallback>
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{teacher.name}</h4>
                          {currentTeacher?.id === teacher.id && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-xs text-muted-foreground">ID: {teacher.employeeId}</p>
                        {teacher.subjectNames && teacher.subjectNames.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Subjects: {teacher.subjectNames.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignTeacher}
            disabled={!selectedTeacher || assigning || currentTeacher?.id === selectedTeacher?.id}
          >
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Teacher'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignClassTeacherDialog;
