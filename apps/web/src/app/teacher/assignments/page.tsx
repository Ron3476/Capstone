'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.assignments.list().then((res) => setAssignments(res.data as Record<string, unknown>[])).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="Assignments">
        <div className="space-y-3">
          {assignments.map((a) => {
            const item = a as { id: string; title: string; status: string; dueDate: string; submissions: unknown[] };
            return (
              <div key={item.id} className="card p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-xs text-gray-400">Due {formatDate(item.dueDate)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700">{item.status}</span>
              </div>
            );
          })}
          {assignments.length === 0 && <p className="text-center text-gray-400 py-12">No assignments yet</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
