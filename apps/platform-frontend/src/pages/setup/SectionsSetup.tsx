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
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to load classes. Please try again.',
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
      
      toast({
        variant: "destructive",
        title: "Error Creating Sections",
        description: error.message || 'Failed to create sections. Please try again.',
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
                  <p className="text-muted-foreground mb-6">School ID is required to setup sections.</p>
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
                  Setup Sections
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Create sections for each class in your school. Each section represents a division within a class.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-large">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold">Class Sections Configuration</CardTitle>
              <CardDescription className="text-lg">
                Add sections to your classes. Each section represents a division within a class 
                (e.g., Class 6-A, Class 6-B). You can customize section names as needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
                  {/* Sections Configuration */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Configure Sections</h3>
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
                            <p className="text-muted-foreground mb-6">Please create classes first before setting up sections.</p>
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
                                  onClick={() => addSection(cls.name)}
                                  className="h-10 px-4"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Section
                                </Button>
                              </div>

                              <div className="space-y-6">
                                {cls.sections.length > 0 && (
                                  <div>
                                    <h5 className="text-base font-semibold text-foreground mb-3">Existing Sections:</h5>
                                    <div className="flex flex-wrap gap-3">
                                      {cls.sections.map((section) => (
                                        <Badge key={section.id} variant="secondary" className="px-3 py-2 text-sm font-medium">
                                          {section.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {sectionsToCreate[cls.name]?.length > 0 && (
                                  <div>
                                    <h5 className="text-base font-semibold text-foreground mb-3">
                                      {cls.sections.length > 0 ? 'New Sections:' : 'Sections to Create:'}
                                    </h5>
                                    <div className="space-y-3">
                                      {sectionsToCreate[cls.name].map((section, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/50">
                                          {section.isEditing ? (
                                            <>
                                              <Input
                                                value={section.name}
                                                onChange={(e) => updateSectionName(cls.name, index, e.target.value)}
                                                className="w-32 h-10"
                                                placeholder="Section name"
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleEdit(cls.name, index)}
                                                className="h-10 w-10 p-0"
                                              >
                                                <Check className="w-4 h-4 text-green-600" />
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Badge variant="outline" className="px-3 py-2 text-sm font-medium">{section.name}</Badge>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleEdit(cls.name, index)}
                                                className="h-10 w-10 p-0"
                                              >
                                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                                              </Button>
                                            </>
                                          )}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSection(cls.name, index)}
                                            className="h-10 w-10 p-0"
                                          >
                                            <X className="w-4 h-4 text-destructive" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {cls.sections.length === 0 && sectionsToCreate[cls.name]?.length === 0 && (
                                  <p className="text-base text-muted-foreground italic">No sections yet. Click "Add Section" to create sections for this class.</p>
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
                      disabled={isLoading || classes.length === 0 || Object.values(sectionsToCreate).every(sections => sections.length === 0)}
                      className="flex-1 px-12 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-w-[250px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Sections...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-5 w-5" />
                          Create Sections
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SectionsSetup;
