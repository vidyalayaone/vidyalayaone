import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  Calendar, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  DollarSign,
  BarChart3,
  Smartphone,
  Building2,
  Video,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  // Student & Teacher Management
  const studentTeacherFeatures = [
    {
      icon: Users,
      title: "Student Data Management",
      description: "Keep all student information organized and easily accessible — from personal details to performance records.",
      status: "Available"
    },
    {
      icon: UserCheck,
      title: "Teacher Data Management",
      description: "Store teacher profiles, subjects, schedules, and contact info in a single, searchable dashboard.",
      status: "Available"
    }
  ];

  // Admissions & Enrollment
  const admissionsFeatures = [
    {
      icon: ClipboardList,
      title: "Admission Management",
      description: "Simplify the admissions process with online forms, automated approval workflows, and notifications.",
      status: "Available"
    }
  ];

  // Academic Management
  const academicFeatures = [
    {
      icon: UserCheck,
      title: "Attendance Management",
      description: "Track daily attendance, generate reports, and send automated notifications to parents.",
      status: "Available"
    },
    {
      icon: BookOpen,
      title: "Exam Management",
      description: "Schedule exams, allocate classrooms and seating plans, and manage results efficiently.",
      status: "Available"
    },
    {
      icon: FileText,
      title: "Grading & Reports",
      description: "Generate report cards and track student performance with customizable grading systems.",
      status: "Available"
    },
    {
      icon: Calendar,
      title: "Academic Calendar",
      description: "Visualize the entire school year, including holidays, exams, and events.",
      status: "Available"
    },
    {
      icon: GraduationCap,
      title: "Time Table Management",
      description: "Create and manage class schedules, assign teachers, and avoid clashes effortlessly.",
      status: "Available"
    }
  ];

  // Financial Management
  const financialFeatures = [
    {
      icon: DollarSign,
      title: "Fee Management",
      description: "Collect fees online securely, track payments, generate invoices, and send reminders automatically.",
      status: "Available"
    }
  ];

  // Coming Soon Features
  const comingSoonFeatures = [
    {
      icon: Users,
      title: "Parent Portal",
      description: "Parent portal for tracking student progress",
      status: "Coming Soon"
    },
    {
      icon: Building2,
      title: "Multi-branch Management",
      description: "Multi-branch management for schools with multiple campuses",
      status: "Coming Soon"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Analytics dashboard for performance and financial insights",
      status: "Coming Soon"
    },
    {
      icon: Smartphone,
      title: "Mobile Apps",
      description: "Mobile apps for teachers, students, and parents",
      status: "Coming Soon"
    },
    {
      icon: Video,
      title: "Third-party Integrations",
      description: "Integration with third-party tools like Zoom for online classes",
      status: "Coming Soon"
    }
  ];

  // Separate available and coming soon features
  const availableFeatures = [
    ...studentTeacherFeatures,
    ...admissionsFeatures,
    ...academicFeatures,
    ...financialFeatures
  ];

  const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
    const Icon = feature.icon;
    const isLeft = index % 2 === 0;
    const isComingSoon = feature.status === "Coming Soon";
    
    // Uniform corner rounding for all cards
    const cardStyle = "rounded-[2rem]";
    
    return (
      <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-16`}>
        <div className={`w-full max-w-3xl ${isLeft ? 'pr-12' : 'pl-12'}`}>
          <Card className={`
            group border-0 p-8 transition-all duration-700 hover:scale-105 
            ${cardStyle}
            ${isComingSoon 
              ? 'bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm opacity-75' 
              : 'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:from-card/90 hover:to-card/60 shadow-lg hover:shadow-2xl'
            }
          `}>
            <div className={`flex items-start gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`flex-shrink-0 ${isLeft ? '' : 'text-right'}`}>
                <div className={`
                  p-6 transition-all duration-500 group-hover:scale-110
                  ${isComingSoon 
                    ? 'bg-muted/20 rounded-2xl' 
                    : 'bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl group-hover:from-primary/30 group-hover:to-primary/20 shadow-lg'
                  }
                `}>
                  <Icon className={`h-12 w-12 ${isComingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
              </div>
              
              <div className={`flex-1 space-y-3 ${isLeft ? 'text-left' : 'text-right'}`}>
                <CardTitle className={`
                  text-3xl font-bold leading-tight group-hover:text-primary transition-colors duration-300
                  ${isComingSoon ? 'text-muted-foreground' : 'text-foreground'}
                `}>
                  {feature.title}
                </CardTitle>
                <CardDescription className={`
                  text-lg leading-relaxed
                  ${isComingSoon ? 'text-muted-foreground' : 'text-muted-foreground'}
                `}>
                  {feature.description}
                </CardDescription>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Everything Schools Need.</span>
            <br />
            <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Manage students, teachers, schedules, and finances effortlessly — all in one intuitive platform.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
      </section>

      {/* Features Categories */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Available Features Section */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight">
              Available Features
            </h2>
            <div className="space-y-8">
              {availableFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-20">
            <div className="flex-grow border-t border-border"></div>
            <div className="mx-8">
              <div className="w-4 h-4 rounded-full bg-primary/20"></div>
            </div>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Coming Soon Features Section */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight text-muted-foreground">
              Coming Soon
            </h2>
            <div className="space-y-8">
              {comingSoonFeatures.map((feature, index) => (
                <FeatureCard key={`coming-soon-${index}`} feature={feature} index={index} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Be among the first schools to experience the simplicity and power of VidyalayaOne.
          </p>
          <div className="pt-4">
            <Button asChild size="default" className="rounded-full bg-foreground hover:bg-foreground/90 text-background font-medium px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;