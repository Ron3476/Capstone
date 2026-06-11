'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessagesPanel } from '@/components/messages/MessagesPanel';

export default function TeacherMessagesPage() {
  return (
    <ProtectedRoute roles={['TEACHER']}>
      <DashboardLayout title="Messages">
        <MessagesPanel />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
