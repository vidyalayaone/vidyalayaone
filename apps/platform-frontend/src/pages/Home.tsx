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
      description: 'Begin with our ₹1 trial to explore all features.',
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
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your School with{' '}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                VidyalayaOne
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete school management system designed for modern education. 
              Streamline administration, enhance learning, and connect your school community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            
            <div className="flex items-center justify-center gap-6 mt-12 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>₹1 Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Quick Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed to simplify school management and enhance educational outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-medium transition-smooth bg-gradient-card border-0">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From registration to going live, we make the setup process smooth and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="hero">
              <Link to="/register">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Free Trial Available
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get started with VidyalayaOne for just ₹1 and explore all features. 
              No hidden costs, no long-term commitments.
            </p>
            
            <div className="inline-flex items-center gap-4 bg-gradient-card rounded-2xl p-8 shadow-large">
              <div className="text-left">
                <div className="text-4xl font-bold text-primary mb-2">₹1</div>
                <div className="text-sm text-muted-foreground">Complete Trial Access</div>
              </div>
              <div className="h-12 w-px bg-border mx-4" />
              <div className="text-left">
                <div className="text-sm text-muted-foreground mb-2">Includes:</div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Full feature access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Setup assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
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
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
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