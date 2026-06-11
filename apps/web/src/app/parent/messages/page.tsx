'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessagesPanel } from '@/components/messages/MessagesPanel';

export default function ParentMessagesPage() {
  return (
    <ProtectedRoute roles={['PARENT']}>
      <DashboardLayout title="Messages">
        <MessagesPanel />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
