/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, User, Plus, Filter, Calendar as CalendarComponent, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Import the EventCreationDialog component
import EventCreationDialog from "@/components/event-creation-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format, addMonths, subMonths, startOfMonth, isSameMonth, isSameDay, addDays, parseISO, startOfWeek, endOfWeek, endOfMonth } from 'date-fns'
import { cn } from "@/lib/utils"

// Import the utility functions we created
import { 
  getEventTypeBadgeStyle, 
  getEventTypeIconBg, 
  getEventTypeColor,
  getPriorityColor,
  formatReadableDate,
} from '@/lib/calendar-utils';

// Define the interfaces for our data
interface CalendarEvent {
  id: number;
  name: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  totalGuests: number;
}

// Month Calendar Component (Enhanced)
const MonthCalendar = ({
  month,
  selectedDate,
  onSelectDate,
  events,
  activeEventTypes,
}: {
  month: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  events: CalendarEvent[]
  activeEventTypes: string[]
}) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  // Array of weekday headers
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Generate all dates to display
  const calendarDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Split into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => {
        try {
          const arrivalDate = parseISO(event.arrivalDate);
          const departureDate = parseISO(event.departureDate);
          return isSameDay(date, arrivalDate) || isSameDay(date, departureDate);
        } catch (e) {
          return false;
        }
      }
    );
  };

  // Group events by type for a specific date
  const getEventsByType = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    const eventTypes = new Set(dateEvents.map(event => 
      isSameDay(parseISO(event.arrivalDate), date) ? 'arrival' : 'departure'
    ));
    return Array.from(eventTypes);
  };

  return (
    <div className="rounded-md border border-gray-200 shadow-sm h-full">
      <div className="px-4 py-3 bg-white border-b">
        <div className="font-medium text-gray-900">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-px">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center p-1 text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
          
          {weeks.map((week, weekIndex) => 
            week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, month);
              const isToday = isSameDay(new Date(), day);
              const isSelected = selectedDate && 
                isSameDay(selectedDate, day);
              const eventTypes = getEventsByType(day);
              const hasEvents = eventTypes.length > 0;
              const events = getEventsForDate(day);
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => isCurrentMonth && onSelectDate(day)}
                  className={cn(
                    "min-h-10 w-full p-0 text-center text-sm relative",
                    isCurrentMonth ? "text-gray-900" : "text-gray-400",
                    isSelected ? "bg-green-50" : "",
                    isToday ? "bg-amber-50" : "",
                    isCurrentMonth && "hover:bg-gray-100 cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-full flex flex-col",
                    events.length > 0 ? "gap-1 py-1" : "items-center justify-center h-full"
                  )}>
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full mx-auto",
                      isSelected && "bg-green-100 font-semibold",
                      isToday && !isSelected && "border border-amber-400"
                    )}>
                      {day.getDate()}
                    </span>
                    
                    {events.length > 0 && isCurrentMonth && (
                      <div className="px-1 flex flex-col gap-0.5 mt-0.5">
                        {events.slice(0, 2).map((event, idx) => {
                          const isArrival = isSameDay(parseISO(event.arrivalDate), day);
                          return (
                            <div 
                              key={event.id}
                              className={cn(
                                "text-xs px-1 py-0.5 rounded truncate text-left",
                                isArrival ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                              )}
                            >
                              {event.name} {isArrival ? "Arrival" : "Departure"}
                            </div>
                          );
                        })}
                        {events.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!events.length && hasEvents && isCurrentMonth && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5">
                      {eventTypes.map((type, index) => (
                        <div 
                          key={index} 
                          className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(type)}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Week Calendar View Component
const WeekCalendar = ({
  startDate,
  selectedDate,
  onSelectDate,
  events,
  activeEventTypes,
}: {
  startDate: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  events: CalendarEvent[]
  activeEventTypes: string[]
}) => {
  // Generate all 7 days of the week
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => {
        try {
          const arrivalDate = parseISO(event.arrivalDate);
          const departureDate = parseISO(event.departureDate);
          return isSameDay(date, arrivalDate) || isSameDay(date, departureDate);
        } catch (e) {
          return false;
        }
      }
    );
  };

  return (
    <div className="rounded-md border border-gray-200 shadow-sm">
      <div className="px-4 py-3 bg-white border-b">
        <div className="font-medium text-gray-900">
          {format(startDate, 'MMMM d')} - {format(days[6], 'MMMM d, yyyy')}
        </div>
      </div>
      <div className="grid grid-cols-7 min-h-[600px]">
        {days.map((day, index) => {
          const isToday = isSameDay(new Date(), day);
          const isSelected = selectedDate && isSameDay(selectedDate, day);
          const dayEvents = getEventsForDate(day);
          
          return (
            <div key={index} className="border-r last:border-r-0">
              {/* Day header */}
              <div 
                className={cn(
                  "px-2 py-2 text-center border-b cursor-pointer hover:bg-gray-50",
                  isToday ? "bg-amber-50" : "",
                  isSelected ? "bg-green-50" : ""
                )}
                onClick={() => onSelectDate(day)}
              >
                <div className="text-xs text-gray-500">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "font-semibold text-gray-900",
                  isToday && "text-amber-600"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              
              {/* Day events */}
              <div className="p-1 overflow-y-auto">
                {dayEvents.map((event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded mb-1 cursor-pointer",
                      event.type === 'arrival' && "bg-amber-100 text-amber-800 hover:bg-amber-200",
                      event.type === 'departure' && "bg-green-100 text-green-800 hover:bg-green-200"
                    )}
                    onClick={() => onSelectDate(day)}
                  >
                    <div className="font-medium truncate">{event.name}</div>
                    <div className="text-xs opacity-80 truncate">{event.details}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Agenda View Component
const AgendaView = ({
  startDate,
  events,
  activeEventTypes,
  onSelectDate,
}: {
  startDate: Date
  events: CalendarEvent[]
  activeEventTypes: string[]
  onSelectDate: (date: Date) => void
}) => {
  // Calculate end date (14 days from start)
  const endDate = addDays(startDate, 13);

  // Filter events in date range and by active types
  const filteredEvents = events.filter((event) => {
    try {
      const eventDate = parseISO(event.arrivalDate);
      return (
        eventDate >= startDate && 
        eventDate <= endDate && 
        activeEventTypes.includes(event.type)
      );
    } catch (e) {
      return false;
    }
  });

  // Group events by date
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  
  filteredEvents.forEach((event) => {
    const dateStr = event.arrivalDate.split('T')[0];
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = [];
    }
    groupedEvents[dateStr].push(event);
  });

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="rounded-md border border-gray-200 shadow-sm">
      <div className="px-4 py-3 bg-white border-b">
        <div className="font-medium text-gray-900">
          Next 14 Days: {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="divide-y">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateStr) => {
            const date = parseISO(dateStr);
            const events = groupedEvents[dateStr];
            const isToday = isSameDay(new Date(), date);
            
            return (
              <div key={dateStr} className="p-2">
                <div 
                  className={cn(
                    "px-3 py-2 mb-2 rounded-md font-medium",
                    isToday ? "bg-amber-50" : "bg-gray-50"
                  )}
                >
                  {format(date, 'EEEE, MMMM d, yyyy')}
                  {isToday && <span className="ml-2 text-amber-600 text-sm">(Today)</span>}
                </div>
                
                <div className="space-y-2 pl-2">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-start p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={() => onSelectDate(date)}
                    >
                      <div className={cn(
                        "p-2 rounded-full mr-3",
                        getEventTypeIconBg(event.type)
                      )}>
                        {event.type === 'arrival' && <User className="h-4 w-4" />}
                        {event.type === 'departure' && <MapPin className="h-4 w-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge className={getEventTypeBadgeStyle(event.type)}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                        {event.clientName && (
                          <p className="text-xs text-gray-500 mt-1">Client: {event.clientName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            No events scheduled for this period with the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

// Main Calendar Page Component
export default function NewCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(new Date()));
  const [viewEventsOpen, setViewEventsOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');
  const [activeEventTypes, setActiveEventTypes] = useState<string[]>(['arrival', 'departure', 'task']);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // Function to fetch calendar events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar');
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to fetch calendar events when view or filter changes
  useEffect(() => {
    fetchEvents();
  }, [view, activeEventTypes]);

  // Fetch events for a specific date (for event dialog)
  const fetchDateEvents = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/calendar/day?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch day events');
      }
      
      const data = await response.json();
      
      // Filter by active event types
      return data.filter((event: CalendarEvent) => activeEventTypes.includes(event.type));
    } catch (error) {
      console.error('Error fetching day events:', error);
      return [];
    }
  };

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const events = await fetchDateEvents(date);
    setSelectedDateEvents(events);
    
    if (events.length > 0) {
      setViewEventsOpen(true);
    }
  };

  // Generate months to display (for month view)
  const getMonthsToDisplay = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentViewDate);
      date.setMonth(currentViewDate.getMonth() + i);
      months.push(date);
    }
    return months;
  };

  // Navigation functions
  const previousPeriod = () => {
    if (view === 'month') {
      const newDate = new Date(currentViewDate);
      newDate.setMonth(currentViewDate.getMonth() - 6);
      setCurrentViewDate(newDate);
    } else if (view === 'week') {
      setWeekStartDate(subMonths(weekStartDate, 1));
    } else if (view === 'agenda') {
      setWeekStartDate(subMonths(weekStartDate, 1));
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      const newDate = new Date(currentViewDate);
      newDate.setMonth(currentViewDate.getMonth() + 6);
      setCurrentViewDate(newDate);
    } else if (view === 'week') {
      setWeekStartDate(addMonths(weekStartDate, 1));
    } else if (view === 'agenda') {
      setWeekStartDate(addMonths(weekStartDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentViewDate(new Date());
    setWeekStartDate(startOfWeek(new Date()));
    setSelectedDate(new Date());
  };

  // Toggle event type filter
  const toggleEventType = (type: string) => {
    if (activeEventTypes.includes(type)) {
      if (activeEventTypes.length > 1) { // Don't allow removing all filters
        setActiveEventTypes(activeEventTypes.filter(t => t !== type));
      }
    } else {
      setActiveEventTypes([...activeEventTypes, type]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage your reservations, departures, and tasks</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs 
            value={view} 
            onValueChange={(v) => setView(v as 'month' | 'week' | 'agenda')}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          
          <div className="flex">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-r-none" 
              onClick={previousPeriod}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-l-none" 
              onClick={nextPeriod}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Event Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer",
                    activeEventTypes.includes('arrival') && "bg-amber-50"
                  )}
                  onClick={() => toggleEventType('arrival')}
                >
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                  Arrivals
                  {activeEventTypes.includes('arrival') && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer",
                    activeEventTypes.includes('departure') && "bg-green-50"
                  )}
                  onClick={() => toggleEventType('departure')}
                >
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  Departures
                  {activeEventTypes.includes('departure') && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "cursor-pointer",
                    activeEventTypes.includes('task') && "bg-blue-50"
                  )}
                  onClick={() => toggleEventType('task')}
                >
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  Tasks
                  {activeEventTypes.includes('task') && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateEventOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>
      
      {/* Calendar Views */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full" />
        </div>
      ) : (
        <>
          {/* Month View */}
          {view === 'month' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMonthsToDisplay().map((month, index) => (
                <div key={index}>
                  <MonthCalendar
                    month={month}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    events={events}
                    activeEventTypes={activeEventTypes}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Week View */}
          {view === 'week' && (
            <WeekCalendar
              startDate={weekStartDate}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              events={events}
              activeEventTypes={activeEventTypes}
            />
          )}
          
          {/* Agenda View */}
          {view === 'agenda' && (
            <AgendaView
              startDate={weekStartDate}
              events={events}
              activeEventTypes={activeEventTypes}
              onSelectDate={handleDateSelect}
            />
          )}
        </>
      )}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
          <span className="text-sm text-gray-600">Arrival</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Departure</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Task</span>
        </div>
      </div>
      
      {/* Upcoming Events Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 scheduled events</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {events
                .filter(event => {
                  try {
                    const eventDate = parseISO(event.arrivalDate);
                    return eventDate >= new Date() && activeEventTypes.includes(event.type);
                  } catch (e) {
                    return false;
                  }
                })
                .sort((a, b) => {
                  try {
                    return parseISO(a.arrivalDate).getTime() - parseISO(b.arrivalDate).getTime();
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (e) {
                    return 0;
                  }
                })
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="py-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getEventTypeIconBg(event.type)} mr-4`}>
                        {event.type === 'arrival' && <User className="h-4 w-4" />}
                        {event.type === 'departure' && <MapPin className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{event.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(event.arrivalDate), 'MMM d, yyyy')}
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
          )}
        </CardContent>
      </Card>

      {/* View Events Dialog */}
      <Dialog open={viewEventsOpen} onOpenChange={setViewEventsOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Events for {formatReadableDate(selectedDate)}</DialogTitle>
            <DialogDescription>
              {selectedDateEvents.length === 0 
                ? "No events scheduled for this day." 
                : `${selectedDateEvents.length} event(s) scheduled.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => {
                const isArrival = isSameDay(parseISO(event.arrivalDate), selectedDate);
                return (
                  <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${isArrival ? "bg-amber-100" : "bg-green-100"} mr-4`}>
                        {isArrival ? <User className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-gray-500">
                          {event.totalGuests} guest{event.totalGuests !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">Status: {event.status}</p>
                      </div>
                    </div>
                    <div>
                      <Badge className={isArrival ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}>
                        {isArrival ? "Arrival" : "Departure"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500">
                No events scheduled for this day. Click &quot;Add Event&quot; to schedule something.
              </div>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewEventsOpen(false)}>
                Close
              </Button>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setViewEventsOpen(false);
                setIsCreateEventOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Event Creation Dialog */}
      <EventCreationDialog
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        initialDate={selectedDate}
        onEventCreated={() => {
          fetchEvents();
          // If we just created an event for the selected date, refresh those events too
          handleDateSelect(selectedDate);
        }}
      />
    </div>
  );
}