'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, Calendar, AlertTriangle, BarChart3, ClipboardList } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { month: 'Jan', attendance: 92, performance: 68 },
  { month: 'Feb', attendance: 94, performance: 71 },
  { month: 'Mar', attendance: 91, performance: 73 },
  { month: 'Apr', attendance: 93, performance: 72 },
  { month: 'May', attendance: 95, performance: 75 },
  { month: 'Jun', attendance: 94, performance: 74 },
];

export default function AdminDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.dashboard.admin().then((res) => setData(res.data as Record<string, unknown>)).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <DashboardLayout title="School Analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Students" value={String(data?.totalStudents || 0)} icon={GraduationCap} color="blue" />
          <StatCard title="Total Teachers" value={String(data?.totalTeachers || 0)} icon={Users} color="green" />
          <StatCard title="Attendance Rate" value={`${data?.attendanceRate || 0}%`} icon={Calendar} color="green" />
          <StatCard title="Average Grade" value={`${data?.averageGrade || 0}%`} icon={BarChart3} color="blue" />
          <StatCard title="At-Risk Students" value={String(data?.atRiskStudents || 0)} icon={AlertTriangle} color="red" />
          <StatCard title="Pending Assignments" value={String(data?.pendingAssignments || 0)} icon={ClipboardList} color="amber" />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">School Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} name="Attendance %" />
              <Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} name="Performance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
