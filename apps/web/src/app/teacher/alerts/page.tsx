'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function TeacherAlertsPage() {
  const [recommendations, setRecommendations] = useState<Record<string, unknown>[]>([]);

  const load = () => {
    api.ai.pendingRecommendations().then((res) => setRecommendations(res.data as Record<string, unknown>[])).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const review = async (id: string, approved: boolean) => {
    await api.ai.reviewRecommendation(id, approved);
    load();
  };

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="Student Alerts & Recommendations">
        <p className="text-sm text-gray-500 mb-4">
          Review AI-generated recommendations. As the Teacher Agent, you have final approval authority.
        </p>
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const r = rec as {
              id: string; title: string; description: string; priority: string; agentType: string;
              student: { user: { firstName: string; lastName: string } };
            };
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{r.agentType}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{r.priority}</span>
                    </div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Student: {r.student.user.firstName} {r.student.user.lastName}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => review(r.id, true)} className="btn-primary px-3 py-2">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => review(r.id, false)} className="btn-secondary px-3 py-2 text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <p className="text-center text-gray-400 py-12">No pending recommendations</p>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
