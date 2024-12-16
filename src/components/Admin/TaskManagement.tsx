'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
  });

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'pending',
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', assignedTo: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Task Management</h2>
      
      {/* Create Task Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Task Title"
            className="w-full p-2 border rounded"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            placeholder="Task Description"
            className="w-full p-2 border rounded"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Assign To (User ID)"
            className="w-full p-2 border rounded"
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
          />
          <button
            onClick={handleCreateTask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Task List</h3>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border p-3 rounded">
              <h4 className="font-semibold">{task.title}</h4>
              <p className="text-gray-600">{task.description}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm">Assigned to: {task.assignedTo}</span>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
