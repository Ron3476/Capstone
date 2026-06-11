'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TutorChat } from '@/components/ai/TutorChat';

export default function TutorPage() {
  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="AI Tutor">
        <TutorChat />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
