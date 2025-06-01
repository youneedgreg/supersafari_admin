"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Clock, Filter, Loader2, MoreHorizontal, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Define types
interface Notification {
  id: number
  title: string
  message: string
  timestamp: string
  type: string
  read: boolean
  clientId: number | null
  clientName: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to load notifications", {
        description: "There was an error loading your notifications. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Mark a notification as read or unread
  const handleToggleRead = async (notification: Notification) => {
    try {
      const newReadStatus = !notification.read
      
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: notification.id,
          read: newReadStatus
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as ${newReadStatus ? 'read' : 'unread'}`)
      }
      
      toast.success(`Notification marked as ${newReadStatus ? 'read' : 'unread'}`)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, read: newReadStatus } 
            : n
        )
      )
    } catch (error) {
      console.error("Error updating notification:", error)
      toast.error(`Failed to mark notification as ${!notification.read ? 'read' : 'unread'}`, {
        description: "There was an error updating the notification. Please try again.",
      })
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true)
      
      const response = await fetch("/api/notifications", {
        method: "PATCH"
      })
      
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }
      
      toast.success("All notifications marked as read")
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.error("Failed to mark all as read", {
        description: "There was an error updating notifications. Please try again.",
      })
    } finally {
      setMarkingAllRead(false)
    }
  }

  // Delete a notification
  const handleDeleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }
      
      toast.success("Notification deleted")
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification", {
        description: "There was an error deleting the notification. Please try again.",
      })
    }
  }

  // View notification details
  const handleViewDetails = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleToggleRead(notification)
    }
    
    // Show details in a toast for now
    // In a real application, you could navigate to a details page or show a modal
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    })
  }

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by tab
    if (activeTab === "unread" && notification.read) return false
    if (activeTab === "read" && !notification.read) return false

    // Filter by search query
    if (searchQuery === "") return true
    return (
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.clientName && notification.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // Get notification type badge color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-purple-100 text-purple-800"
      case "payment":
        return "bg-green-100 text-green-800"
      case "task":
        return "bg-amber-100 text-amber-800"
      case "reservation":
        return "bg-blue-100 text-blue-800"
      case "reminder":
        return "bg-red-100 text-red-800"
      case "invoice":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Check if there are unread notifications
  const hasUnreadNotifications = notifications.some(n => !n.read)

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with system notifications</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead || !hasUnreadNotifications}
          >
            {markingAllRead ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Notification tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        {/* Notification list */}
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-500">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${!notification.read ? "border-l-4 border-l-green-600" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${getNotificationTypeColor(notification.type)} mr-4`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <Badge className={getNotificationTypeColor(notification.type)}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              {notification.read ? (
                                <DropdownMenuItem onClick={() => handleToggleRead(notification)}>
                                  Mark as Unread
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleToggleRead(notification)}>
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleViewDetails(notification)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 mt-2 space-y-1 md:space-y-0 md:space-x-4">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {notification.timestamp}
                        </div>
                        {notification.clientName && (
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            Client: {notification.clientName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}