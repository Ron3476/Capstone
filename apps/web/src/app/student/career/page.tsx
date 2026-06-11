'use client';

import { useState } from 'react';
import { Briefcase, GraduationCap, Award, Lightbulb, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function CareerPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.ai.careerGuidance();
      setProfile(res.data as Record<string, unknown>);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const careers = (profile?.recommendedCareers as { title: string; match: number; reason: string }[]) || [];
  const universities = (profile?.recommendedUniversities as { name: string; program: string; location: string }[]) || [];

  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="Career Guidance">
        {!profile ? (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <Briefcase className="w-12 h-12 text-brand-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Discover Your Future</h3>
            <p className="text-sm text-gray-500 mb-6">
              Get AI-powered career recommendations based on your interests, strengths, and academic performance.
            </p>
            <button onClick={generate} disabled={loading} className="btn-primary">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Generate Career Profile'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-brand-600" /> Recommended Careers
                </h3>
                <div className="space-y-3">
                  {careers.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{c.title}</span>
                        <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-700 px-2 py-0.5 rounded-full">
                          {c.match}% match
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-success-600" /> Universities
                </h3>
                <div className="space-y-3">
                  {universities.map((u, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.program} • {u.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-500" /> Scholarships
                </h3>
                <p className="text-sm text-gray-500">Scholarship opportunities will appear based on your profile.</p>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-brand-500" /> Entrepreneurship
                </h3>
                <p className="text-sm text-gray-500">Business ideas tailored to your skills and local market.</p>
              </div>
            </div>

            <button onClick={generate} disabled={loading} className="btn-secondary">
              Refresh Recommendations
            </button>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
