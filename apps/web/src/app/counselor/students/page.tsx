'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function CounselorStudentsPage() {
  const [checkIns, setCheckIns] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.dashboard.counselor().then((res) => {
      setCheckIns(((res.data as { recentCheckIns: unknown[] })?.recentCheckIns || []) as Record<string, unknown>[]);
    }).catch(console.error);
  }, []);

  const students = [...new Map(
    checkIns.map((c) => {
      const item = c as { student: { id: string; user: { firstName: string; lastName: string } } };
      return [item.student.id, item.student];
    })
  ).values()];

  return (
    <ProtectedRoute roles={['COUNSELOR']}>
      <DashboardLayout title="Students">
        <div className="grid md:grid-cols-2 gap-4">
          {students.map((s) => (
            <div key={s.id} className="card p-5">
              <h3 className="font-semibold">{s.user.firstName} {s.user.lastName}</h3>
              <p className="text-sm text-gray-500 mt-1">Recent mood check-ins on file</p>
            </div>
          ))}
          {students.length === 0 && <p className="text-gray-400 col-span-2 text-center py-12">No students with check-ins</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
