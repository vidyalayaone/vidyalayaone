import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CTABand from '@/components/cta-band'
import { pageSEO } from '@/lib/seo'

const WhyUs: React.FC = () => {
  const seo = pageSEO.whyUs

  const differentiators = [
    {
      title: 'Usability First',
      description: 'Designed with educators in mind. Intuitive interface that requires minimal training.',
      icon: '🎯',
      details: [
        'Clean, intuitive interface designed for educators',
        'Minimal learning curve - get started in minutes',
        'Mobile-responsive design for on-the-go access',
        'Contextual help and guided workflows'
      ]
    },
    {
      title: 'All-in-One Solution',
      description: 'Complete platform covering every aspect of school management from admissions to graduation.',
      icon: '🔧',
      details: [
        'Integrated modules eliminate data silos',
        'Single source of truth for all school data',
        'Seamless data flow between modules',
        'No need for multiple vendors or systems'
      ]
    },
    {
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with compliance to educational data protection standards.',
      icon: '🔒',
      details: [
        'Bank-level encryption for all data',
        'Regular security audits and updates',
        'GDPR and privacy compliance built-in',
        'Role-based access controls'
      ]
    },
    {
      title: 'Scalable',
      description: 'Grows with your institution from 50 students to 5000+ students.',
      icon: '📈',
      details: [
        'Handles schools of any size effortlessly',
        'Cloud infrastructure scales automatically',
        'Performance optimized for large datasets',
        'Multi-campus support available'
      ]
    },
    {
      title: 'Parent Engagement',
      description: 'Strengthen school-parent communication with real-time updates and mobile apps.',
      icon: '👨‍👩‍👧‍👦',
      details: [
        'Real-time notifications to parents',
        'Parent portal and mobile app',
        'Two-way communication channels',
        'Automated progress reports'
      ]
    },
    {
      title: 'Expert Support',
      description: 'Dedicated support team with deep understanding of Indian education system.',
      icon: '🤝',
      details: [
        '24/7 technical support available',
        'Dedicated customer success manager',
        'Regular training and workshops',
        'Implementation support included'
      ]
    }
  ]

  const stats = [
    { label: 'Schools Served', value: '100+' },
    { label: 'Students Managed', value: '50,000+' },
    { label: 'Uptime Guarantee', value: '99.9%' },
    { label: 'Customer Satisfaction', value: '98%' }
  ]

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
            Why Choose VidyalayaOne?
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Discover what makes us the preferred choice for progressive schools across India.
          </p>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Indian Schools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We understand the unique challenges of Indian educational institutions and have built solutions specifically for them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differentiators.map((item, index) => (
              <Card key={index} className="bg-gradient-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2 text-sm">
                        <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proven Results
            </h2>
            <p className="text-xl text-muted-foreground">
              Numbers that speak for our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Row */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Leading Schools
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the growing community of progressive schools using VidyalayaOne
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="font-semibold text-muted-foreground">Delhi Public School</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="font-semibold text-muted-foreground">Ryan International</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="font-semibold text-muted-foreground">DAV Public School</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="font-semibold text-muted-foreground">Kendriya Vidyalaya</div>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Experience the VidyalayaOne difference"
        subtitle="See firsthand why schools choose us for their digital transformation journey."
        primaryCTA="Start Free Trial"
        secondaryCTA="Book Demo"
      />
    </>
  )
}

export default WhyUs
