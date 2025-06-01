import { useQuery } from '@tanstack/react-query';

// Types
interface Arrival {
  name: string;
  arrivalDate: string;
  totalGuests: number;
  status: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface Invoice {
  id: number;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  type: string;
  arrivalDate: string;
  departureDate: string;
}

interface Log {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

// Query Hooks
export const useArrivals = () => {
  return useQuery<Arrival[]>({
    queryKey: ['arrivals'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/arrivals');
      if (!response.ok) throw new Error('Failed to fetch arrivals');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useClients = () => {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useTasks = () => {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useNotes = () => {
  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useInvoices = () => {
  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCalendarEvents = () => {
  return useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await fetch('/api/calendar');
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useLogs = () => {
  return useQuery<Log[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Add more query hooks for other data as needed
// Example:
// export const useReservations = () => {
//   return useQuery({
//     queryKey: ['reservations'],
//     queryFn: async () => {
//       const response = await fetch('/api/reservations');
//       if (!response.ok) {
//         throw new Error('Failed to fetch reservations');
//       }
//       return response.json();
//     },
//     staleTime: 5 * 60 * 1000,
//     gcTime: 30 * 60 * 1000,
//   });
// }; 