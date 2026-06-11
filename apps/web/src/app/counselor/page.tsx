'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Heart, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';

export default function CounselorDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.dashboard.counselor().then((res) => setData(res.data as Record<string, unknown>)).catch(console.error);
  }, []);

  const alerts = (data?.alerts as {
    id: string; riskLevel: string; concern: string;
    moodCheckIn: { student: { user: { firstName: string; lastName: string } } };
  }[]) || [];

  return (
    <ProtectedRoute roles={['COUNSELOR']}>
      <DashboardLayout title="Counselor Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Unresolved Alerts" value={String(data?.unresolvedCount || 0)} icon={AlertTriangle} color="red" />
          <StatCard title="Recent Check-ins" value={String((data?.recentCheckIns as unknown[])?.length || 0)} icon={Heart} color="green" />
          <StatCard title="Students Monitored" value={String(new Set(alerts.map((a) => a.moodCheckIn.student)).size)} icon={Users} color="blue" />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Well-being Alerts (Guardian Agent Escalations)</h3>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {alert.moodCheckIn.student.user.firstName} {alert.moodCheckIn.student.user.lastName}
                    </span>
                    <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                      {alert.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.concern}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No active well-being alerts</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
