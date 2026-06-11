'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { UserRole } from '@edu-savvy/shared';

export function PlaceholderPage({
  title,
  description,
  roles,
}: {
  title: string;
  description: string;
  roles: UserRole[];
}) {
  return (
    <ProtectedRoute roles={roles}>
      <DashboardLayout title={title}>
        <div className="card p-8 text-center max-w-lg mx-auto">
          <p className="text-gray-500">{description}</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
