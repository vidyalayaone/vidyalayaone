import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Users, Building, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Trial",
      price: "₹1",
      period: "for 30 days",
      description: "Perfect for exploring all features",
      icon: Star,
      popular: true,
      features: [
        "Up to 100 students",
        "Complete student management",
        "Parent communication",
        "Basic reporting",
        "Email support",
        "All core features",
        "30-day full access"
      ]
    },
    {
      name: "Basic",
      price: "₹499",
      period: "per month",
      description: "Ideal for small schools",
      icon: Users,
      popular: false,
      features: [
        "Up to 300 students",
        "Student & staff management",
        "Parent portal",
        "Attendance tracking",
        "Basic reports",
        "Email support",
        "Mobile app access"
      ]
    },
    {
      name: "Standard",
      price: "₹999",
      period: "per month",
      description: "Great for growing schools",
      icon: Building,
      popular: false,
      features: [
        "Up to 800 students",
        "Advanced academic tools",
        "Fee management",
        "Exam management",
        "Advanced reporting",
        "Priority support",
        "Custom branding"
      ]
    },
    {
      name: "Premium",
      price: "₹1,999",
      period: "per month",
      description: "For large educational institutions",
      icon: Zap,
      popular: false,
      features: [
        "Unlimited students",
        "Multi-campus support",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Training & onboarding"
      ]
    }
  ];

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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our ₹1 trial and choose the plan that grows with your school. No hidden fees, no long-term commitments.
          </p>
        </div>
      </section>

      {/* Trial Highlight */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Star className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Try Everything for Just ₹1</CardTitle>
              <CardDescription className="text-lg">
                Get full access to all VidyalayaOne features for 30 days. No restrictions, no limitations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/register">Start Your ₹1 Trial</Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • Cancel anytime • Full feature access
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card key={index} className={`relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="my-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> {plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link to="/register">
                        {plan.name === "Trial" ? "Start Trial" : "Get Started"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Enterprise & Bulk Pricing</h2>
            <p className="text-muted-foreground text-lg">
              Need a custom solution for multiple schools or educational groups? We've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Building className="h-8 w-8 text-primary" />
                  Enterprise Solutions
                </CardTitle>
                <CardDescription className="text-base">
                  For large institutions and educational groups managing multiple schools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {enterpriseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Bulk Discounts
                </CardTitle>
                <CardDescription className="text-base">
                  Special pricing for educational trusts and school chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">5-10 Schools</span>
                    <Badge variant="secondary">15% OFF</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">11-25 Schools</span>
                    <Badge variant="secondary">25% OFF</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">25+ Schools</span>
                    <Badge variant="secondary">35% OFF</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Pricing FAQ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes are reflected in your next billing cycle.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We accept all major credit cards, debit cards, UPI, net banking, and bank transfers for annual plans.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No setup fees for any plan. We also provide free onboarding support and training for all new customers.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;