'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.assignments.list().then((res) => setAssignments(res.data as Record<string, unknown>[])).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="My Assignments">
        <div className="space-y-3">
          {assignments.map((item) => {
            const a = item as {
              id: string;
              status: string;
              assignment: { title: string; description: string; dueDate: string; maxScore: number };
              grade?: { score: number; feedback: string };
            };
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.assignment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{a.assignment.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Due: {formatDate(a.assignment.dueDate)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    a.status === 'GRADED' ? 'bg-success-100 text-success-700' :
                    a.status === 'SUBMITTED' ? 'bg-brand-100 text-brand-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
                {a.grade && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
                    Score: <strong>{a.grade.score}/{a.assignment.maxScore}</strong>
                    {a.grade.feedback && <p className="text-gray-500 mt-1">{a.grade.feedback}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {assignments.length === 0 && (
            <p className="text-center text-gray-400 py-12">No assignments yet</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
