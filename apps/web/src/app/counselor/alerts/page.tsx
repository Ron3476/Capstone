'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function CounselorAlertsPage() {
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.dashboard.counselor().then((res) => {
      setAlerts(((res.data as { alerts: unknown[] })?.alerts || []) as Record<string, unknown>[]);
    }).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['COUNSELOR']}>
      <DashboardLayout title="Well-being Alerts">
        <div className="space-y-3">
          {alerts.map((a) => {
            const alert = a as {
              id: string; riskLevel: string; concern: string;
              moodCheckIn: { student: { user: { firstName: string; lastName: string } } };
            };
            return (
              <div key={alert.id} className="card p-5 border-l-4 border-red-500">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {alert.moodCheckIn.student.user.firstName} {alert.moodCheckIn.student.user.lastName}
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{alert.riskLevel}</span>
                </div>
                <p className="text-sm text-gray-500">{alert.concern}</p>
              </div>
            );
          })}
          {alerts.length === 0 && <p className="text-center text-gray-400 py-12">No active alerts</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
