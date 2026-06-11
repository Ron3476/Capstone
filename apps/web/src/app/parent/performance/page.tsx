'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function ParentPerformancePage() {
  const [grades, setGrades] = useState<{ score: number; maxScore: number }[]>([]);

  useEffect(() => {
    api.dashboard.parent().then((res) => {
      const children = (res.data as { children: { student: { grades: { score: number; maxScore: number }[] } }[] })?.children || [];
      setGrades(children[0]?.student?.grades || []);
    }).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['PARENT']}>
      <DashboardLayout title="Academic Performance">
        <div className="space-y-3">
          {grades.map((g, i) => (
            <div key={i} className="card p-4 flex justify-between">
              <span className="text-sm">Assessment {i + 1}</span>
              <span className="font-semibold">{Math.round((g.score / g.maxScore) * 100)}%</span>
            </div>
          ))}
          {grades.length === 0 && <p className="text-center text-gray-400 py-12">No grades recorded yet</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
