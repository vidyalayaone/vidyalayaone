import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CTABand from '@/components/cta-band'
import { PLATFORM_MODULES } from '@/lib/constants'
import { pageSEO } from '@/lib/seo'

const Platform: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const seo = pageSEO.platform

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
            Comprehensive School Platform
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Everything you need to digitize and streamline your school operations in one integrated platform.
          </p>
        </div>
      </section>

      {/* Platform Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar TOC */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold text-lg mb-4">Platform Modules</h3>
                {PLATFORM_MODULES.map((module) => (
                  <a
                    key={module.id}
                    href={`#${module.id}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedModule === module.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    {module.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Jump Control */}
            <div className="lg:hidden mb-8">
              <select
                className="w-full p-3 border border-input rounded-md bg-background"
                onChange={(e) => {
                  const element = document.getElementById(e.target.value)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                    setSelectedModule(e.target.value)
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Jump to module...</option>
                {PLATFORM_MODULES.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-16">
              {PLATFORM_MODULES.map((module) => (
                <div key={module.id} id={module.id} className="scroll-mt-20">
                  <Card className="bg-gradient-card shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">{module.title}</CardTitle>
                      <CardDescription className="text-lg">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {module.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="See VidyalayaOne in action"
        subtitle="Schedule a personalized demo to see how our platform can transform your school operations."
        primaryCTA="Schedule Demo"
        secondaryCTA="Start Free Trial"
      />
    </>
  )
}

export default Platform
