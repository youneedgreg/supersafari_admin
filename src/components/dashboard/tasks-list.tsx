'use client';

import { useTasks } from '@/lib/queries';

export function TasksList() {
  const { data: tasks, isLoading, error } = useTasks();

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {tasks?.map((task) => (
        <div key={task.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2 py-1 rounded text-sm ${
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </span>
            <span className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 