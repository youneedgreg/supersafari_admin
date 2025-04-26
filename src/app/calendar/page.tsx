"use client"

import { useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon,  User} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock calendar events - Complete list with various types
const mockEvents = [
  {
    id: 1,
    title: "Smith Arrival",
    date: new Date(2025, 3, 15), // April 15, 2025
    type: "arrival",
    clientId: 1,
    details: "Safari Lodge • 2 guests"
  },
  {
    id: 2,
    title: "Smith Departure",
    date: new Date(2025, 3, 25), // April 25, 2025
    type: "departure",
    clientId: 1,
    details: "Safari Lodge • 2 guests"
  },
  {
    id: 3,
    title: "Williams Arrival",
    date: new Date(2025, 3, 18), // April 18, 2025
    type: "arrival",
    clientId: 2,
    details: "Sunset Camp • 1 guest"
  },
  {
    id: 4,
    title: "Williams Departure",
    date: new Date(2025, 3, 28), // April 28, 2025
    type: "departure",
    clientId: 2,
    details: "Sunset Camp • 1 guest"
  },
  {
    id: 5,
    title: "Thompson Arrival",
    date: new Date(2025, 3, 20), // April 20, 2025
    type: "arrival",
    clientId: 3,
    details: "River View • 4 guests"
  },
  {
    id: 6,
    title: "Thompson Departure",
    date: new Date(2025, 4, 1), // May 1, 2025
    type: "departure",
    clientId: 3,
    details: "River View • 4 guests"
  },
  {
    id: 7,
    title: "Book flights for Thompson",
    date: new Date(2025, 3, 10), // April 10, 2025
    type: "task",
    clientId: 3,
    details: "Deadline for booking"
  },
  {
    id: 8,
    title: "Confirm hotel for Smith",
    date: new Date(2025, 3, 9), // April 9, 2025
    type: "task",
    clientId: 1,
    details: "Call Safari Lodge to confirm"
  },
  {
    id: 9,
    title: "Garcia Family Arrival",
    date: new Date(2025, 4, 10), // May 10, 2025
    type: "arrival",
    clientId: 4,
    details: "Luxury Tent • 3 guests"
  },
  {
    id: 10,
    title: "Garcia Family Departure",
    date: new Date(2025, 4, 17), // May 17, 2025
    type: "departure",
    clientId: 4,
    details: "Luxury Tent • 3 guests"
  },
  {
    id: 11,
    title: "Anderson Safari Tour",
    date: new Date(2025, 5, 5), // June 5, 2025
    type: "arrival",
    clientId: 5,
    details: "Premium Package • 2 guests"
  },
  {
    id: 12,
    title: "Anderson Tour End",
    date: new Date(2025, 5, 12), // June 12, 2025
    type: "departure",
    clientId: 5,
    details: "Premium Package • 2 guests"
  },
  {
    id: 13,
    title: "Miller Family Arrival",
    date: new Date(2025, 6, 15), // July 15, 2025
    type: "arrival",
    clientId: 6,
    details: "Family Lodge • 5 guests"
  },
  {
    id: 14,
    title: "Miller Family Departure",
    date: new Date(2025, 6, 25), // July 25, 2025
    type: "departure",
    clientId: 6,
    details: "Family Lodge • 5 guests"
  },
  {
    id: 15,
    title: "Brown Anniversary Trip",
    date: new Date(2025, 7, 10), // August 10, 2025
    type: "arrival",
    clientId: 7,
    details: "Honeymoon Suite • 2 guests"
  },
  {
    id: 16,
    title: "Brown Anniversary End",
    date: new Date(2025, 7, 17), // August 17, 2025
    type: "departure",
    clientId: 7,
    details: "Honeymoon Suite • 2 guests"
  },
  {
    id: 17,
    title: "Wilson Photography Tour",
    date: new Date(2025, 8, 3), // September 3, 2025
    type: "arrival",
    clientId: 8,
    details: "Photography Special • 1 guest"
  },
  {
    id: 18,
    title: "Wilson Tour End",
    date: new Date(2025, 8, 10), // September 10, 2025
    type: "departure",
    clientId: 8,
    details: "Photography Special • 1 guest"
  },
  {
    id: 19,
    title: "Staff Training Day",
    date: new Date(2025, 3, 5), // April 5, 2025
    type: "task",
    clientId: null,
    details: "Annual safety training"
  },
  {
    id: 20,
    title: "Maintenance - Lodge 3",
    date: new Date(2025, 4, 5), // May 5, 2025
    type: "task",
    clientId: null,
    details: "Scheduled repairs"
  },
  {
    id: 21,
    title: "Vehicle Service Day",
    date: new Date(2025, 5, 15), // June 15, 2025
    type: "task",
    clientId: null,
    details: "All safari vehicles"
  },
  {
    id: 22,
    title: "Park Closure Day",
    date: new Date(2025, 6, 10), // July 10, 2025
    type: "task",
    clientId: null,
    details: "National holiday"
  }
]

export default function EnhancedCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date())
  const [viewEventsOpen, setViewEventsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([])

  // Generate an array of the next 6 months
  const getMonthsToDisplay = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentViewDate);
      date.setMonth(currentViewDate.getMonth() + i);
      months.push(date);
    }
    return months;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  // Get event type indicator color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "arrival":
        return "bg-amber-500";
      case "departure":
        return "bg-green-500";
      case "task":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get event type badge style
  const getEventTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "arrival":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "departure":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "task":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    setSelectedDateEvents(events);
    if (events.length > 0) {
      setViewEventsOpen(true);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  // Navigate to previous 6 months
  const previousMonths = () => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(currentViewDate.getMonth() - 6);
    setCurrentViewDate(newDate);
  };

  // Navigate to next 6 months
  const nextMonths = () => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(currentViewDate.getMonth() + 6);
    setCurrentViewDate(newDate);
  };

  // Reset to current month
  const goToToday = () => {
    setCurrentViewDate(new Date());
  };

  // Group events by type for a specific date
  const getEventsByType = (date: Date) => {
    const events = getEventsForDate(date);
    const eventTypes = new Set(events.map(event => event.type));
    return Array.from(eventTypes);
  };

  // Custom calendar rendering
  const renderCalendarMonth = (month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Adjust the start date to begin with the appropriate day of the week (Sunday = 0)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Ensure we have complete weeks
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // Array of weekday headers
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Generate all dates to display
    const calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      calendarDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Split into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="border rounded-md p-2 h-full flex flex-col">
        <div className="text-center font-medium mb-2">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {weekDays.map((day, index) => (
                <th key={index} className="text-xs font-medium text-center p-1">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = day.getMonth() === month.getMonth();
                  const isToday = new Date().toDateString() === day.toDateString();
                  const isSelected = selectedDate.toDateString() === day.toDateString();
                  const eventTypes = getEventsByType(day);
                  const hasEvents = eventTypes.length > 0;
                  
                  return (
                    <td 
                      key={dayIndex} 
                      className={`text-center p-1 relative ${
                        isCurrentMonth ? '' : 'text-gray-300'
                      } ${isToday ? 'bg-green-50' : ''} ${
                        isSelected ? 'bg-green-100' : ''
                      } hover:bg-gray-100 cursor-pointer`}
                      onClick={() => isCurrentMonth && handleDateSelect(day)}
                    >
                      <div className="w-7 h-7 mx-auto flex items-center justify-center relative">
                        {day.getDate()}
                        {hasEvents && isCurrentMonth && (
                          <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
                            {eventTypes.map((type, index) => (
                              <div 
                                key={index} 
                                className={`h-1 w-1 rounded-full ${getEventTypeColor(type)}`}
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="col-span-1 overflow-hidden">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-green-600" />
              6-Month Calendar View
            </CardTitle>
            <CardDescription>Plan your safari schedule in advance</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex">
              <Button variant="outline" size="sm" className="rounded-r-none" onClick={previousMonths}>
                <span className="h-4 w-4">←</span>
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-l-none" onClick={nextMonths}>
                <span className="h-4 w-4">→</span>
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMonthsToDisplay().map((month, index) => (
              <div key={index} className="min-h-[220px]">
                {renderCalendarMonth(month)}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-xs text-gray-600">Arrival</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-600">Departure</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-600">Task</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Most recent scheduled events</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockEvents
              .filter(event => event.date >= new Date()) // Only future events
              .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by date
              .slice(0, 5) // Get only 5 events
              .map(event => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getEventTypeBadgeStyle(event.type)} mr-4`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {event.date.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric", 
                          year: "numeric" 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{event.details}</p>
                    </div>
                  </div>
                  <Badge className={getEventTypeBadgeStyle(event.type)}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* View Events Dialog */}
      <Dialog open={viewEventsOpen} onOpenChange={setViewEventsOpen} >
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Events for {formatDate(selectedDate)}</DialogTitle>
            <DialogDescription>
              {selectedDateEvents.length === 0 
                ? "No events scheduled for this day." 
                : `${selectedDateEvents.length} event(s) scheduled.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getEventTypeBadgeStyle(event.type)} mr-4`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.details}</p>
                    </div>
                  </div>
                  <Badge className={getEventTypeBadgeStyle(event.type)}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">
                No events scheduled for this day. Click &quot;Add Event&quot; to schedule something.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEventsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}