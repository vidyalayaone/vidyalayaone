import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { env } from '@/lib/env'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface School {
  id: string
  name: string
  email: string
  phone: string[]
  city: string
  state: string
  isActive: boolean
  plan: string | null
}

interface DashboardData {
  user: User
  school: School
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('authToken')
      const userStr = localStorage.getItem('user')
      
      if (!token || !userStr) {
        navigate('/login')
        return
      }

      try {
        const user = JSON.parse(userStr)
        
        const response = await fetch(`${env.AUTH_API_URL}/auth/my-school`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()
        
        if (response.ok && result.success && result.data?.school) {
          const school = result.data.school
          
          // If no payment plan, redirect to payment
          if (!school.plan || school.plan === 'null') {
            navigate('/payment')
            return
          }
          
          setDashboardData({
            user,
            school
          })
        } else {
          // No school found, redirect to create school
          navigate('/create-school')
          return
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('schoolFormData')
    navigate('/')
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-success text-success-foreground'
      : 'bg-warning text-warning-foreground'
  }

  const getStatusMessage = (isActive: boolean) => {
    return isActive
      ? 'Your school is active and ready to use!'
      : 'Your school is under review. We\'ll activate it within 24-48 hours.'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">{error || 'Failed to load dashboard'}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const { user, school } = dashboardData

  return (
    <>
      <Helmet>
        <title>Dashboard - VidyalayaOne</title>
        <meta name="description" content="Your VidyalayaOne school management dashboard." />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V1</span>
                  </div>
                  <span className="font-bold text-xl text-foreground">VidyalayaOne</span>
                </Link>
                <div className="hidden md:block h-6 w-px bg-border"></div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold">Dashboard</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user.firstName}!
            </h2>
            <p className="text-muted-foreground">
              Here's an overview of your school on VidyalayaOne platform
            </p>
          </div>

          {/* Status Alert */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(school.isActive)}`}>
                  {school.isActive ? 'Active' : 'Pending Approval'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{getStatusMessage(school.isActive)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Payment Plan</p>
                  <Badge variant={school.plan ? 'default' : 'secondary'}>
                    {school.plan ? school.plan.toUpperCase() : 'PENDING'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* School Information */}
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>
                  Your registered school details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School Name</p>
                  <p className="text-lg font-semibold">{school.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p>{school.city}, {school.state}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                    <p>{school.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{Array.isArray(school.phone) ? school.phone.join(', ') : school.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Your current plan and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={school.plan ? 'default' : 'secondary'}>
                      {school.plan ? school.plan.toUpperCase() : 'NO PLAN'}
                    </Badge>
                    {school.plan && (
                      <span className="text-sm text-success">✓ Paid</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={school.isActive ? 'default' : 'secondary'}>
                      {school.isActive ? 'ACTIVE' : 'PENDING APPROVAL'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">School ID</p>
                  <p className="font-mono text-sm">{school.id}</p>
                </div>

                {!school.plan && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-warning">Payment Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete your payment to activate all features
                    </p>
                    <Button 
                      onClick={() => navigate('/payment')} 
                      className="mt-2 w-full"
                      size="sm"
                    >
                      Complete Payment
                    </Button>
                  </div>
                )}

                {school.plan && !school.isActive && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800">Under Review</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Your school is being reviewed. You'll be notified once approved.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to set up and use your VidyalayaOne platform
                </p>
                <Button className="w-full" variant="outline">
                  View Getting Started Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help? Our support team is here to assist you
                </p>
                <Button className="w-full" variant="outline">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule training sessions for your staff
                </p>
                <Button className="w-full" variant="outline">
                  Book Training
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}

export default Dashboard
