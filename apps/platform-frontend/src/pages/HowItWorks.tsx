import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserPlus, CreditCard, CheckCircle, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      step: "1",
      title: "Register Your School",
      description: "Sign up and provide your school's basic information including name, type, contact details, and academic structure.",
      details: "Complete the registration form with your school's official details. You'll need to verify your email address before proceeding to the next step."
    },
    {
      icon: CreditCard,
      step: "2",
      title: "Choose Your Plan",
      description: "Start with our ₹1 trial plan to explore all features, then upgrade to a plan that fits your school's needs.",
      details: "Our trial plan gives you full access for 30 days. After that, choose from Basic, Standard, or Premium plans based on your student count and feature requirements."
    },
    {
      icon: CheckCircle,
      step: "3",
      title: "Get Approved",
      description: "Our team reviews your school information and approves your account within 24-48 hours.",
      details: "We verify your school's credentials and setup your dedicated subdomain. You'll receive email notifications throughout the approval process."
    },
    {
      icon: Rocket,
      step: "4",
      title: "Go Live",
      description: "Access your personalized school portal and start managing students, staff, and academic operations immediately.",
      details: "Once approved, you'll get access to your school's dedicated portal at yourschool.vidyalayaone.com with all features activated."
    }
  ];

  const faqs = [
    {
      question: "How long does the approval process take?",
      answer: "The approval process typically takes 24-48 hours. Our team reviews your school information to ensure authenticity and compliance with our standards."
    },
    {
      question: "What happens during the ₹1 trial period?",
      answer: "You get full access to all VidyalayaOne features for 30 days. You can add students, manage classes, communicate with parents, and explore all administrative tools."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "Is my school data secure?",
      answer: "Absolutely. We use enterprise-grade security measures including data encryption, secure servers, and regular backups to protect your school's information."
    },
    {
      question: "Do you provide training and support?",
      answer: "Yes, we offer comprehensive onboarding support, video tutorials, and ongoing customer support to help you make the most of VidyalayaOne."
    },
    {
      question: "What if I need to migrate data from our current system?",
      answer: "Our team can help you migrate data from your existing school management system. Contact our support team for assistance with data migration."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            How VidyalayaOne Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get your school management system up and running in just 4 simple steps. From registration to going live in under 48 hours.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="relative">
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                            <Icon className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <Badge variant="secondary" className="text-xs font-bold px-2 py-1">
                            Step {step.step}
                          </Badge>
                        </div>
                        <div className="flex-grow">
                          <CardTitle className="text-2xl mb-3">{step.title}</CardTitle>
                          <CardDescription className="text-base mb-4 leading-relaxed">
                            {step.description}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  {!isLast && (
                    <div className="flex justify-center py-4">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of schools already using VidyalayaOne to streamline their operations.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/register">
              Start Your ₹1 Trial Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left py-4 hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;