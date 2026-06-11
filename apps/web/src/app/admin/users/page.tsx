'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.users.list().then((res) => setUsers(res.data as Record<string, unknown>[])).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <DashboardLayout title="User Management">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const user = u as { id: string; firstName: string; lastName: string; email: string; role: string; isActive: boolean };
                return (
                  <tr key={user.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="p-3">{user.firstName} {user.lastName}</td>
                    <td className="p-3 text-gray-500">{user.email}</td>
                    <td className="p-3"><span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{user.role}</span></td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-400 py-12">No users found</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
