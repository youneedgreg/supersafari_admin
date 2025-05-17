"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      try {
        console.log('Checking authentication...')
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        console.log('Auth check response status:', response.status)
        
        // Check if the response is actually JSON
        const contentType = response.headers.get('content-type')
        console.log('Response content type:', contentType)
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Not a JSON response')
          setCheckingAuth(false)
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          console.log('Auth check failed:', errorData)
          setCheckingAuth(false)
          return
        }
        
        const data = await response.json()
        console.log('Auth check successful:', data)
        if (data.status === 'OK') {
          toast.success('Already logged in')
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.email || !formData.password || !formData.role) {
        throw new Error('Please fill in all fields')
      }

      console.log('Attempting login for:', { email: formData.email, role: formData.role })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      console.log('Login response status:', response.status)
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()))

      // Check if the response is JSON
      const contentType = response.headers.get('content-type')
      console.log('Login response content type:', contentType)
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format')
      }

      const data = await response.json()
      console.log('Login response data:', data)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password')
        }
        throw new Error(data.message || 'Login failed')
      }

      if (data.status === 'OK') {
        console.log('Login successful, checking cookies...')
        // Log all cookies
        console.log('Document cookies:', document.cookie)
        
        toast.success('Login successful! Redirecting...')
        // Small delay to show the success message before redirect
        setTimeout(() => {
          // Force a hard navigation to clear any cached state
          window.location.href = '/'
        }, 1000)
      } else {
        toast.error(data.message || 'Login failed')
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {checkingAuth ? (
        <Card className="w-[400px] p-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-4 text-gray-600">Checking authentication status...</p>
        </Card>
      ) : (
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Super Africa Admin</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={handleRoleChange} disabled={isLoading} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Secure authentication system
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}