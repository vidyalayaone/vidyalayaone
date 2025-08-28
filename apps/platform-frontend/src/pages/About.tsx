import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CTABand from '@/components/cta-band'
import { pageSEO } from '@/lib/seo'

const About: React.FC = () => {
  const seo = pageSEO.about

  const timeline = [
    {
      year: '2020',
      title: 'Founded',
      description: 'VidyalayaOne was founded with a mission to digitize Indian schools.'
    },
    {
      year: '2021',
      title: 'First Schools',
      description: 'Launched pilot program with 10 progressive schools in Delhi and Mumbai.'
    },
    {
      year: '2022',
      title: 'Platform Launch',
      description: 'Official platform launch with comprehensive school management modules.'
    },
    {
      year: '2023',
      title: 'Rapid Growth',
      description: 'Expanded to 50+ schools across 10+ states in India.'
    },
    {
      year: '2024',
      title: 'Scale & Innovation',
      description: 'Serving 100+ schools with advanced AI-powered features.'
    }
  ]

  const leadership = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      bio: '15+ years in EdTech. Former Principal at Delhi Public School.',
      image: '👨‍💼'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      bio: 'Tech leader with experience at Microsoft and Amazon.',
      image: '👩‍💻'
    },
    {
      name: 'Dr. Anita Patel',
      role: 'Head of Education',
      bio: 'PhD in Education, 20+ years in curriculum development.',
      image: '👩‍🎓'
    }
  ]

  const values = [
    {
      title: 'Education First',
      description: 'Every decision we make is guided by what\'s best for students and educators.',
      icon: '🎓'
    },
    {
      title: 'Innovation',
      description: 'We continuously innovate to solve real problems faced by schools.',
      icon: '💡'
    },
    {
      title: 'Accessibility',
      description: 'Technology should be accessible to schools of all sizes and budgets.',
      icon: '🌍'
    },
    {
      title: 'Trust',
      description: 'We handle educational data with the highest levels of security and privacy.',
      icon: '🔒'
    }
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
            About VidyalayaOne
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            We're on a mission to transform education in India through technology that empowers schools, teachers, and students.
          </p>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                To democratize access to world-class school management technology and help Indian educational institutions thrive in the digital age.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that every school, regardless of size or budget, deserves access to modern tools that can help them provide better education, engage parents more effectively, and operate more efficiently.
              </p>
            </div>

            <div className="bg-gradient-card p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Our Story</h3>
              <p className="text-muted-foreground leading-relaxed">
                VidyalayaOne was born out of frustration with the complex, expensive, and outdated systems that schools were forced to use. Our founders, having worked in education for decades, knew there had to be a better way.
              </p>
              <br />
              <p className="text-muted-foreground leading-relaxed">
                Starting with a simple idea - "What if school management software was actually designed for educators?" - we've built a platform that puts usability, affordability, and effectiveness at its core.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Key milestones in our mission to transform education
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="bg-white shadow-lg">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {item.year}
                          </div>
                          <CardTitle className="text-xl">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-muted-foreground">
              Experienced leaders committed to transforming education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center bg-gradient-card">
                <CardHeader>
                  <div className="text-6xl mb-4">{leader.image}</div>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">
                    {leader.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center bg-white">
                <CardHeader>
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Join us in transforming education"
        subtitle="Be part of the digital transformation that's reshaping how schools operate across India."
        primaryCTA="Start Your Journey"
        secondaryCTA="Learn More"
      />
    </>
  )
}

export default About
