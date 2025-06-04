"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ClipboardList, CreditCard, Home, Mail, Menu, MessageSquare, Users, LogOut, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Mail,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: CreditCard,
  },
  {
    title: "CRM Notes",
    href: "/notes",
    icon: MessageSquare,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: ClipboardList,
    adminOnly: true,
  },
]

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [editProfile, setEditProfile] = useState({ name: '', email: '' })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        
        if (data.status === 'OK') {
          setUserRole(data.user.role)
          // Fetch user profile
          const profileResponse = await fetch('/api/auth/profile')
          const profileData = await profileResponse.json()
          if (profileData.status === 'OK') {
            setUserProfile(profileData.user)
            setEditProfile({
              name: profileData.user.name,
              email: profileData.user.email
            })
          }
        }
      } catch (error) {
        console.error('Failed to check auth:', error)
      }
    }
    
    checkAuth()
  }, [])

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProfile),
      })

      const data = await response.json()
      
      if (data.status === 'OK') {
        setUserProfile(editProfile)
        setIsProfileOpen(false)
        toast.success('Profile updated successfully')
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = async () => {
    try {
      // Clear the auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center">
              <span className="text-xl font-bold text-green-600">Super Africa Admin</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                // Skip admin-only items if user is not admin
                if (item.adminOnly && userRole !== 'admin') {
                  return null
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 p-4">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{userProfile?.name || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">{userProfile?.email || 'Loading...'}</p>
                  </div>
                  <Settings className="ml-auto h-4 w-4 text-gray-400" />
                </div>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
