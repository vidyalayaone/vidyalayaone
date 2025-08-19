// Multiple student admission matrix form

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Users,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { admissionAPI, mockFormData } from '@/api/mockAdmissionAPI';

interface MultipleStudentData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  fatherName: string;
  motherName: string;
  phoneNumber: string;
  email: string;
  grade: string;
  section: string;
  address: string;
  bloodGroup: string;
}

const createEmptyStudent = (): MultipleStudentData => ({
  id: `student-${Date.now()}-${Math.random()}`,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  fatherName: '',
  motherName: '',
  phoneNumber: '',
  email: '',
  grade: '',
  section: '',
  address: '',
  bloodGroup: '',
});

const MultipleStudentAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<MultipleStudentData[]>([
    createEmptyStudent(),
    createEmptyStudent(),
    createEmptyStudent(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate('/admission');
  };

  const addStudent = () => {
    setStudents(prev => [...prev, createEmptyStudent()]);
  };

  const removeStudent = (id: string) => {
    if (students.length <= 1) {
      toast.error('At least one student is required');
      return;
    }
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const updateStudent = (id: string, field: keyof MultipleStudentData, value: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, [field]: value } : student
    ));
  };

  const duplicateStudent = (id: string) => {
    const studentToDuplicate = students.find(s => s.id === id);
    if (studentToDuplicate) {
      const newStudent = { 
        ...studentToDuplicate, 
        id: `student-${Date.now()}-${Math.random()}`,
        firstName: '',
        lastName: ''
      };
      const index = students.findIndex(s => s.id === id);
      setStudents(prev => [
        ...prev.slice(0, index + 1),
        newStudent,
        ...prev.slice(index + 1)
      ]);
    }
  };

  const validateStudents = (): boolean => {
    for (const student of students) {
      if (!student.firstName || !student.lastName || !student.dateOfBirth || 
          !student.gender || !student.fatherName || !student.motherName || 
          !student.phoneNumber || !student.grade || !student.section) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStudents()) {
      toast.error('Please fill in all required fields for all students');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out students with empty gender and cast to proper type
      const validStudents = students
        .filter(s => s.gender !== '')
        .map(s => ({ ...s, gender: s.gender as 'MALE' | 'FEMALE' | 'OTHER' }));
      
      const result = await admissionAPI.admitMultipleStudents(validStudents);
      
      if (result.success) {
        toast.success(result.message);
        navigate('/admission');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportTemplate = () => {
    admissionAPI.downloadTemplate();
    toast.success('Template exported! Check your downloads folder.');
  };

  const getCompletionStatus = (student: MultipleStudentData) => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'fatherName', 'motherName', 'phoneNumber', 'grade', 'section'];
    const completedFields = requiredFields.filter(field => student[field as keyof MultipleStudentData]).length;
    return `${completedFields}/${requiredFields.length}`;
  };

  const getCompletionColor = (student: MultipleStudentData) => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'fatherName', 'motherName', 'phoneNumber', 'grade', 'section'];
    const completedFields = requiredFields.filter(field => student[field as keyof MultipleStudentData]).length;
    const percentage = (completedFields / requiredFields.length) * 100;
    
    if (percentage === 100) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admission
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Multiple Student Admission</h1>
              <p className="text-muted-foreground">
                Add multiple students efficiently using a matrix form
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Export Template
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => getCompletionStatus(s) === '9/9').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {students.filter(s => {
                      const status = getCompletionStatus(s);
                      return status !== '9/9' && status !== '0/9';
                    }).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {students.filter(s => getCompletionStatus(s) === '0/9').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Matrix */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Information Matrix</CardTitle>
              <Button onClick={addStudent} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[120px]">First Name *</TableHead>
                    <TableHead className="min-w-[120px]">Last Name *</TableHead>
                    <TableHead className="min-w-[120px]">Date of Birth *</TableHead>
                    <TableHead className="min-w-[100px]">Gender *</TableHead>
                    <TableHead className="min-w-[120px]">Father's Name *</TableHead>
                    <TableHead className="min-w-[120px]">Mother's Name *</TableHead>
                    <TableHead className="min-w-[120px]">Phone Number *</TableHead>
                    <TableHead className="min-w-[150px]">Email</TableHead>
                    <TableHead className="min-w-[80px]">Grade *</TableHead>
                    <TableHead className="min-w-[80px]">Section *</TableHead>
                    <TableHead className="min-w-[150px]">Address</TableHead>
                    <TableHead className="min-w-[100px]">Blood Group</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="First name"
                          value={student.firstName}
                          onChange={(e) => updateStudent(student.id, 'firstName', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="Last name"
                          value={student.lastName}
                          onChange={(e) => updateStudent(student.id, 'lastName', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          type="date"
                          value={student.dateOfBirth}
                          onChange={(e) => updateStudent(student.id, 'dateOfBirth', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Select value={student.gender} onValueChange={(value) => updateStudent(student.id, 'gender', value)}>
                          <SelectTrigger className="min-w-[100px]">
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockFormData.genders.map((gender) => (
                              <SelectItem key={gender.value} value={gender.value}>
                                {gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="Father's name"
                          value={student.fatherName}
                          onChange={(e) => updateStudent(student.id, 'fatherName', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="Mother's name"
                          value={student.motherName}
                          onChange={(e) => updateStudent(student.id, 'motherName', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="Phone number"
                          value={student.phoneNumber}
                          onChange={(e) => updateStudent(student.id, 'phoneNumber', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          type="email"
                          placeholder="Email (optional)"
                          value={student.email}
                          onChange={(e) => updateStudent(student.id, 'email', e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Select value={student.grade} onValueChange={(value) => updateStudent(student.id, 'grade', value)}>
                          <SelectTrigger className="min-w-[80px]">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockFormData.grades.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Select value={student.section} onValueChange={(value) => updateStudent(student.id, 'section', value)}>
                          <SelectTrigger className="min-w-[80px]">
                            <SelectValue placeholder="Section" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockFormData.sections.map((section) => (
                              <SelectItem key={section} value={section}>
                                {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Input
                          placeholder="Address (optional)"
                          value={student.address}
                          onChange={(e) => updateStudent(student.id, 'address', e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Select value={student.bloodGroup} onValueChange={(value) => updateStudent(student.id, 'bloodGroup', value)}>
                          <SelectTrigger className="min-w-[100px]">
                            <SelectValue placeholder="Blood Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockFormData.bloodGroups.map((bg) => (
                              <SelectItem key={bg} value={bg}>
                                {bg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getCompletionColor(student)}>
                          {getCompletionStatus(student)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateStudent(student.id)}
                            title="Duplicate student"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(student.id)}
                            disabled={students.length <= 1}
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Efficient Data Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Keyboard Shortcuts:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Tab: Move to next field</li>
                  <li>• Shift + Tab: Move to previous field</li>
                  <li>• Enter: Move to next row (same column)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Pro Tips:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use the duplicate button for siblings</li>
                  <li>• Fill common fields first (grade, section)</li>
                  <li>• Export template for reference</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Admitting Students...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Admit All Students ({students.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MultipleStudentAdmissionPage;
