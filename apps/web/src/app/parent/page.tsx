'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Calendar, Heart, FileText } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';

export default function ParentDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.dashboard.parent().then((res) => setData(res.data as Record<string, unknown>)).catch(console.error);
  }, []);

  const children = (data?.children as {
    student: {
      id: string;
      user: { firstName: string; lastName: string };
      grades: { score: number; maxScore: number }[];
      attendance: { status: string }[];
    };
  }[]) || [];

  const child = children[0]?.student;
  const avgGrade = child?.grades.length
    ? Math.round(child.grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / child.grades.length)
    : 0;
  const attendanceRate = child?.attendance.length
    ? Math.round((child.attendance.filter((a) => a.status === 'PRESENT').length / child.attendance.length) * 100)
    : 0;

  return (
    <ProtectedRoute roles={['PARENT']}>
      <DashboardLayout title="Parent Dashboard">
        {child && (
          <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <p className="text-sm text-brand-700 dark:text-brand-300">
              Monitoring: <strong>{child.user.firstName} {child.user.lastName}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Average Grade" value={`${avgGrade}%`} icon={BarChart3} color="blue" />
          <StatCard title="Attendance" value={`${attendanceRate}%`} icon={Calendar} color="green" />
          <StatCard title="Children" value={String(children.length)} icon={Heart} color="green" />
          <StatCard title="AI Reports" value={String((data?.reports as unknown[])?.length || 0)} icon={FileText} color="blue" />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Recent AI Reports</h3>
          {((data?.reports as { summary: string; createdAt: string }[]) || []).map((report, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
              <p className="text-sm">{report.summary}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {!(data?.reports as unknown[])?.length && (
            <p className="text-sm text-gray-400 text-center py-6">No reports yet. Visit AI Reports to generate one.</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
