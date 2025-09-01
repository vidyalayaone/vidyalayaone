import React from 'react'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'

interface HeroProps {
  title: string
  subtitle: string
  primaryCTA?: string
  secondaryCTA?: string
  showTrustRow?: boolean
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryCTA = 'Get Started',
  secondaryCTA = 'Book Demo',
  showTrustRow = true
}) => {
  return (
    <section className="relative bg-gradient-hero text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
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

        {showTrustRow && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white/80 text-sm">Trusted by 100+ schools across India</p>
            <div className="flex items-center justify-center space-x-8 opacity-70">
              <div className="w-24 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">School A</span>
              </div>
              <div className="w-24 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">School B</span>
              </div>
              <div className="w-24 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">School C</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
