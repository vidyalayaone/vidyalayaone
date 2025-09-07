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
  Zap,
  Clock,
  Star
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
      <section className="relative py-16 lg:py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your School with{' '}
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                VidyalayaOne
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete school management system designed for modern education. 
              Streamline administration, enhance learning, and connect your school community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link to="/register" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed to simplify school management and enhance educational outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              // Add some color variety to specific cards
              const isAccentCard = index === 1 || index === 4; // Academic Excellence & Data Security
              const isSecondaryCard = index === 2 || index === 5; // Admin Control & Analytics
              
              return (
                <Card key={index} className={`group hover:shadow-medium transition-smooth border-0 h-full ${
                  isAccentCard 
                    ? 'bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/15' 
                    : isSecondaryCard 
                      ? 'bg-gradient-to-br from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15'
                      : 'bg-gradient-card'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg transition-smooth ${
                        isAccentCard 
                          ? 'bg-accent/10 group-hover:bg-accent/20' 
                          : isSecondaryCard 
                            ? 'bg-secondary/10 group-hover:bg-secondary/20'
                            : 'bg-primary/10 group-hover:bg-primary/20'
                      }`}>
                        <feature.icon className={`h-6 w-6 ${
                          isAccentCard 
                            ? 'text-accent' 
                            : isSecondaryCard 
                              ? 'text-secondary'
                              : 'text-primary'
                        }`} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
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

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From registration to going live, we make the setup process smooth and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-bold text-base mb-4 ${
                    index === 1 ? 'bg-secondary' : index === 2 ? 'bg-accent' : 'bg-primary'
                  }`}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-7 -right-3 w-6 h-0.5 ${
                    index === 0 ? 'bg-secondary/30' : index === 1 ? 'bg-accent/30' : 'bg-primary/30'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg" variant="hero">
              <Link to="/register">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Free Trial Available
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get started with VidyalayaOne's Free Trial and explore all features. 
              No hidden costs, no long-term commitments.
            </p>
            
            <div className="inline-flex items-center gap-6 bg-gradient-to-r from-white via-blue-50 to-teal-50 rounded-2xl p-6 shadow-large max-w-md border border-blue-100">
              <div className="text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">Free</div>
                <div className="text-xs text-muted-foreground">Complete Trial Access</div>
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-primary via-secondary to-accent" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground mb-2">Includes:</div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Full feature access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Setup assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild size="lg" variant="hero">
                <Link to="/pricing">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Start your digital transformation journey with VidyalayaOne and experience 
            the future of school management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/register">Get Started Today</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;