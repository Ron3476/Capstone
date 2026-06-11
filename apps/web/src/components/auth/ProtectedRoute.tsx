'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@edu-savvy/shared';
import { ROLE_ROUTES } from '@edu-savvy/shared';

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && roles && !roles.includes(user.role)) {
      router.push(ROLE_ROUTES[user.role]);
    }
  }, [user, loading, roles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (roles && !roles.includes(user.role))) return null;

  return <>{children}</>;
}
