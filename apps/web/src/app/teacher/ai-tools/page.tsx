'use client';

import { useState } from 'react';
import { Brain, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function TeacherAIToolsPage() {
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: 'Mathematics',
    gradeLevel: 'Grade 10',
    topic: '',
    duration: 45,
    questionCount: 5,
  });

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      if (activeTab === 'lesson') {
        const res = await api.ai.lessonPlan({
          subject: form.subject,
          gradeLevel: form.gradeLevel,
          topic: form.topic,
          duration: form.duration,
        });
        setResult(res.data);
      } else {
        const res = await api.ai.quiz({
          subject: form.subject,
          gradeLevel: form.gradeLevel,
          topic: form.topic,
          questionCount: form.questionCount,
        });
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="AI Teaching Tools">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'lesson' as const, label: 'Lesson Plan', icon: FileText },
            { id: 'quiz' as const, label: 'Quiz Generator', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-600" />
              {activeTab === 'lesson' ? 'Generate Lesson Plan' : 'Generate Quiz'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Subject</label>
                <input className="input mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Grade</label>
                <input className="input mt-1" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Topic</label>
              <input className="input mt-1" placeholder="e.g. Quadratic Equations" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
            <button onClick={generate} disabled={loading || !form.topic} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate with AI'}
            </button>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Result</h3>
            {result ? (
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 text-gray-700 dark:text-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-400 text-center py-12">
                Enter a topic and click generate to create AI-powered content
              </p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
