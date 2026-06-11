'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.dashboard.teacher().then((res) => {
      setClasses(((res.data as { classSubjects: unknown[] })?.classSubjects || []) as Record<string, unknown>[]);
    }).catch(console.error);
  }, []);

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="My Classes">
        <div className="grid md:grid-cols-2 gap-4">
          {classes.map((cs, i) => {
            const item = cs as { class: { name: string; gradeLevel: string }; subject: { name: string } };
            return (
              <div key={i} className="card p-5">
                <h3 className="font-semibold">{item.class.name} — {item.subject.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.class.gradeLevel}</p>
              </div>
            );
          })}
          {classes.length === 0 && <p className="text-gray-400 col-span-2 text-center py-12">No classes assigned</p>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
