import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { env } from '@/lib/env'

interface SchoolFormData {
  name: string
  schoolCode: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website: string
  principalName: string
  principalPhone: string
  studentStrength: string
  schoolType: string
  boards: string[]
  establishedYear: string
}

interface CreateSchoolResponse {
  success: boolean
  data?: {
    school: {
      id: string
      name: string
      isActive: boolean
    }
  }
  error?: string
  message?: string
}

const CreateSchool: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRestoringData, setIsRestoringData] = useState(true)
  
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    schoolCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalPhone: '',
    studentStrength: '',
    schoolType: '',
    boards: [],
    establishedYear: ''
  })

  const schoolTypes = [
    'Primary School',
    'Secondary School',
    'Higher Secondary School',
    'CBSE Affiliated',
    'ICSE Affiliated',
    'State Board',
    'International School',
    'Montessori School',
    'Play School/Pre-Primary'
  ]

  const availableBoards = [
    'CBSE',
    'ICSE',
    'State Board',
    'IB (International Baccalaureate)',
    'Cambridge International',
    'Montessori',
    'Other'
  ]

  // Check for existing incomplete school data on component mount
  useEffect(() => {
    const checkExistingSchool = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return
      }

      try {
  // Adjust to singular service base path. Using correct /school/my-school endpoint.
  const response = await fetch(`${env.SCHOOL_API_URL}/school/my-school`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()
        
        if (response.ok && result.success && result.data?.school) {
          const school = result.data.school
          
          // If school exists but no payment, restore form data and go to payment
          if (!school.plan || school.plan === 'null') {
            // If we have saved form data, restore it
            const savedFormData = localStorage.getItem('schoolFormData')
            if (savedFormData) {
              setFormData(JSON.parse(savedFormData))
            }
            
            // If school was already created but payment pending, go to payment
            if (school.id) {
              navigate('/payment')
              return
            }
          } else {
            // School exists with payment, go to dashboard
            navigate('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error checking school status:', error)
      } finally {
        setIsRestoringData(false)
      }
    }

    checkExistingSchool()
  }, [navigate])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('schoolFormData', JSON.stringify(formData))
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleBoardChange = (board: string) => {
    setFormData(prev => ({
      ...prev,
      boards: prev.boards.includes(board)
        ? prev.boards.filter(b => b !== board)
        : [...prev.boards, board]
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('School name is required')
      return false
    }
    if (!formData.schoolCode.trim()) {
      setError('School code is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('School address is required')
      return false
    }
    if (!formData.city.trim()) {
      setError('City is required')
      return false
    }
    if (!formData.state.trim()) {
      setError('State is required')
      return false
    }
    if (!formData.pincode.trim()) {
      setError('Pincode is required')
      return false
    }
    if (!formData.phone.trim()) {
      setError('School phone number is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('School email is required')
      return false
    }
    if (!formData.principalName.trim()) {
      setError('Principal name is required')
      return false
    }
    if (!formData.schoolType) {
      setError('Please select school type')
      return false
    }
    // Optional: established year sanity check (backend requires 1800..currentYear)
    if (formData.establishedYear) {
      const yearNum = Number(formData.establishedYear)
      const currentYear = new Date().getFullYear()
      if (Number.isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
        setError(`Established Year must be between 1800 and ${currentYear}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
        return
      }

      // Map UI form fields to API schema
      const establishedYearValid = formData.establishedYear ? Number(formData.establishedYear) : undefined
      const currentYear = new Date().getFullYear()
      const payload = {
        name: formData.name.trim(),
        subdomain: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'').slice(0,50) || 'school',
        address: {
          address1: formData.address || 'Address line 1',
          locality: formData.city || 'Locality',
            city: formData.city || 'City',
            state: formData.state || 'State',
            country: 'India',
            pinCode: formData.pincode || '000000',
        },
        level: 'mixed', // fallback level
        board: formData.boards[0] || 'CBSE',
        schoolCode: formData.schoolCode.trim(),
        phoneNumbers: [formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`],
        email: formData.email || undefined,
        principalName: formData.principalName || undefined,
        establishedYear: establishedYearValid && establishedYearValid >= 1800 && establishedYearValid <= currentYear ? establishedYearValid : undefined,
        language: 'English',
        metaData: {
          website: formData.website || undefined,
          studentStrength: formData.studentStrength || undefined,
          boards: formData.boards,
          schoolType: formData.schoolType,
        }
      };

  console.log('[CreateSchool] Payload:', payload);
  const response = await fetch(`${env.SCHOOL_API_URL}/school/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Context': 'platform'
        },
        body: JSON.stringify(payload)
      })

      const result: CreateSchoolResponse = await response.json()

      if (response.ok && result.success) {
        // Clear saved form data since school is created
        localStorage.removeItem('schoolFormData')
        
        // Redirect to payment page
        navigate('/payment')
      } else {
        const backendErr: any = (result as any).error || {}
        // Prefer first zod issue message if present
        const issueMsg = Array.isArray(backendErr.issues) && backendErr.issues.length > 0 ? backendErr.issues[0].message : null
        const errVal = issueMsg || backendErr.message || (result as any).message || 'Failed to create school. Please try again.'
        setError(errVal)
      }
    } catch (error) {
      console.error('Create school error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isRestoringData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Create School - VidyalayaOne</title>
        <meta name="description" content="Set up your school profile on VidyalayaOne platform." />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Your School Profile</h1>
            <p className="text-white/80 text-lg">Tell us about your school to get started with VidyalayaOne</p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">School Information</CardTitle>
              <CardDescription>
                Please provide accurate information about your school. This will help us set up your platform correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Basic School Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      School Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter school name"
                    />
                  </div>

                  <div>
                    <label htmlFor="schoolCode" className="block text-sm font-medium text-gray-700">
                      School Code *
                    </label>
                    <input
                      type="text"
                      id="schoolCode"
                      name="schoolCode"
                      value={formData.schoolCode}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter unique school code"
                    />
                  </div>

                  <Textarea
                    label="School Address *"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Complete address with landmarks"
                    className="min-h-[80px]"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Mumbai"
                    />
                    
                    <Input
                      label="State *"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="Maharashtra"
                    />
                    
                    <Input
                      label="Pincode *"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="400001"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="School Phone *"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 22 1234 5678"
                    />
                    
                    <Input
                      label="School Email *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="info@abcschool.com"
                    />
                  </div>

                  <Input
                    label="Website (Optional)"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.abcschool.com"
                  />
                </div>

                {/* Principal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Principal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Principal Name *"
                      name="principalName"
                      value={formData.principalName}
                      onChange={handleInputChange}
                      required
                      placeholder="Dr. Jane Smith"
                    />
                    
                    <Input
                      label="Principal Phone"
                      name="principalPhone"
                      type="tel"
                      value={formData.principalPhone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* School Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">School Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Student Strength (Approx.)"
                      name="studentStrength"
                      type="number"
                      value={formData.studentStrength}
                      onChange={handleInputChange}
                      placeholder="500"
                    />
                    
                    <Input
                      label="Established Year"
                      name="establishedYear"
                      type="number"
                      value={formData.establishedYear}
                      onChange={handleInputChange}
                      placeholder="1995"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">School Type *</label>
                      <select
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleInputChange}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select school type</option>
                        {schoolTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Boards/Curriculum (Select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableBoards.map(board => (
                        <label key={board} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.boards.includes(board)}
                            onChange={() => handleBoardChange(board)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">{board}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                  >
                    Back to Pricing
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating School...' : 'Next - Proceed to Payment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default CreateSchool
