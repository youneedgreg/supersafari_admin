// lib/calendar-utils.ts
import { parseISO, format, isSameDay, addDays } from 'date-fns';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string | Date;
  type: 'arrival' | 'departure' | 'task' | string;
  status: string;
  details?: string;
  clientId?: number | null;
  clientName?: string | null;
}

// Get event type badge style - shadcn style
export function getEventTypeBadgeStyle(type: string): string {
  switch (type.toLowerCase()) {
    case "arrival":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "departure":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "task":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

// Get event type background color for icons
export function getEventTypeIconBg(type: string): string {
  switch (type.toLowerCase()) {
    case "arrival":
      return "bg-amber-100 text-amber-600";
    case "departure":
      return "bg-green-100 text-green-600";
    case "task":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// Get priority badge color
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "medium":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "low":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

// Get event indicator color for calendar dots
export function getEventTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "arrival":
      return "bg-amber-500";
    case "departure":
      return "bg-green-500";
    case "task":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

// Check if a date has events
export function hasEvents(date: Date, events: CalendarEvent[]): boolean {
  return events.some(event => {
    try {
      const eventDate = typeof event.date === 'string' 
        ? parseISO(event.date) 
        : event.date;
      return isSameDay(date, eventDate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  });
}

// Get events for a specific date
export function getEventsForDate(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => {
    try {
      const eventDate = typeof event.date === 'string' 
        ? parseISO(event.date) 
        : event.date;
      return isSameDay(date, eventDate);
    } catch (e) {
      return false;
    }
  });
}

// Group events by type for a specific date
export function getEventsByType(date: Date, events: CalendarEvent[]): string[] {
  const dateEvents = getEventsForDate(date, events);
  const eventTypes = new Set(dateEvents.map(event => event.type));
  return Array.from(eventTypes);
}

// Get events for a date range
export function getEventsForDateRange(startDate: Date, endDate: Date, events: CalendarEvent[]): CalendarEvent[] {
  let currentDate = startDate;
  const rangeEvents: CalendarEvent[] = [];
  
  while (currentDate <= endDate) {
    const eventsForDay = getEventsForDate(currentDate, events);
    rangeEvents.push(...eventsForDay);
    currentDate = addDays(currentDate, 1);
  }
  
  return rangeEvents;
}

// Format date for display
export function formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
  return format(date, format);
}

// Format date into a more human-readable format
export function formatReadableDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}