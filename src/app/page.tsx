/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ChevronRight,
  ChevronLeft,
  ClipboardList, 
  Clock, 
  Plus, 
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrivalsList } from '@/components/dashboard/arrivals-list';
import { TasksList } from '@/components/dashboard/tasks-list';
import { ClientsList } from '@/components/dashboard/clients-list';
import { NotificationsList } from '@/components/dashboard/notifications-list';
import { useCalendarEvents } from '@/lib/queries';

interface CustomCalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | undefined;
  onSelect?: (date: Date) => void;
  className?: string;
}

// Custom Calendar Component
const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selected,
  onSelect,
  className = "",
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(selected || new Date());
  const { data: events = [] } = useCalendarEvents();

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
        
        const dayHasArrival = hasArrival(day);
        const dayHasDeparture = hasDeparture(day);
        
        days.push(
          <div
            key={day.toString()}
            className={`relative p-2 text-center cursor-pointer ${
              !isCurrentMonth ? "text-gray-300" : ""
            } ${
              isSelected ? "bg-gray-100 rounded-md font-semibold" : ""
            } ${
              dayHasArrival ? "border-2 border-amber-400 rounded-md" : ""
            } ${
              dayHasDeparture ? "border-2 border-green-500 rounded-md" : ""
            }`}
            onClick={() => isCurrentMonth && onDateSelect(cloneDay)}
          >
            <span>{format(day, 'd')}</span>
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

    return <div className="mt-2">{rows}</div>;
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Arrivals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ArrivalsList />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <TasksList />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ClientsList />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NotificationsList />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View upcoming arrivals and departures</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomCalendar />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}