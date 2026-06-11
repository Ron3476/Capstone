'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessagesPanel } from '@/components/messages/MessagesPanel';

export default function CounselorMessagesPage() {
  return (
    <ProtectedRoute roles={['COUNSELOR']}>
      <DashboardLayout title="Messages">
        <MessagesPanel />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
