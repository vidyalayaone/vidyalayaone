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
import { schoolAPI } from '@/lib/api';
import { useSchoolStore } from '@/store/schoolStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, BookOpen, ArrowLeft, Plus, X, Edit2, Check } from 'lucide-react';

// Validation schema for sections setup
const sectionsSetupSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)'),
});

type SectionsSetupForm = z.infer<typeof sectionsSetupSchema>;

interface ClassWithSections {
  id: string;
  name: string;
  sections: Array<{
    id: string;
    name: string;
  }>;
}

interface SectionToCreate {
  name: string;
  isEditing: boolean;
}

const SectionsSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolIdFromUrl = searchParams.get('schoolId');
  const { school, updateSetupProgress } = useSchoolStore();
  
  // Use schoolId from URL params or from store
  const schoolId = schoolIdFromUrl || school?.id;
  const [classes, setClasses] = useState<ClassWithSections[]>([]);
  const [sectionsToCreate, setSectionsToCreate] = useState<Record<string, SectionToCreate[]>>({});

  const form = useForm<SectionsSetupForm>({
    resolver: zodResolver(sectionsSetupSchema as any),
    defaultValues: {
      schoolId: schoolId || '',
      academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
    },
  });

  // Load existing classes and sections
  useEffect(() => {
    if (schoolId) {
      loadClassesAndSections();
    }
  }, [schoolId]);

  const loadClassesAndSections = async () => {
    try {
      setIsLoadingClasses(true);
      const academicYear = form.getValues('academicYear');
      
      // Call the school service to get classes and sections using the API client
      const response = await schoolAPI.getClassesSections(schoolId!, academicYear);
      
      if (response.success) {
        setClasses(response.data.classes || []);
        
        // Initialize sections to create for classes that don't have sections
        const initialSections: Record<string, SectionToCreate[]> = {};
        response.data.classes.forEach((cls: ClassWithSections) => {
          if (cls.sections.length === 0) {
            // Default sections A, B, C for classes without sections
            initialSections[cls.name] = [
              { name: 'A', isEditing: false },
              { name: 'B', isEditing: false },
              { name: 'C', isEditing: false }
            ];
          } else {
            initialSections[cls.name] = [];
          }
        });
        setSectionsToCreate(initialSections);
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

  const handleSubmit = async (data: SectionsSetupForm) => {
    setIsLoading(true);
    try {
      // Prepare sections data for API
      const sections = Object.entries(sectionsToCreate)
        .filter(([_, sectionList]) => sectionList.length > 0)
        .map(([className, sectionList]) => ({
          className,
          sectionNames: sectionList.map(section => section.name)
        }));

      if (sections.length === 0) {
        toast({
          variant: "destructive",
          title: "No Sections to Create",
          description: "Please add at least one section to proceed.",
        });
        setIsLoading(false);
        return;
      }

      await schoolAPI.addSections({
        schoolId: data.schoolId,
        academicYear: data.academicYear,
        sections: sections
      });

      // Update setup progress
      updateSetupProgress({ sectionsAdded: true });

      toast({
        title: "Sections Created Successfully!",
        description: `Sections have been created for your school.`,
      });

      // Navigate to next step or dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating sections:', error);
      
      const errorMessage = error.response?.data?.error?.message || 'Failed to create sections. Please try again.';
      toast({
        variant: "destructive",
        title: "Error Creating Sections",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = (className: string) => {
    setSectionsToCreate(prev => ({
      ...prev,
      [className]: [
        ...prev[className],
        { name: getNextSectionName(prev[className]), isEditing: true }
      ]
    }));
  };

  const getNextSectionName = (existingSections: SectionToCreate[]) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const existingNames = existingSections.map(s => s.name);
    
    for (const letter of alphabet) {
      if (!existingNames.includes(letter)) {
        return letter;
      }
    }
    
    return `Section ${existingSections.length + 1}`;
  };

  const removeSection = (className: string, index: number) => {
    setSectionsToCreate(prev => ({
      ...prev,
      [className]: prev[className].filter((_, i) => i !== index)
    }));
  };

  const updateSectionName = (className: string, index: number, newName: string) => {
    setSectionsToCreate(prev => ({
      ...prev,
      [className]: prev[className].map((section, i) => 
        i === index ? { ...section, name: newName } : section
      )
    }));
  };

  const toggleEdit = (className: string, index: number) => {
    setSectionsToCreate(prev => ({
      ...prev,
      [className]: prev[className].map((section, i) => 
        i === index ? { ...section, isEditing: !section.isEditing } : section
      )
    }));
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">School ID is required to setup sections.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Sections</h1>
          <p className="text-gray-600">Create sections for each class in your school</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Sections Configuration</CardTitle>
            <CardDescription>
              Add sections to your classes. Each section represents a division within a class 
              (e.g., Class 6-A, Class 6-B). You can customize section names as needed.
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
                              onClick={() => addSection(cls.name)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Section
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {cls.sections.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Sections:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {cls.sections.map((section) => (
                                    <Badge key={section.id} variant="secondary">
                                      {section.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {sectionsToCreate[cls.name]?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  {cls.sections.length > 0 ? 'New Sections:' : 'Sections to Create:'}
                                </h4>
                                <div className="space-y-2">
                                  {sectionsToCreate[cls.name].map((section, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      {section.isEditing ? (
                                        <>
                                          <Input
                                            value={section.name}
                                            onChange={(e) => updateSectionName(cls.name, index, e.target.value)}
                                            className="w-32"
                                            placeholder="Section name"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleEdit(cls.name, index)}
                                          >
                                            <Check className="w-4 h-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Badge variant="outline">{section.name}</Badge>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleEdit(cls.name, index)}
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSection(cls.name, index)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {cls.sections.length === 0 && sectionsToCreate[cls.name]?.length === 0 && (
                              <p className="text-sm text-gray-500">No sections yet. Click "Add Section" to create sections for this class.</p>
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
                    onClick={() => navigate('/setup/dashboard')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || classes.length === 0 || Object.values(sectionsToCreate).every(sections => sections.length === 0)}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Sections
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SectionsSetup;
