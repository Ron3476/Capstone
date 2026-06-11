'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {title && (
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <h1 className="text-xl font-semibold">{title}</h1>
          </header>
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
