import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/authClient'

// Using generic ApiResult from authClient

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [pendingData, setPendingData] = useState<{
    user_id: string
    username: string
    phone: string
  } | null>(null)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get pending verification data
    const storedData = localStorage.getItem('pendingVerification')
    if (!storedData) {
      navigate('/register')
      return
    }

    try {
      const data = JSON.parse(storedData)
      setPendingData(data)
    } catch (error) {
      console.error('Error parsing pending verification data:', error)
      navigate('/register')
    }
  }, [navigate])

  useEffect(() => {
    // Start countdown timer
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(intervalId)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    setError(null)

    // Focus on the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (!pendingData) {
      setError('Verification data not found. Please register again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
  const result = await authClient.verifyRegistrationOtp(pendingData.username, otpValue)

  if (result.success) {
        // Clear pending verification data
        localStorage.removeItem('pendingVerification')
        
        // Show success message and redirect to login
        navigate('/login', { 
          state: { 
            message: 'Registration completed successfully! Please login to continue.',
            type: 'success'
          }
        })
      } else {
        const errorMsg = result.error?.message || result.message || 'OTP verification failed. Please try again.'
        setError(errorMsg)
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingData || !canResend) return

    setIsResending(true)
    setError(null)

    try {
  const result = await authClient.resendOtp(pendingData.username)

  if (result.success) {
        setTimer(60)
        setCanResend(false)
        setOtp(['', '', '', '', '', ''])
        // Focus on first input
        inputRefs.current[0]?.focus()
      } else {
        const errorMsg = result.error?.message || result.message || 'Failed to resend OTP. Please try again.'
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (!pendingData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Verify OTP - VidyalayaOne</title>
        <meta name="description" content="Verify your phone number to complete registration." />
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
            <h2 className="text-3xl font-bold text-white">Verify your phone</h2>
            <p className="mt-2 text-white/80">
              We've sent a 6-digit code to {pendingData.phone}
            </p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Enter verification code</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-medium border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                {canResend ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isResending}
                  >
                    {isResending ? 'Resending...' : 'Resend OTP'}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in {timer} seconds
                  </p>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Want to change your phone number?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:underline"
                    onClick={() => localStorage.removeItem('pendingVerification')}
                  >
                    Go back to registration
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default VerifyOtp
