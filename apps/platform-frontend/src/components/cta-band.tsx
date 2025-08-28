import React from 'react'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'

interface CTABandProps {
  title?: string
  subtitle?: string
  primaryCTA?: string
  secondaryCTA?: string
}

const CTABand: React.FC<CTABandProps> = ({
  title = "Ready to transform your school?",
  subtitle = "Join hundreds of schools already using VidyalayaOne to streamline their operations.",
  primaryCTA = "Get Started Free",
  secondaryCTA = "Schedule Demo"
}) => {
  return (
    <section className="py-20 bg-gradient-primary text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-xl mb-8 text-white/90">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg"
            onClick={() => window.open(`${env.APP_BASE_URL}/login`, '_blank')}
          >
            {primaryCTA}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary"
            onClick={() => window.open(env.DEMO_URL, '_blank')}
          >
            {secondaryCTA}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTABand
