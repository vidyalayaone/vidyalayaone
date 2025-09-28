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
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to VidyalayaOne, {user?.username}!
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Let's get your school set up on our platform. 
              Create your school profile to begin the journey.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-large">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create Your School</CardTitle>
                <CardDescription>
                  Set up your school profile to get started with VidyalayaOne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="hero" 
                  onClick={() => navigate('/setup/school')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create School
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {school.name}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username}
            </p>
          </div>
          {getApprovalStatusBadge()}
        </div>

        {/* School Information Card */}
        <Card className="mb-8 bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">School Level</p>
                    <p className="font-medium capitalize">{school.level?.replace('_', ' ')}</p>
                  </div>
                </div>
                
                {school.board && (
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Affiliated Board</p>
                      <p className="font-medium">{school.board}</p>
                    </div>
                  </div>
                )}

                {school.principalName && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="font-medium">{school.principalName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {school.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{school.email}</p>
                    </div>
                  </div>
                )}

                {school.phoneNumbers && school.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{school.phoneNumbers[0]}</p>
                    </div>
                  </div>
                )}

                {school.establishedYear && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Established</p>
                      <p className="font-medium">{school.establishedYear}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{classes.length}</div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{totalSections}</div>
                  <p className="text-sm text-muted-foreground">Sections</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{totalSubjects}</div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>

                {school.metaData?.studentStrength && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{school.metaData.studentStrength}</div>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {school.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {typeof school.address === 'object' 
                      ? `${school.address.city}, ${school.address.state}` 
                      : school.address}
                  </p>
                </div>
              </div>
            )}

            {/* School Portal Link */}
            {school.subdomain && school.isActive && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">School Portal</p>
                  <p className="font-medium text-primary">{school.subdomain}.vidyalayaone.com</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(`https://${school.subdomain}.vidyalayaone.com`, '_blank')}>
                  Visit Portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes Overview */}
        {classes.length > 0 && (
          <Card className="mb-8 bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Classes Overview
              </CardTitle>
              <CardDescription>
                Overview of all classes and their sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 bg-background/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{cls.name}</h3>
                      <Badge variant="outline">{cls.academicYear}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sections:</span>
                        <span className="font-medium">{cls.sections.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subjects:</span>
                        <span className="font-medium">{cls.subjects.length}</span>
                      </div>
                      {cls.sections.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cls.sections.map((section) => (
                            <Badge key={section.id} variant="secondary" className="text-xs">
                              {section.name}
                            </Badge>
                          ))}
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
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Setup Progress
            </CardTitle>
            <CardDescription>
              Complete all steps to activate your school management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold">Overall Progress</span>
                  <span className="text-lg font-semibold text-primary">
                    {Math.round(getSetupProgress())}%
                  </span>
                </div>
                <Progress value={getSetupProgress()} className="h-3 mb-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      className={`p-4 rounded-lg border text-center transition-all ${
                        isCompleted 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                        isCompleted ? 'bg-success/20' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-success" />
                        ) : (
                          <StepIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className={`font-semibold mb-1 ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Continue Button */}
              {getNextAction() && (
                <div className="flex items-center justify-between p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {(() => {
                        const NextIcon = getNextAction()!.icon;
                        return <NextIcon className="h-6 w-6 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{getNextAction()!.label}</h3>
                      <p className="text-muted-foreground">{getNextAction()!.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate(`${getNextAction()!.route}?schoolId=${school.id}`)}
                    className="shrink-0"
                  >
                    Continue Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* All Setup Complete */}
              {!getNextAction() && (
                <div className="text-center p-8 bg-success/5 rounded-lg border border-success/20">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                    {(() => {
                      // If school is active, it means it's approved
                      if (school.isActive) {
                        return <CheckCircle className="h-8 w-8 text-success" />;
                      }
                      
                      const approvalStatus = school.metaData?.approvalStatus || 'pending';
                      if (approvalStatus === 'approved') {
                        return <CheckCircle className="h-8 w-8 text-success" />;
                      } else {
                        return <Clock className="h-8 w-8 text-warning" />;
                      }
                    })()}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-success">Setup Complete!</h3>
                  <p className="text-muted-foreground mb-4">
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
                      onClick={() => window.open(`https://${school.subdomain}.vidyalayaone.com`, '_blank')}
                    >
                      <Shield className="mr-2 h-4 w-4" />
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