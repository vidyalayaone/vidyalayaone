import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSchoolStore } from '@/store/schoolStore';
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
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { school, setupProgress, setSchool } = useSchoolStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSchoolData = async () => {
      try {
        const response = await authAPI.getMySchool();
        setSchool(response.data?.school || null);
      } catch (error: any) {
        console.error('Error fetching school data:', error);
        toast({
          title: 'Error loading school data',
          description: 'Please try refreshing the page',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [isAuthenticated, navigate, setSchool]);

  const getSetupProgress = () => {
    const steps = [
      setupProgress.schoolCreated,
      setupProgress.classesAdded,
      setupProgress.sectionsAdded,
      setupProgress.subjectsAdded,
      setupProgress.paymentCompleted,
    ];
    return (steps.filter(Boolean).length / steps.length) * 100;
  };

  const getApprovalStatusBadge = () => {
    if (!school) return null;
    
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Pending Approval' },
      approved: { variant: 'success' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
    };

    const config = statusConfig[school.approvalStatus];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
                  Create School Profile
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

        {/* School Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{school.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Board</p>
                  <p className="font-medium">{school.affiliatedBoard}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Principal</p>
                  <p className="font-medium">{school.principalName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{school.studentStrength}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Address</p>
                <p className="font-medium">{school.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Setup Progress Card */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Setup Progress
              </CardTitle>
              <CardDescription>
                Complete all steps to activate your school management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(getSetupProgress())}%
                  </span>
                </div>
                <Progress value={getSetupProgress()} className="h-2" />
              </div>

              <div className="space-y-3">
                {[
                  { key: 'schoolCreated', label: 'School Profile', icon: GraduationCap },
                  { key: 'classesAdded', label: 'Classes', icon: Users },
                  { key: 'sectionsAdded', label: 'Sections', icon: BookOpen },
                  { key: 'subjectsAdded', label: 'Subjects', icon: BookOpen },
                  { key: 'paymentCompleted', label: 'Payment', icon: CreditCard },
                ].map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    {setupProgress[step.key as keyof typeof setupProgress] ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${
                      setupProgress[step.key as keyof typeof setupProgress] 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!setupProgress.classesAdded && (
            <Card className="group hover:shadow-medium transition-smooth cursor-pointer" 
                  onClick={() => navigate('/setup/classes')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Add Classes</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure the classes offered by your school
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Set up now <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {setupProgress.classesAdded && !setupProgress.sectionsAdded && (
            <Card className="group hover:shadow-medium transition-smooth cursor-pointer" 
                  onClick={() => navigate('/setup/sections')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Add Sections</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create sections for each class
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Continue setup <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {setupProgress.sectionsAdded && !setupProgress.subjectsAdded && (
            <Card className="group hover:shadow-medium transition-smooth cursor-pointer" 
                  onClick={() => navigate('/setup/subjects')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Add Subjects</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure subjects for each class and section
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Continue setup <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          )}

          {school.approvalStatus === 'approved' && school.subdomain && (
            <Card className="group hover:shadow-medium transition-smooth">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-semibold">School Portal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Access your live school management system
                </p>
                <Button variant="success" size="sm" className="w-full">
                  Open Portal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;