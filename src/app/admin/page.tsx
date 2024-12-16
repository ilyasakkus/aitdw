'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserManagement from '@/components/Admin/UserManagement';
import TaskManagement from '@/components/Admin/TaskManagement';

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      
      if (!isAdmin) {
        router.replace('/documents');
        return;
      }
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Task Management
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' ? <UserManagement /> : <TaskManagement />}
        </div>
      </div>
    </div>
  );
}
