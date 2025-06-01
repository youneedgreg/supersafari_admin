'use client';

import { useClients } from '@/lib/queries';

export function ClientsList() {
  const { data: clients, isLoading, error } = useClients();

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  if (error) {
    return <div>Error loading clients: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {clients?.map((client) => (
        <div key={client.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{client.name}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {client.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {client.phone}
            </p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-sm ${
                client.status === 'active' ? 'bg-green-100 text-green-800' :
                client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 