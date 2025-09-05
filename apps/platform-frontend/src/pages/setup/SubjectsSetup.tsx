import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { schoolAPI } from '@/lib/api';
import { useSchoolStore } from '@/store/schoolStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, BookOpen, ArrowLeft, Plus, X } from 'lucide-react';

// Validation schema for subjects setup
const subjectsSetupSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)'),
});

type SubjectsSetupForm = z.infer<typeof subjectsSetupSchema>;

interface ClassWithSubjects {
  id: string;
  name: string;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface GlobalSubject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface ClassSubjectSelection {
  className: string;
  selectedSubjects: string[];
}

const SubjectsSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingGlobalSubjects, setIsLoadingGlobalSubjects] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolIdFromUrl = searchParams.get('schoolId');
  const { school, updateSetupProgress } = useSchoolStore();
  
  // Use schoolId from URL params or from store
  const schoolId = schoolIdFromUrl || school?.id;
  const [classes, setClasses] = useState<ClassWithSubjects[]>([]);
  const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([]);
  const [classSubjectSelections, setClassSubjectSelections] = useState<Record<string, string[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClassName, setCurrentClassName] = useState<string>('');
  const [tempSelectedSubjects, setTempSelectedSubjects] = useState<string[]>([]);

  const form = useForm<SubjectsSetupForm>({
    resolver: zodResolver(subjectsSetupSchema as any),
    defaultValues: {
      schoolId: schoolId || '',
      academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
    },
  });

  // Load existing classes and global subjects
  useEffect(() => {
    if (schoolId) {
      loadClassesAndSubjects();
    }
  }, [schoolId]);

  const loadClassesAndSubjects = async () => {
    try {
      setIsLoadingClasses(true);
      const academicYear = form.getValues('academicYear');
      
      // Load classes and their existing subjects
      const response = await schoolAPI.getClassesSections(schoolId!, academicYear);
      
      if (response.success) {
        const classesWithSubjects = response.data.classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          subjects: cls.subjects || []
        }));
        setClasses(classesWithSubjects);
        
        // Initialize selections with existing subjects
        const initialSelections: Record<string, string[]> = {};
        classesWithSubjects.forEach(cls => {
          initialSelections[cls.name] = cls.subjects.map(subject => subject.name);
        });
        setClassSubjectSelections(initialSelections);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classes. Please try again.",
        });
      }
    } catch (error: any) {
      console.error('Error loading classes:', error);
      
      const errorMessage = error.response?.data?.error?.message || 'Failed to load classes. Please try again.';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const loadGlobalSubjects = async () => {
    try {
      setIsLoadingGlobalSubjects(true);
      const response = await schoolAPI.getGlobalSubjects();
      
      if (response.success) {
        setGlobalSubjects(response.data.subjects);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load global subjects.",
        });
      }
    } catch (error: any) {
      console.error('Error loading global subjects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load global subjects. Please try again.",
      });
    } finally {
      setIsLoadingGlobalSubjects(false);
    }
  };

  const handleSubmit = async (data: SubjectsSetupForm) => {
    setIsLoading(true);
    try {
      // Validate that each class has at least one subject (either existing or newly selected)
      const classesWithoutSubjects = classes.filter(cls => {
        const hasExistingSubjects = cls.subjects.length > 0;
        const hasNewSubjects = classSubjectSelections[cls.name] && classSubjectSelections[cls.name].length > 0;
        return !hasExistingSubjects && !hasNewSubjects;
      });

      if (classesWithoutSubjects.length > 0) {
        toast({
          variant: "destructive",
          title: "Incomplete Subject Selection",
          description: `Please select at least one subject for: ${classesWithoutSubjects.map(cls => cls.name).join(', ')}`,
        });
        setIsLoading(false);
        return;
      }

      // Only send classes that have new subjects to add
      const classSubjects = Object.entries(classSubjectSelections)
        .filter(([className, subjectNames]) => {
          const cls = classes.find(c => c.name === className);
          const existingSubjectNames = cls?.subjects.map(s => s.name) || [];
          const newSubjects = subjectNames.filter(name => !existingSubjectNames.includes(name));
          return newSubjects.length > 0;
        })
        .map(([className, subjectNames]) => {
          const cls = classes.find(c => c.name === className);
          const existingSubjectNames = cls?.subjects.map(s => s.name) || [];
          const newSubjects = subjectNames.filter(name => !existingSubjectNames.includes(name));
          return {
            className,
            subjectNames: newSubjects
          };
        });

      // If no new subjects to add, just update the progress and navigate
      if (classSubjects.length === 0) {
        updateSetupProgress({ subjectsAdded: true });
        toast({
          title: "Subjects Configuration Complete!",
          description: "All classes already have subjects configured.",
        });
        navigate('/dashboard');
        setIsLoading(false);
        return;
      }

      await schoolAPI.createClassSubjects({
        schoolId: data.schoolId,
        academicYear: data.academicYear,
        classSubjects: classSubjects
      });

      // Update setup progress
      updateSetupProgress({ subjectsAdded: true });

      toast({
        title: "Subjects Added Successfully!",
        description: `Subjects have been configured for all classes.`,
      });

      // Navigate to next step or dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating class subjects:', error);
      
      const errorMessage = error.response?.data?.error?.message || 'Failed to add subjects. Please try again.';
      toast({
        variant: "destructive",
        title: "Error Adding Subjects",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openSubjectModal = (className: string) => {
    setCurrentClassName(className);
    setTempSelectedSubjects(classSubjectSelections[className] || []);
    setIsModalOpen(true);
    if (globalSubjects.length === 0) {
      loadGlobalSubjects();
    }
  };

  const handleSubjectToggle = (subjectName: string) => {
    setTempSelectedSubjects(prev => 
      prev.includes(subjectName)
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const saveSubjectSelection = () => {
    setClassSubjectSelections(prev => ({
      ...prev,
      [currentClassName]: tempSelectedSubjects
    }));
    setIsModalOpen(false);
    setCurrentClassName('');
    setTempSelectedSubjects([]);
  };

  const removeSubject = (className: string, subjectName: string) => {
    setClassSubjectSelections(prev => ({
      ...prev,
      [className]: prev[className].filter(name => name !== subjectName)
    }));
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">School ID is required to setup subjects.</p>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Subjects</h1>
          <p className="text-gray-600">Add subjects to each class in your school</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Subjects Configuration</CardTitle>
            <CardDescription>
              Select subjects for each class. You must choose at least one subject for every class to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                
                {isLoadingClasses ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {classes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No classes found. Please create classes first.</p>
                        <Button onClick={() => navigate('/setup/classes')} variant="outline">
                          Setup Classes
                        </Button>
                      </div>
                    ) : (
                      classes.map((cls) => (
                        <div key={cls.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{cls.name}</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openSubjectModal(cls.name)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Subjects
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {/* Show existing subjects */}
                            {cls.subjects.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-green-700 mb-2">Current Subjects:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {cls.subjects.map((subject) => (
                                    <Badge key={subject.id} variant="default" className="bg-green-100 text-green-800">
                                      {subject.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Show newly selected subjects (not yet saved) */}
                            {(() => {
                              const existingSubjectNames = cls.subjects.map(s => s.name);
                              const newSubjects = classSubjectSelections[cls.name]?.filter(
                                name => !existingSubjectNames.includes(name)
                              ) || [];
                              
                              return newSubjects.length > 0 ? (
                                <div>
                                  <h4 className="text-sm font-medium text-blue-700 mb-2">New Subjects to Add:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {newSubjects.map((subjectName) => (
                                      <div key={subjectName} className="flex items-center gap-1">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">{subjectName}</Badge>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeSubject(cls.name, subjectName)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            {/* Show message if no subjects */}
                            {cls.subjects.length === 0 && 
                             (!classSubjectSelections[cls.name] || classSubjectSelections[cls.name].length === 0) && (
                              <div className="text-center py-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">No subjects selected. Click "Add Subjects" to select subjects for this class.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || classes.length === 0}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Subjects Configuration
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Subject Selection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Subjects for {currentClassName}</DialogTitle>
              <DialogDescription>
                Choose the subjects that will be taught in {currentClassName}. You can select multiple subjects.
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingGlobalSubjects ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {globalSubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No global subjects found. Please contact your administrator.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {globalSubjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject.id}
                          checked={tempSelectedSubjects.includes(subject.name)}
                          onCheckedChange={() => handleSubjectToggle(subject.name)}
                        />
                        <label 
                          htmlFor={subject.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            {subject.description && (
                              <div className="text-xs text-gray-500">{subject.description}</div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                
                {tempSelectedSubjects.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Subjects ({tempSelectedSubjects.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {tempSelectedSubjects.map((subjectName) => (
                        <Badge key={subjectName} variant="secondary">
                          {subjectName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveSubjectSelection}
                disabled={tempSelectedSubjects.length === 0}
              >
                Save Selection ({tempSelectedSubjects.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubjectsSetup;
