'use client';

import { useNotifications } from '@/lib/queries';

export function NotificationsList() {
  const { data: notifications, isLoading, error } = useNotifications();

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error loading notifications: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {notifications?.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-4 border rounded-lg ${
            !notification.read ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-semibold">{notification.title}</h3>
            {!notification.read && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                New
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">{notification.message}</p>
          <p className="mt-2 text-xs text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
} 