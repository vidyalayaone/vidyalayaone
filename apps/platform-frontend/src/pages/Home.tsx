import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Settings, 
  MessageSquare, 
  Shield, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Complete student records, attendance tracking, and academic progress monitoring.',
    },
    {
      icon: BookOpen,
      title: 'Academic Excellence',
      description: 'Curriculum planning, examination management, and performance analytics.',
    },
    {
      icon: Settings,
      title: 'Admin Control',
      description: 'Streamlined administrative processes, fee management, and reporting.',
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Seamless communication between teachers, students, and parents.',
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Bank-grade security ensuring your school data is always protected.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive insights and reports to drive informed decisions.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register Your School',
      description: 'Create your account and provide basic school information.',
    },
    {
      step: '02',
      title: 'Setup Structure',
      description: 'Configure classes, sections, and subjects according to your curriculum.',
    },
    {
      step: '03',
      title: 'Start Trial',
      description: 'Begin with our Free Trial to explore all features.',
    },
    {
      step: '04',
      title: 'Go Live',
      description: 'After approval, launch your complete school management system.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative container mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-8 fade-in">
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="text-foreground">Top Quality</span>
              <br />
              <span className="text-primary">Half the Cost</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              A school management system that delivers premium features with simple, intuitive design — without the bloated costs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild size="lg" className="px-8 py-4 text-base bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <Link to="/register" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="px-8 py-4 text-base">
                <Link to="/features" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/30 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Comprehensive features designed to simplify school management and enhance educational outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* How It Works Section */}
      <section className="py-32 bg-muted/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              From registration to going live, we make the setup process smooth and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-lg mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <Link to="/register">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Pricing Teaser */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Free Trial Available
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
              Get started with VidyalayaOne's Free Trial and explore all features. 
              No hidden costs, no long-term commitments.
            </p>
            
            <div className="inline-flex items-center gap-8 bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/30 max-w-lg">
              <div className="text-left">
                <div className="text-4xl font-bold text-primary mb-2">Free</div>
                <div className="text-sm text-muted-foreground">Complete Trial Access</div>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-left space-y-3">
                <div className="text-sm text-muted-foreground">Includes:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Full feature access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Setup assistance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <Link to="/pricing">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary/5">
        <div className="container mx-auto px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Start your digital transformation journey with VidyalayaOne and experience 
            the future of school management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <Link to="/register">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;