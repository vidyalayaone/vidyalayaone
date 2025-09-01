import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ProductTeaser: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Powerful features for modern schools
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              From admission management to graduation tracking, VidyalayaOne provides 
              all the tools you need to digitize and streamline your school operations.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">Complete student lifecycle management</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">Real-time parent communication</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg">Advanced analytics and reporting</span>
              </div>
            </div>

            <Link to="/platform">
              <Button size="lg" variant="primary">
                Explore All Features
              </Button>
            </Link>
          </div>

          <div>
            <Card className="bg-gradient-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Dashboard Preview</CardTitle>
                <CardDescription>
                  Get insights into your school's performance at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary-light p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Students</span>
                      <span className="text-2xl font-bold text-primary">1,234</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ↗️ 12% increase from last year
                    </div>
                  </div>
                  
                  <div className="bg-success-light p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Attendance Rate</span>
                      <span className="text-2xl font-bold text-success">94.5%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      📈 Above target of 90%
                    </div>
                  </div>
                  
                  <div className="bg-accent-light p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Fee Collection</span>
                      <span className="text-2xl font-bold text-accent">₹45.2L</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      💰 85% collected this month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductTeaser
