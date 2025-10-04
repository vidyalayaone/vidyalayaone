import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSchoolStore } from '@/store/schoolStore';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Users, 
  BookOpen, 
  Settings,
  CreditCard,
  Shield,
  Plus,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  Award,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { school, classes, totalSections, totalSubjects, setupProgress, setSchoolData } = useSchoolStore();

  const navigate = useNavigate();

  // console.log('school.isActive:', school?.isActive);

  // useEffect(() => {
  //   const fetchSchoolData = async () => {
  //     try {
  //       // First try to get detailed school data
  //       try {
  //         const response = await authAPI.getMySchoolDetailed();
  //         setSchoolData(response.data);
  //       } catch (detailedError: any) {
  //         // Fallback to basic school data if detailed endpoint fails
  //         console.warn('Detailed school data not available, falling back to basic data:', detailedError);
  //         const response = await authAPI.getMySchool();
  //         if (response.data?.school) {
  //           setSchoolData({
  //             school: response.data.school,
  //             classes: [],
  //             totalSections: 0,
  //             totalSubjects: 0,
  //             setupProgress: {
  //               schoolCreated: true,
  //               classesAdded: false,
  //               sectionsAdded: false,
  //               subjectsAdded: false,
  //               paymentCompleted: false,
  //             }
  //           });
  //         } else {
  //           // No school found
  //           setSchoolData({
  //             school: null,
  //             classes: [],
  //             totalSections: 0,
  //             totalSubjects: 0,
  //             setupProgress: {
  //               schoolCreated: false,
  //               classesAdded: false,
  //               sectionsAdded: false,
  //               subjectsAdded: false,
  //               paymentCompleted: false,
  //             }
  //           });
  //         }
  //       }
  //     } catch (error: any) {
  //       console.error('Error fetching school data:', error);
  //       toast({
  //         title: 'Error loading school data',
  //         description: 'Please try refreshing the page',
  //         variant: 'destructive',
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchSchoolData();
  // }, [setSchoolData]);
  useEffect(() => {
  const fetchSchoolData = async () => {
    try {
      // First try to get detailed school data
      try {
        const response = await authAPI.getMySchoolDetailed();
        setSchoolData(response.data);
      } catch (detailedError: any) {
        // Fallback to basic school data if detailed endpoint fails
        console.warn('Detailed school data not available, falling back to basic data:', detailedError);
        const response = await authAPI.getMySchool();
        if (response.data?.school) {
          setSchoolData({
            school: response.data.school,
            classes: [],
            totalSections: 0,
            totalSubjects: 0,
            setupProgress: {
              schoolCreated: true,
              classesAdded: false,
              sectionsAdded: false,
              subjectsAdded: false,
              paymentCompleted: false,
            }
          });
        } else {
          // No school found
          setSchoolData({
            school: null,
            classes: [],
            totalSections: 0,
            totalSubjects: 0,
            setupProgress: {
              schoolCreated: false,
              classesAdded: false,
              sectionsAdded: false,
              subjectsAdded: false,
              paymentCompleted: false,
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching school data:', error);
      
      // Only show toast error if it's NOT a 404 error
      if (error.response?.status !== 404) {
        toast({
          title: 'Error loading school data',
          description: 'Please try refreshing the page',
          variant: 'destructive',
        });
      } else {
        // Handle 404 silently or with different logic
        console.log('School not found (404) - this is expected for new users');
        // Optionally set default empty state for 404
        setSchoolData({
          school: null,
          classes: [],
          totalSections: 0,
          totalSubjects: 0,
          setupProgress: {
            schoolCreated: false,
            classesAdded: false,
            sectionsAdded: false,
            subjectsAdded: false,
            paymentCompleted: false,
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchSchoolData();
}, [setSchoolData]);

  const getSetupProgress = () => {
    const steps = [
      setupProgress.schoolCreated,
      setupProgress.classesAdded,
      setupProgress.sectionsAdded,
      setupProgress.subjectsAdded,
    ];
    return (steps.filter(Boolean).length / steps.length) * 100;
  };

  const getApprovalStatusBadge = () => {
    if (!school) return null;
    
    // If school is active, it means it's approved regardless of metaData status
    if (school.isActive) {
      return <Badge variant="success">Approved</Badge>;
    }
    
    const approvalStatus = school.metaData?.approvalStatus || 'pending';
    
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Pending Approval' },
      approved: { variant: 'success' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
    };

    const config = statusConfig[approvalStatus as keyof typeof statusConfig];
    
    // If approvalStatus is not one of the expected values, default to pending
    if (!config) {
      return <Badge variant="warning">Pending Approval</Badge>;
    }
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getNextAction = () => {
    if (!setupProgress.classesAdded) {
      return {
        label: 'Add Classes',
        description: 'Configure the classes offered by your school',
        route: '/setup/classes',
        icon: Users,
      };
    }
    if (!setupProgress.sectionsAdded) {
      return {
        label: 'Add Sections',
        description: 'Create sections for each class',
        route: '/setup/sections',
        icon: BookOpen,
      };
    }
    if (!setupProgress.subjectsAdded) {
      return {
        label: 'Add Subjects',
        description: 'Configure subjects for each class and section',
        route: '/setup/subjects',
        icon: BookOpen,
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No school created yet
  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative container mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8 fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-2xl mb-6">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Welcome to</span>
              <br />
              <span className="text-primary">VidyalayaOne</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Hello {user?.username}! Let's get your school set up on our platform. 
              Create your school profile to begin the journey.
            </p>
            
            <div className="pt-8">
              <Button 
                size="lg"
                className="px-8 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => navigate('/setup/school')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your School
              </Button>
            </div>
          </div>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              {school.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {user?.username}
            </p>
          </div>
          {getApprovalStatusBadge()}
        </div>

        {/* School Information Card */}
        <Card className="mb-12 bg-card/50 backdrop-blur-sm border-border/50 shadow-medium">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">School Level</p>
                    <p className="font-semibold text-lg capitalize">{school.level?.replace('_', ' ')}</p>
                  </div>
                </div>
                
                {school.board && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Affiliated Board</p>
                      <p className="font-semibold text-lg">{school.board}</p>
                    </div>
                  </div>
                )}

                {school.principalName && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Principal</p>
                      <p className="font-semibold text-lg">{school.principalName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {school.email && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-semibold text-lg">{school.email}</p>
                    </div>
                  </div>
                )}

                {school.phoneNumbers && school.phoneNumbers.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-semibold text-lg">{school.phoneNumbers[0]}</p>
                    </div>
                  </div>
                )}

                {school.establishedYear && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Established</p>
                      <p className="font-semibold text-lg">{school.establishedYear}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-2">{classes.length}</div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-2">{totalSections}</div>
                  <p className="text-sm text-muted-foreground">Sections</p>
                </div>
                
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-2">{totalSubjects}</div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>

                {school.metaData?.studentStrength && (
                  <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="text-3xl font-bold text-primary mb-2">{school.metaData.studentStrength}</div>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {school.address && (
              <div className="flex items-start gap-4 pt-6 border-t border-border">
                <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-semibold text-lg">
                    {typeof school.address === 'object' 
                      ? `${school.address.city}, ${school.address.state}` 
                      : school.address}
                  </p>
                </div>
              </div>
            )}

            {/* School Portal Link */}
            {school.subdomain && school.isActive && (
              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">School Portal</p>
                    <p className="font-semibold text-lg text-primary">{school.subdomain}.vidyalayaone.com</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => window.open(`https://${school.subdomain}.vidyalayaone.com`, '_blank')}
                >
                  Visit Portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes Overview */}
        {classes.length > 0 && (
          <Card className="mb-12 bg-card/50 backdrop-blur-sm border-border/50 shadow-medium">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                Classes Overview
              </CardTitle>
              <CardDescription className="text-lg">
                Overview of all classes and their sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-6 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">{cls.name}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {cls.academicYear}
                      </Badge>
                    </div>
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sections:</span>
                        <span className="font-semibold text-primary">{cls.sections.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subjects:</span>
                        <span className="font-semibold text-primary">{cls.subjects.length}</span>
                      </div>
                      {cls.sections.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-2">Sections:</p>
                          <div className="flex flex-wrap gap-2">
                            {cls.sections.map((section) => (
                              <Badge key={section.id} variant="secondary" className="text-xs bg-secondary/50">
                                {section.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Progress */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-medium">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              Setup Progress
            </CardTitle>
            <CardDescription className="text-lg">
              Complete all steps to activate your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Overall Progress</span>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(getSetupProgress())}%
                  </span>
                </div>
                <Progress value={getSetupProgress()} className="h-4 mb-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    key: 'schoolCreated', 
                    label: 'School Profile', 
                    icon: GraduationCap,
                    description: 'Basic school information'
                  },
                  { 
                    key: 'classesAdded', 
                    label: 'Classes', 
                    icon: Users,
                    description: 'Academic classes setup'
                  },
                  { 
                    key: 'sectionsAdded', 
                    label: 'Sections', 
                    icon: BookOpen,
                    description: 'Class sections created'
                  },
                  { 
                    key: 'subjectsAdded', 
                    label: 'Subjects', 
                    icon: BookOpen,
                    description: 'Subjects configured'
                  },
                ].map((step) => {
                  const isCompleted = setupProgress[step.key as keyof typeof setupProgress];
                  const StepIcon = step.icon;
                  
                  return (
                    <div 
                      key={step.key} 
                      className={`p-6 rounded-xl border text-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-success/10 border-success/30 shadow-sm' 
                          : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        isCompleted ? 'bg-success/20' : 'bg-muted/50'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-8 w-8 text-success" />
                        ) : (
                          <StepIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        isCompleted ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Continue Button */}
              {getNextAction() && (
                <div className="flex items-center justify-between p-8 bg-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-xl">
                      {(() => {
                        const NextIcon = getNextAction()!.icon;
                        return <NextIcon className="h-8 w-8 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl mb-2">{getNextAction()!.label}</h3>
                      <p className="text-muted-foreground text-lg">{getNextAction()!.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate(`${getNextAction()!.route}?schoolId=${school.id}`)}
                    className="shrink-0 px-8 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Continue Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* All Setup Complete */}
              {!getNextAction() && (
                <div className="text-center p-10 bg-success/5 rounded-xl border border-success/20 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
                    {(() => {
                      // If school is active, it means it's approved
                      if (school.isActive) {
                        return <CheckCircle className="h-10 w-10 text-success" />;
                      }
                      
                      const approvalStatus = school.metaData?.approvalStatus || 'pending';
                      if (approvalStatus === 'approved') {
                        return <CheckCircle className="h-10 w-10 text-success" />;
                      } else {
                        return <Clock className="h-10 w-10 text-warning" />;
                      }
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-success">Setup Complete!</h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                    {(() => {
                      // If school is active, it means it's approved and ready to use
                      if (school.isActive) {
                        return 'Your school management system is ready to use';
                      }
                      
                      const approvalStatus = school.metaData?.approvalStatus || 'pending';
                      if (approvalStatus === 'approved') {
                        return 'Your school management system is ready to use';
                      } else if (approvalStatus === 'rejected') {
                        return 'Your school setup is complete, but approval was rejected. Please contact support.';
                      } else {
                        return 'Your school setup is complete and waiting for approval';
                      }
                    })()}
                  </p>
                  {school.subdomain && school.isActive && (
                    <Button 
                      size="lg" 
                      className="px-8 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      onClick={() => window.open(`https://${school.subdomain}.vidyalayaone.com`, '_blank')}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Access School Portal
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;