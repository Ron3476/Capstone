'use client';

import { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, Calendar, TrendingUp } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.dashboard.student().then((res) => setData(res.data as Record<string, unknown>)).catch(console.error);
  }, []);

  const moodTrend = (data?.moodTrend as { moodLevel: string; createdAt: string }[]) || [];
  const chartData = moodTrend.map((m) => ({
    day: new Date(m.createdAt).toLocaleDateString('en', { weekday: 'short' }),
    mood: { VERY_LOW: 1, LOW: 2, NEUTRAL: 3, GOOD: 4, EXCELLENT: 5 }[m.moodLevel] || 3,
  })).reverse();

  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="Student Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Average Score" value={`${data?.averageScore || 0}%`} icon={BarChart3} color="blue" />
          <StatCard title="Attendance" value={`${data?.attendanceRate || 0}%`} icon={Calendar} color="green" />
          <StatCard title="Pending Tasks" value={String(data?.pendingAssignments || 0)} icon={ClipboardList} color="amber" />
          <StatCard title="Study Plans" value={String((data?.studyPlans as unknown[])?.length || 0)} icon={TrendingUp} color="green" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Mood Trend (7 days)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="mood" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Complete mood check-ins to see your trend</p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Upcoming Assignments</h3>
            <div className="space-y-3">
              {((data?.upcomingAssignments as { assignment: { title: string; dueDate: string } }[]) || []).slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm font-medium">{item.assignment.title}</span>
                  <span className="text-xs text-gray-400">
                    Due {new Date(item.assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {!(data?.upcomingAssignments as unknown[])?.length && (
                <p className="text-sm text-gray-400 text-center py-4">No pending assignments</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
