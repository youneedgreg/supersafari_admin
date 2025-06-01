'use client';

import { useArrivals } from '@/lib/queries';

export function ArrivalsList() {
  const { data: arrivals, isLoading, error } = useArrivals();

  if (isLoading) {
    return <div>Loading arrivals...</div>;
  }

  if (error) {
    return <div>Error loading arrivals: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {arrivals?.map((arrival) => (
        <div key={arrival.name} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{arrival.name}</h3>
          <p>Arrival Date: {arrival.arrivalDate}</p>
          <p>Total Guests: {arrival.totalGuests}</p>
          <p>Status: {arrival.status}</p>
        </div>
      ))}
    </div>
  );
} 