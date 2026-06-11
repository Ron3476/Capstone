'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MoodCheckIn } from '@/components/ai/MoodCheckIn';

export default function MoodPage() {
  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="Well-being Check-in">
        <MoodCheckIn />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
