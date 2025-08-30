import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { env } from '@/lib/env'

interface PaymentState {
  isProcessing: boolean
  orderId: string | null
  error: string | null
}

interface SchoolDetails {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  isActive: boolean
}

interface OrderResponse {
  success: boolean
  data?: {
    order: {
      id: string
      amount: number
      status: string
    }
  }
  error?: string
}

interface PaymentVerificationResponse {
  success: boolean
  data?: {
    payment: {
      id: string
      status: string
      amount: number
    }
  }
  error?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

const Payment: React.FC = () => {
  const navigate = useNavigate()
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    orderId: null,
    error: null
  })
  
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const planDetails = {
    name: 'Basic Plan',
    price: 1,
    period: 'one-time',
    features: [
      'Complete school management system',
      'Student information management',
      'Attendance tracking',
      'Grade management',
      'Parent communication portal',
      'Fee management',
      'Basic reports and analytics',
      'Email support',
      'Mobile app access'
    ]
  }

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    const fetchSchoolDetails = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`${env.AUTH_API_URL}/auth/my-school`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()
        
        if (response.ok && result.success && result.data?.school) {
          setSchoolDetails(result.data.school)
          
          // If already paid, redirect to dashboard
          if (result.data.school.plan && result.data.school.plan !== 'null') {
            navigate('/dashboard')
            return
          }
        } else {
          // No school found, redirect to create school
          navigate('/create-school')
          return
        }
      } catch (error) {
        console.error('Error fetching school details:', error)
        setPaymentState(prev => ({ ...prev, error: 'Failed to load school details' }))
      } finally {
        setIsLoading(false)
      }
    }

    const initializePage = async () => {
      await loadRazorpayScript()
      await fetchSchoolDetails()
    }

    initializePage()
  }, [navigate])

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return null
      }

      const response = await fetch(`${env.PAYMENT_API_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: planDetails.price,
          currency: 'INR',
          schoolId: schoolDetails?.id
        })
      })

      const result: OrderResponse = await response.json()
      
      if (result.success && result.data) {
        return result.data.order
      } else {
        throw new Error(result.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      throw error
    }
  }

  const verifyPayment = async (paymentData: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${env.PAYMENT_API_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          schoolId: schoolDetails?.id
        })
      })

      const result: PaymentVerificationResponse = await response.json()
      
      if (result.success) {
        // Payment successful, redirect to dashboard
        navigate('/dashboard')
      } else {
        throw new Error(result.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      let errorMessage = 'Payment verification failed. Please contact support.'
      
      if (error instanceof Error) {
        // Try to extract meaningful error message
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      setPaymentState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isProcessing: false 
      }))
    }
  }

  const handlePayment = async () => {
    if (!schoolDetails) return

    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const order = await createOrder()
      
      if (!order) {
        throw new Error('Failed to create payment order')
      }

      setPaymentState(prev => ({ ...prev, orderId: order.id }))

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: order.amount,
        currency: 'INR',
        name: 'VidyalayaOne',
        description: 'Basic Plan - School Management System',
        order_id: order.id,
        handler: async (response: any) => {
          await verifyPayment(response)
        },
        prefill: {
          name: schoolDetails.name,
          email: schoolDetails.email,
          contact: schoolDetails.phone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPaymentState(prev => ({ ...prev, isProcessing: false }))
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment initiation error:', error)
      setPaymentState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Payment failed. Please try again.',
        isProcessing: false 
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!schoolDetails) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <p>School details not found. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Complete Payment - VidyalayaOne</title>
        <meta name="description" content="Complete your payment to activate your VidyalayaOne school management system." />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Complete Your Payment</h1>
            <p className="text-white/80 text-lg">Just one step away from activating your school management system</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* School Details */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">School Details</CardTitle>
                <CardDescription>
                  Confirm your school information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School Name</p>
                  <p className="text-lg font-semibold">{schoolDetails.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p>{schoolDetails.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">State</p>
                    <p>{schoolDetails.state}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p>{schoolDetails.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{schoolDetails.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary">
                    {schoolDetails.isActive ? 'Active' : 'Pending Approval'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Plan Details</CardTitle>
                <CardDescription>
                  Complete your payment to activate these features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-6 border rounded-lg bg-primary/5">
                    <h3 className="text-2xl font-bold text-primary">{planDetails.name}</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">₹{planDetails.price}</span>
                      <span className="text-muted-foreground ml-2">{planDetails.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Special launch offer</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Included Features:</h4>
                    <ul className="space-y-2">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="text-success mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {paymentState.error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                      {paymentState.error}
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">🧪 Test Mode</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        This is test environment. Use these test credentials:
                      </p>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li><strong>UPI:</strong> success@razorpay</li>
                        <li><strong>Card:</strong> 4111 1111 1111 1111</li>
                        <li><strong>Expiry:</strong> 12/25, CVV: 123</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{planDetails.price}</span>
                    </div>
                    
                    <Button
                      onClick={handlePayment}
                      size="lg"
                      className="w-full"
                      disabled={paymentState.isProcessing}
                    >
                      {paymentState.isProcessing ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Secure payment powered by Razorpay
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@vidyalayaone.com" className="text-white underline">
                support@vidyalayaone.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Payment
