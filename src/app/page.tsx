/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ChevronRight,
  ChevronLeft,
  ClipboardList, 
  Clock, 
  Plus, 
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';

// Types for our data
interface DashboardStats {
  totalClients: number;
  planning: number;
  confirmed: number;
  booked: number;
  completed: number;
}

interface Arrival {
  name: string;
  arrivalDate: string;
  totalGuests: number;
  status: string;
}

interface Task {
  title: string;
  due: string;
  priority: string;
}

interface CalendarEvent {
  id: number;
  name: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  totalGuests: number;
}

interface CustomCalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | undefined;
  onSelect?: (date: Date) => void;
  className?: string;
  events?: CalendarEvent[];
}

// Custom Calendar Component
const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selected,
  onSelect,
  className = "",
  events = []
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(selected || new Date());

  const onDateSelect = (day: Date) => {
    setActiveDate(day);
    if (onSelect) {
      onSelect(day);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 gap-1 py-2">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // Check if a date has arrivals or departures from the events
    const hasArrival = (date: Date) => {
      return events.some(event => {
        try {
          const arrivalDate = new Date(event.arrivalDate);
          return isSameDay(date, arrivalDate);
        } catch (e) {
          return false;
        }
      });
    };

    const hasDeparture = (date: Date) => {
      return events.some(event => {
        try {
          const departureDate = new Date(event.departureDate);
          return isSameDay(date, departureDate);
        } catch (e) {
          return false;
        }
      });
    };

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isSelected = isSameDay(day, activeDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        // Check for events
        const dayHasArrival = hasArrival(day);
        const dayHasDeparture = hasDeparture(day);
        
        days.push(
          <div
            key={day.toString()}
            className={`relative p-2 text-center cursor-pointer ${
              !isCurrentMonth ? "text-gray-300" : ""
            } ${
              isSelected ? "bg-gray-100 rounded-md font-semibold" : ""
            }`}
            onClick={() => isCurrentMonth && onDateSelect(cloneDay)}
          >
            <span>{format(day, 'd')}</span>
            <div className="flex justify-center gap-1 absolute -bottom-1 left-0 right-0">
              {dayHasArrival && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              )}
              {dayHasDeparture && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className={`calendar ${className}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    planning: 0,
    confirmed: 0,
    booked: 0,
    completed: 0,
  });
  const [upcomingArrivals, setUpcomingArrivals] = useState<Arrival[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats for the dashboard
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch upcoming arrivals
        const arrivalsResponse = await fetch('/api/dashboard/arrivals');
        const arrivalsData = await arrivalsResponse.json();
        setUpcomingArrivals(arrivalsData);
        
        // Fetch calendar events (arrivals and departures)
        const eventsResponse = await fetch('/api/dashboard/events');
        const eventsData = await eventsResponse.json();
        setCalendarEvents(eventsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Hardcoded pending tasks for now
  const pendingTasks = [
    { title: "Book flight for Thompson Family", due: "May 10, 2023", priority: "High" },
    { title: "Send invoice to David Williams", due: "May 8, 2023", priority: "Medium" },
    { title: "Confirm hotel for Smith couple", due: "May 9, 2023", priority: "High" },
  ];

  // The Stats array for the cards
  const statsCards = [
    { title: "Total Clients", value: stats.totalClients, icon: Users, color: "bg-green-100 text-green-600" },
    { title: "Planning", value: stats.planning, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { title: "Confirmed", value: stats.confirmed, icon: Users, color: "bg-amber-100 text-amber-600" },
    { title: "Booked", value: stats.booked, icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Completed", value: stats.completed, icon: Users, color: "bg-emerald-100 text-emerald-600" },
  ];

  // Find events for the selected date
  // Find events for the selected date
const selectedDateEvents = calendarEvents && Array.isArray(calendarEvents) 
? calendarEvents.filter(event => {
    try {
      const arrivalDate = new Date(event.arrivalDate);
      const departureDate = new Date(event.departureDate);
      return isSameDay(new Date(date!), arrivalDate) || isSameDay(new Date(date!), departureDate);
    } catch (e) {
      return false;
    }
  })
: [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to your super africa admin management system</p>
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
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Custom Calendar Card */}
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
              <CustomCalendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                className="rounded-md"
                events={calendarEvents}
              />
            </div>
            <div className="border-t p-3 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Today&apos;s Schedule</h3>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event, idx) => {
                  const isArrival = isSameDay(new Date(event.arrivalDate), date!);
                  return (
                    <div 
                      key={idx}
                      className={`text-sm p-2 rounded ${
                        isArrival 
                          ? "bg-amber-50 border border-amber-200 text-amber-800" 
                          : "bg-green-50 border border-green-200 text-green-800"
                      } ${idx > 0 ? "mt-2" : ""}`}
                    >
                      <div className="font-medium">
                        {event.name} {isArrival ? "Arrival" : "Departure"}
                      </div>
                      <div className="text-xs">
                        {event.totalGuests} guest{event.totalGuests !== 1 ? "s" : ""} • {event.status}
                      </div>
                    </div>
                  );
                })
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
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading arrivals...</div>
            ) : upcomingArrivals.length > 0 ? (
              <div className="space-y-4">
                {upcomingArrivals.map((arrival, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{arrival.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {arrival.arrivalDate} • {arrival.totalGuests} guest{arrival.totalGuests !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Badge
                      className={
                        arrival.status.toLowerCase() === "confirmed"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : arrival.status.toLowerCase() === "booked"
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {arrival.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No upcoming arrivals</div>
            )}
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