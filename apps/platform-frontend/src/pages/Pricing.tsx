import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Users, Building, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const trialPlan = {
    name: "Free Trial",
    price: "Free",
    period: "for 30 days",
    description: "Explore all features with full access",
    icon: Star,
    popular: true,
    features: [
      "Up to 100 students",
      "Complete student management",
      "Parent communication portal",
      "Attendance tracking & reports",
      "Fee management system",
      "Exam management & grading",
      "Academic performance tracking",
      "Staff management",
      "Class & section management",
      "Subject & curriculum planning",
      "Homework & assignment tracking",
      "Event & calendar management",
      "Basic reporting & analytics",
      "Email & SMS notifications",
      "Mobile app access",
      "Data export capabilities",
      "24/7 email support",
      "Setup assistance included"
    ]
  };

  const enterpriseFeatures = [
    "Custom deployment options",
    "Dedicated infrastructure",
    "24/7 premium support",
    "Advanced security features",
    "Custom feature development",
    "Data migration assistance",
    "Compliance certifications",
    "White-label solutions"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Start Your</span>
            <br />
            <span className="text-primary">Free Trial</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Experience the full power of VidyalayaOne with complete access to all features - completely free for 30 days.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Current Offering</h2>
          
          <div className="flex justify-center mb-12">
            <Card className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary ring-2 ring-primary/20 max-w-4xl w-full">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Available Now
              </Badge>
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{trialPlan.name}</CardTitle>
                <div className="my-4">
                  <span className="text-5xl font-bold">{trialPlan.price}</span>
                  <span className="text-muted-foreground text-lg"> {trialPlan.period}</span>
                </div>
                <CardDescription className="text-lg">{trialPlan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {trialPlan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" size="lg">
                  <Link to="/register">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">More Plans Coming Soon</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're working on additional subscription plans tailored for different school sizes and needs. 
              Stay tuned for exciting pricing options!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <CardTitle className="text-lg text-muted-foreground">Basic Plan</CardTitle>
                  <CardDescription>For small schools</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <CardTitle className="text-lg text-muted-foreground">Standard Plan</CardTitle>
                  <CardDescription>For growing institutions</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <CardTitle className="text-lg text-muted-foreground">Premium Plan</CardTitle>
                  <CardDescription>For large institutions</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
            <p className="text-muted-foreground text-lg">
              Looking for enterprise solutions or have specific requirements? Let's discuss your needs.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3 justify-center">
                  <Building className="h-8 w-8 text-primary" />
                  Custom Solutions
                </CardTitle>
                <CardDescription className="text-base text-center">
                  For institutions with unique requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {enterpriseFeatures.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the Free Trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Full access to all features for 30 days. No restrictions, no limitations - you get the complete VidyalayaOne experience.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When will paid plans be available?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We're currently developing our subscription plans. They'll be available soon with options for different school sizes and needs.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We accept all major credit cards, debit cards, UPI, net banking for the trial. More payment options will be available with paid plans.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you provide setup support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes! We provide free onboarding support and training to help you get started with VidyalayaOne quickly and efficiently.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;