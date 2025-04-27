"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Clock, Filter, MoreHorizontal, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    title: "Booking Confirmed",
    message: "Flight booking for Thompson Family has been confirmed.",
    timestamp: "2 hours ago",
    type: "booking",
    read: false,
    clientId: 3,
    clientName: "Thompson Family",
  },
  {
    id: 2,
    title: "Payment Received",
    message: "Deposit payment of $1,500 received from Maria Garcia.",
    timestamp: "5 hours ago",
    type: "payment",
    read: false,
    clientId: 4,
    clientName: "Maria Garcia",
  },
  {
    id: 3,
    title: "Task Due Soon",
    message: "Task 'Confirm hotel for Smith couple' is due in 2 days.",
    timestamp: "1 day ago",
    type: "task",
    read: false,
    clientId: 1,
    clientName: "John & Sarah Smith",
  },
  {
    id: 4,
    title: "New Reservation",
    message: "New reservation request from Chen Family.",
    timestamp: "2 days ago",
    type: "reservation",
    read: true,
    clientId: 5,
    clientName: "Chen Family",
  },
  {
    id: 5,
    title: "Client Arrival Reminder",
    message: "David Williams will be arriving in 3 days.",
    timestamp: "3 days ago",
    type: "reminder",
    read: true,
    clientId: 2,
    clientName: "David Williams",
  },
  {
    id: 6,
    title: "Invoice Sent",
    message: "Invoice #1234 has been sent to Thompson Family.",
    timestamp: "4 days ago",
    type: "invoice",
    read: true,
    clientId: 3,
    clientName: "Thompson Family",
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter notifications based on active tab and search query
  const filteredNotifications = mockNotifications.filter((notification) => {
    // Filter by tab
    if (activeTab === "unread" && notification.read) return false
    if (activeTab === "read" && !notification.read) return false

    // Filter by search query
    if (searchQuery === "") return true
    return (
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.clientName.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with system notifications</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <Check className="mr-2 h-4 w-4" />
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
          {filteredNotifications.length === 0 ? (
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
                                <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
