"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        // Check if the response is actually JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          // Not a JSON response, probably a redirect or HTML page
          return
        }
        
        if (!response.ok) {
          return
        }
        
        const data = await response.json()
        if (data.status === 'OK') {
          router.push('/')
        }
      } catch (error) {
        // Not logged in or error occurred, stay on login page
        console.log('Auth check error:', error)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      // Check if the response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format')
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password')
        }
        throw new Error(data.message || 'Login failed')
      }

      if (data.status === 'OK') {
        toast.success('Login successful')
        // Force a hard navigation to clear any cached state
        window.location.href = '/'
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred during login')
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
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Super Africa Admin</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={handleRoleChange} required>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}