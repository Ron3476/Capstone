'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ParentAttendancePage() {
  const [records, setRecords] = useState<{ date: string; status: string }[]>([]);

  useEffect(() => {
    api.dashboard.parent().then((res) => {
      const children = (res.data as { children: { student: { attendance: { date: string; status: string }[] } }[] })?.children || [];
      setRecords(children[0]?.student?.attendance || []);
    }).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['PARENT']}>
      <DashboardLayout title="Attendance">
        <div className="space-y-2">
          {records.map((r, i) => (
            <div key={i} className="card p-3 flex justify-between items-center">
              <span className="text-sm">{formatDate(r.date)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                r.status === 'PRESENT' ? 'bg-success-100 text-success-700' :
                r.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>{r.status}</span>
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-gray-400 py-12">No attendance records</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
