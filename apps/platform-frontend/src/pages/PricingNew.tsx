import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { pageSEO } from '@/lib/seo'

const Pricing: React.FC = () => {
  const navigate = useNavigate()
  const seo = pageSEO.pricing

  const features = [
    'Complete Student Management System',
    'Attendance Tracking & Reporting',
    'Fee Collection & Payment Gateway',
    'Exam Management & Grading',
    'Parent Communication Portal',
    'Academic Calendar & Timetable',
    'Staff Management Module',
    'Analytics & Custom Reports',
    'Mobile Apps for Parents & Teachers',
    'Cloud Storage & Data Backup',
    '24/7 Customer Support',
    'Regular Updates & New Features'
  ]

  const faqs = [
    {
      question: 'Is this a one-time payment?',
      answer: 'Yes, this is a special introductory offer with a one-time payment of ₹1 to get started with VidyalayaOne.'
    },
    {
      question: 'What happens after payment?',
      answer: 'After successful payment, you will be redirected to create your school profile and can start using all features immediately.'
    },
    {
      question: 'Is there any setup fee?',
      answer: 'No additional setup fees. The ₹1 payment includes everything you need to get started.'
    },
    {
      question: 'Can I upgrade later?',
      answer: 'Yes, you can upgrade your plan anytime as your school grows. We offer flexible pricing for larger institutions.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and comply with all data protection standards to keep your school data secure.'
    }
  ]

  const handleGetStarted = () => {
    navigate('/register')
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
      </Helmet>

      {/* Header */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Get started with VidyalayaOne today. Special introductory pricing for early adopters.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Card className="w-full max-w-lg bg-gradient-card shadow-xl border-2 border-primary">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Badge variant="success" className="text-sm px-3 py-1">
                    Special Launch Offer
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold">Basic Plan</CardTitle>
                <CardDescription className="text-lg">
                  Complete school management solution
                </CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <span className="text-5xl font-bold text-primary">₹1</span>
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground line-through">₹10,000</div>
                    <div className="text-sm text-muted-foreground">one-time</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>🔒 Secure payment powered by Razorpay</p>
                  <p>✨ No hidden fees • Cancel anytime</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Pricing
