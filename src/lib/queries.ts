import { useQuery } from '@tanstack/react-query';

interface Arrival {
  name: string;
  arrivalDate: string;
  totalGuests: number;
  status: string;
}

// Fetch arrivals data
export const useArrivals = () => {
  return useQuery<Arrival[]>({
    queryKey: ['arrivals'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/arrivals');
      if (!response.ok) {
        throw new Error('Failed to fetch arrivals');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
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