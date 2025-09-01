import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/authClient'

interface RegisterFormData {
  username: string
  phone: string
  password: string
  confirmPassword: string
}

interface RegisterResponse {
  success: boolean
  data?: {
    user_id: string
    phone: string
  }
  error?: { message: string }
  message?: string
}

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be between 10 and 15 digits')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const result: RegisterResponse = await authClient.register(
        formData.username,
        formData.phone.replace(/\D/g, ''),
        formData.password
      )

      if (result.success && result.data) {
        // Store user data for OTP verification
        localStorage.setItem('pendingVerification', JSON.stringify({
          user_id: result.data.user_id,
          username: formData.username,
          phone: result.data.phone
        }))
        
        // Redirect to OTP verification page
        navigate('/verify-otp')
      } else {
        const rawMsg = result.error?.message || result.message || 'Registration failed. Please try again.'
        if (/DEFAULT role is missing/i.test(rawMsg)) {
          setError('System misconfiguration: DEFAULT role missing. Run auth DB seed: "docker compose exec auth-service sh -c \"pnpm db:clean --yes && pnpm db:seed\""')
        } else {
          setError(rawMsg)
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Register - VidyalayaOne</title>
        <meta name="description" content="Create your VidyalayaOne account to get started with modern school management." />
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
            <h2 className="text-3xl font-bold text-white">Create your account</h2>
            <p className="mt-2 text-white/80">Join thousands of schools using VidyalayaOne</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>
                Fill in your details to create your account. We'll send an OTP to verify your phone number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Username *"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your username"
                />

                <Input
                  label="Phone Number *"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="9876543210"
                />

                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />

                <Input
                  label="Confirm Password *"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-white/60 text-xs">
            <p>
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-white">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
