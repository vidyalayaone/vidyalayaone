import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      quote: "VidyalayaOne transformed how we manage our school. The attendance system alone saved us 5 hours per week.",
      author: "Dr. Priya Sharma",
      role: "Principal",
      school: "Delhi Public School, Mumbai"
    },
    {
      quote: "The parent communication features are amazing. Parents love getting real-time updates about their children.",
      author: "Rajesh Kumar",
      role: "Vice Principal",
      school: "St. Mary's Convent School"
    },
    {
      quote: "Fee collection became so much easier. We saw a 40% reduction in payment delays after implementing VidyalayaOne.",
      author: "Meera Patel",
      role: "Administrator",
      school: "Greenwood International School"
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by educators nationwide
          </h2>
          <p className="text-xl text-muted-foreground">
            See what school administrators are saying about VidyalayaOne
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4">
                  <svg className="w-8 h-8 text-primary mb-2" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                  </svg>
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary font-medium">{testimonial.school}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-muted-foreground mb-8">Featured in</p>
          <div className="flex items-center justify-center space-x-12 opacity-60">
            <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
              <span className="font-medium text-muted-foreground">Education Today</span>
            </div>
            <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
              <span className="font-medium text-muted-foreground">School Weekly</span>
            </div>
            <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
              <span className="font-medium text-muted-foreground">EduTech India</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProof
