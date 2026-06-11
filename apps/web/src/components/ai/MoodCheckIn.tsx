'use client';

import { useState } from 'react';
import { Heart, Smile, Frown, Meh, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

const moods = [
  { value: 'VERY_LOW', label: 'Very Low', icon: Frown, color: 'text-red-500' },
  { value: 'LOW', label: 'Low', icon: Frown, color: 'text-orange-500' },
  { value: 'NEUTRAL', label: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { value: 'GOOD', label: 'Good', icon: Smile, color: 'text-green-500' },
  { value: 'EXCELLENT', label: 'Great', icon: Sparkles, color: 'text-brand-500' },
];

export function MoodCheckIn() {
  const [mood, setMood] = useState('');
  const [stress, setStress] = useState(3);
  const [anxiety, setAnxiety] = useState(2);
  const [energy, setEnergy] = useState(7);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!mood) return;
    setLoading(true);
    try {
      const res = await api.ai.moodCheckIn({ moodLevel: mood, stress, anxiety, energy, notes });
      setResult(res.data as Record<string, unknown>);
    } catch {
      setResult({ error: 'Failed to submit check-in' });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const analysis = (result as { analysis?: Record<string, unknown> }).analysis;
    return (
      <div className="card p-6 max-w-lg mx-auto text-center space-y-4">
        <Heart className="w-12 h-12 text-success-500 mx-auto" />
        <h3 className="text-lg font-semibold">Check-in Recorded</h3>
        {analysis && (
          <div className="text-left space-y-3 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {(analysis as { recommendations?: string[] }).recommendations?.join('. ')}
            </p>
          </div>
        )}
        <button onClick={() => setResult(null)} className="btn-primary">New Check-in</button>
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <Heart className="w-10 h-10 text-brand-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Daily Mood Check-in</h3>
        <p className="text-sm text-gray-500">How are you feeling today?</p>
      </div>

      <div className="flex justify-between gap-2">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => setMood(m.value)}
            className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
              mood === m.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <m.icon className={`w-6 h-6 ${m.color}`} />
            <span className="text-xs">{m.label}</span>
          </button>
        ))}
      </div>

      {[
        { label: 'Stress Level', value: stress, set: setStress },
        { label: 'Anxiety Level', value: anxiety, set: setAnxiety },
        { label: 'Energy Level', value: energy, set: setEnergy },
      ].map((slider) => (
        <div key={slider.label}>
          <div className="flex justify-between text-sm mb-1">
            <span>{slider.label}</span>
            <span className="font-medium">{slider.value}/10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={slider.value}
            onChange={(e) => slider.set(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>
      ))}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything you'd like to share? (optional)"
        className="input h-20 resize-none"
      />

      <button onClick={submit} disabled={!mood || loading} className="btn-primary w-full">
        {loading ? 'Submitting...' : 'Submit Check-in'}
      </button>
    </div>
  );
}
