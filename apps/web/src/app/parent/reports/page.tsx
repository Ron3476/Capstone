'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function ParentReportsPage() {
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const dash = await api.dashboard.parent();
      const children = (dash.data as { children: { student: { id: string } }[] }).children;
      if (children.length > 0) {
        const res = await api.ai.parentReport(children[0].student.id);
        setReport(res.data as Record<string, unknown>);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['PARENT']}>
      <DashboardLayout title="AI Progress Reports">
        <div className="max-w-2xl mx-auto">
          {!report ? (
            <div className="card p-8 text-center">
              <FileText className="w-12 h-12 text-brand-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Weekly Progress Report</h3>
              <p className="text-sm text-gray-500 mb-6">
                Get an AI-generated report explaining your child&apos;s academic progress,
                attendance patterns, and recommended actions.
              </p>
              <button onClick={generate} disabled={loading} className="btn-primary">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Report'}
              </button>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Weekly Report</h3>
              <p className="text-sm leading-relaxed">{(report as { summary: string }).summary}</p>
              <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                {JSON.stringify((report as { content: unknown }).content, null, 2)}
              </pre>
              <button onClick={() => setReport(null)} className="btn-secondary">Generate New Report</button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
