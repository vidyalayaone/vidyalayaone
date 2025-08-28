import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { env } from '@/lib/env'

interface LoginFormData {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  data?: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      roleId: string
      roleName: string
    }
  }
  error?: { message: string }
  message?: string
}

interface SchoolStatusResponse {
  success: boolean
  data?: {
    school?: {
      id: string
      name: string
      isActive: boolean
      plan: string | null
    }
  }
  error?: string
  message?: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })

  useEffect(() => {
    // Check for success message from previous page (e.g., registration completion)
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message)
    }
  }, [location.state])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const checkSchoolStatus = async (token: string) => {
    try {
      const response = await fetch(`${env.SCHOOL_API_URL}/school/my-school`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result: SchoolStatusResponse = await response.json()
      
      if (response.ok && result.success && result.data?.school) {
        const school = result.data.school
        
        // If school exists but no payment plan, redirect to payment
        if (!school.plan || school.plan === 'null') {
          navigate('/payment')
        } else {
          // School exists with payment, go to dashboard
          navigate('/dashboard')
        }
      } else {
        // No school found, redirect to create school
        navigate('/create-school')
      }
    } catch (error) {
      console.error('Error checking school status:', error)
      // Default to create school if API fails
      navigate('/create-school')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${env.AUTH_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Context': 'platform'
        },
        body: JSON.stringify(formData)
      })

      const result: LoginResponse = await response.json()

      if (response.ok && result.success && result.data) {
        // Store auth tokens and user data
        localStorage.setItem('authToken', result.data.accessToken)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // Check school status to determine where to redirect
        await checkSchoolStatus(result.data.accessToken)
      } else {
        const errorMsg = result.error?.message || result.message || 'Login failed. Please check your credentials.'
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - VidyalayaOne</title>
        <meta name="description" content="Sign in to your VidyalayaOne account to manage your school." />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">V1</span>
              </div>
              <span className="font-bold text-xl text-white">VidyalayaOne</span>
            </Link>
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-white/80">Sign in to your account to continue</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your username"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              to="/"
              className="text-white/60 hover:text-white text-sm underline"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
