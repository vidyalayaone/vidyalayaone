import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Settings, MessageSquare, BookOpen, Calendar, FileText, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Complete student information system with admissions, profiles, and academic records.",
      status: "Available"
    },
    {
      icon: GraduationCap,
      title: "Academic Management",
      description: "Class scheduling, curriculum planning, examination management, and grade tracking.",
      status: "Available"
    },
    {
      icon: Settings,
      title: "Administrative Tools",
      description: "Staff management, payroll, inventory, and comprehensive administrative controls.",
      status: "Available"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Parent-teacher communication, announcements, and school-wide messaging system.",
      status: "Available"
    },
    {
      icon: BookOpen,
      title: "Digital Library",
      description: "Resource management, book tracking, and digital content distribution.",
      status: "Coming Soon"
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "School calendar, event planning, and attendance tracking for all activities.",
      status: "Coming Soon"
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Automated report cards, progress reports, and administrative documentation.",
      status: "Coming Soon"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Performance insights, attendance analytics, and school-wide metrics.",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Comprehensive School Management Features
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to run a modern school efficiently, from student management to advanced analytics.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={feature.status === "Available" ? "default" : "secondary"}>
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon Timeline */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Development Roadmap</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            We're continuously expanding VidyalayaOne with new features. Here's what's coming next.
          </p>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-background rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">Q1</span>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">Digital Library & Resources</h3>
                <p className="text-muted-foreground">Complete digital resource management with book tracking and content distribution.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-background rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-bold text-xl">Q2</span>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">Comprehensive reporting and analytics dashboard for data-driven decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;