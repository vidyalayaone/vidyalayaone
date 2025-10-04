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
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to load classes. Please try again.',
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
      
      toast({
        variant: "destructive",
        title: "Error Adding Subjects",
        description: error.message || 'Failed to add subjects. Please try again.',
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
      <div className="min-h-screen overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 shadow-large">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 backdrop-blur-sm rounded-2xl">
                  <BookOpen className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">School ID Required</h2>
                  <p className="text-muted-foreground mb-6">School ID is required to setup subjects.</p>
                </div>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="h-12 px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative container mx-auto px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-2xl">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Setup Subjects
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Add subjects to each class in your school. You must choose at least one subject for every class to proceed.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-large">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold">Class Subjects Configuration</CardTitle>
              <CardDescription className="text-lg">
                Select subjects for each class. You must choose at least one subject for every class to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
                  {/* Subjects Configuration */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Configure Subjects</h3>
                    </div>
                    
                    {isLoadingClasses ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {classes.length === 0 ? (
                          <div className="text-center py-12 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/50">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/50 backdrop-blur-sm rounded-2xl mb-4">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h4 className="text-xl font-bold text-foreground mb-2">No Classes Found</h4>
                            <p className="text-muted-foreground mb-6">Please create classes first before setting up subjects.</p>
                            <Button onClick={() => navigate('/setup/classes')} variant="outline" className="h-12 px-6">
                              Setup Classes
                            </Button>
                          </div>
                        ) : (
                          classes.map((cls) => (
                            <div key={cls.id} className="border border-border/50 rounded-xl p-6 bg-card/30 backdrop-blur-sm">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-xl text-foreground">{cls.name}</h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openSubjectModal(cls.name)}
                                  className="h-10 px-4"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Subjects
                                </Button>
                              </div>

                              <div className="space-y-6">
                                {/* Show existing subjects */}
                                {cls.subjects.length > 0 && (
                                  <div>
                                    <h5 className="text-base font-semibold text-foreground mb-3">Current Subjects:</h5>
                                    <div className="flex flex-wrap gap-3">
                                      {cls.subjects.map((subject) => (
                                        <Badge key={subject.id} variant="default" className="px-3 py-2 text-sm font-medium bg-green-100 text-green-800 border-green-200">
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
                                      <h5 className="text-base font-semibold text-foreground mb-3">New Subjects to Add:</h5>
                                      <div className="space-y-3">
                                        {newSubjects.map((subjectName) => (
                                          <div key={subjectName} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/50">
                                            <Badge variant="secondary" className="px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200">{subjectName}</Badge>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeSubject(cls.name, subjectName)}
                                              className="h-10 w-10 p-0"
                                            >
                                              <X className="w-4 h-4 text-destructive" />
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
                                  <div className="text-center py-6 bg-muted/20 backdrop-blur-sm rounded-lg border border-border/30">
                                    <p className="text-base text-muted-foreground italic">No subjects selected. Click "Add Subjects" to select subjects for this class.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      disabled={isLoading}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || classes.length === 0}
                      className="flex-1 px-12 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-w-[250px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving Configuration...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-5 w-5" />
                          Save Subjects Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Subject Selection Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">Select Subjects for {currentClassName}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Choose the subjects that will be taught in {currentClassName}. You can select multiple subjects.
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingGlobalSubjects ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {globalSubjects.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/50">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/50 backdrop-blur-sm rounded-xl mb-3">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No global subjects found. Please contact your administrator.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {globalSubjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-background/80 transition-colors">
                          <Checkbox
                            id={subject.id}
                            checked={tempSelectedSubjects.includes(subject.name)}
                            onCheckedChange={() => handleSubjectToggle(subject.name)}
                            className="h-5 w-5"
                          />
                          <label 
                            htmlFor={subject.id}
                            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            <div>
                              <div className="font-medium text-foreground">{subject.name}</div>
                              {subject.description && (
                                <div className="text-sm text-muted-foreground mt-1">{subject.description}</div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tempSelectedSubjects.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl backdrop-blur-sm">
                      <h4 className="font-bold text-lg text-foreground mb-4">Selected Subjects ({tempSelectedSubjects.length})</h4>
                      <div className="flex flex-wrap gap-3">
                        {tempSelectedSubjects.map((subjectName) => (
                          <Badge key={subjectName} variant="secondary" className="px-3 py-2 text-sm font-medium">
                            {subjectName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-12 px-6">
                  Cancel
                </Button>
                <Button 
                  onClick={saveSubjectSelection}
                  disabled={tempSelectedSubjects.length === 0}
                  className="h-12 px-6 bg-foreground hover:bg-foreground/90 text-background"
                >
                  Save Selection ({tempSelectedSubjects.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SubjectsSetup;
