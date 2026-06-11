'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';

export default function TeacherDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.dashboard.teacher().then((res) => setData(res.data as Record<string, unknown>)).catch(console.error);
  }, []);

  const alerts = (data?.alerts as { id: string; title: string; priority: string; student: { user: { firstName: string; lastName: string } } }[]) || [];

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="Teacher Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="My Students" value={String(data?.totalStudents || 0)} icon={Users} color="blue" />
          <StatCard title="Classes" value={String((data?.classSubjects as unknown[])?.length || 0)} icon={BookOpen} color="green" />
          <StatCard title="Pending Grading" value={String(data?.pendingGrading || 0)} icon={ClipboardCheck} color="amber" />
          <StatCard title="Student Alerts" value={String(alerts.length)} icon={AlertTriangle} color="red" />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">AI Student Alerts</h3>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-gray-400">
                      {alert.student.user.firstName} {alert.student.user.lastName}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    alert.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    alert.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                    'bg-brand-100 text-brand-700'
                  }`}>
                    {alert.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No pending alerts — all students on track</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
