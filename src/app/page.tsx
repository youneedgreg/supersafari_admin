"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronRight, ClipboardList, Clock, Plus, Users } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock data for dashboard
  const stats = [
    { title: "Total Clients", value: 124, icon: Users, color: "bg-green-100 text-green-600" },
    { title: "Planning", value: 18, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { title: "Confirmed", value: 42, icon: Users, color: "bg-amber-100 text-amber-600" },
    { title: "Booked", value: 36, icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Completed", value: 28, icon: Users, color: "bg-emerald-100 text-emerald-600" },
  ]

  const upcomingArrivals = [
    { name: "John & Sarah Smith", date: "May 15, 2023", guests: 2, status: "Confirmed" },
    { name: "David Williams", date: "May 18, 2023", guests: 1, status: "Booked" },
    { name: "Thompson Family", date: "May 20, 2023", guests: 4, status: "Confirmed" },
  ]

  const pendingTasks = [
    { title: "Book flight for Thompson Family", due: "May 10, 2023", priority: "High" },
    { title: "Send invoice to David Williams", due: "May 8, 2023", priority: "Medium" },
    { title: "Confirm hotel for Smith couple", due: "May 9, 2023", priority: "High" },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to your safari management system</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calendar Card */}
        {/* Calendar Card */}
<Card className="col-span-1 overflow-hidden">
  <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
    <div>
      <CardTitle className="text-xl font-semibold flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5 text-green-600" />
        Calendar
      </CardTitle>
      <CardDescription>Manage your schedule and arrivals</CardDescription>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div className="mr-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-amber-400 mr-1"></div>
          <span className="text-xs text-gray-500">Arrival</span>
        </div>
        <div className="mr-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-xs text-gray-500">Departure</span>
        </div>
      </div>
      <Link href="/calendar">
        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <div className="p-4">
      <Calendar 
        mode="single" 
        selected={date} 
        onSelect={setDate} 
        className="rounded-md" 
      />
    </div>
    <div className="border-t p-3 bg-gray-50">
      <h3 className="text-sm font-medium mb-2">Today&apos;s Schedule</h3>
      {date?.getDate() === 15 ? (
        <div className="text-sm p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
          <div className="font-medium">John & Sarah Smith Arrival</div>
          <div className="text-xs">2 guests • Safari Lodge</div>
        </div>
      ) : date?.getDate() === 18 ? (
        <div className="text-sm p-2 rounded bg-green-50 border border-green-200 text-green-800">
          <div className="font-medium">David Williams Departure</div>
          <div className="text-xs">1 guest • Sunset Camp</div>
        </div>
      ) : date?.getDate() === 20 ? (
        <div className="text-sm p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
          <div className="font-medium">Thompson Family Arrival</div>
          <div className="text-xs">4 guests • River View</div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No scheduled events for this day</div>
      )}
    </div>
  </CardContent>
</Card>

        {/* Upcoming Arrivals */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Upcoming Arrivals</CardTitle>
              <CardDescription>Guests arriving in the next 7 days</CardDescription>
            </div>
            <Link href="/clients">
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingArrivals.map((arrival, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{arrival.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {arrival.date} • {arrival.guests} guests
                    </div>
                  </div>
                  <Badge
                    className={
                      arrival.status === "Confirmed"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                    }
                  >
                    {arrival.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </div>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    Due: {task.due}
                  </div>
                </div>
                <Badge
                  className={
                    task.priority === "High"
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
