'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, MessageSquare, Brain, Heart,
  Users, BarChart3, GraduationCap, FileText, Settings,
  AlertTriangle, Briefcase, ClipboardList, LogOut, Moon, Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@edu-savvy/shared';

const navItems: Record<UserRole, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  STUDENT: [
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Courses', icon: BookOpen },
    { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/student/tutor', label: 'AI Tutor', icon: Brain },
    { href: '/student/mood', label: 'Well-being', icon: Heart },
    { href: '/student/career', label: 'Career Guide', icon: Briefcase },
  ],
  TEACHER: [
    { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/classes', label: 'Classes', icon: Users },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/teacher/ai-tools', label: 'AI Tools', icon: Brain },
    { href: '/teacher/alerts', label: 'Student Alerts', icon: AlertTriangle },
    { href: '/teacher/messages', label: 'Messages', icon: MessageSquare },
  ],
  PARENT: [
    { href: '/parent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/parent/performance', label: 'Performance', icon: BarChart3 },
    { href: '/parent/attendance', label: 'Attendance', icon: ClipboardList },
    { href: '/parent/reports', label: 'AI Reports', icon: FileText },
    { href: '/parent/messages', label: 'Messages', icon: MessageSquare },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  COUNSELOR: [
    { href: '/counselor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/counselor/alerts', label: 'Well-being Alerts', icon: AlertTriangle },
    { href: '/counselor/students', label: 'Students', icon: Users },
    { href: '/counselor/messages', label: 'Messages', icon: MessageSquare },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">EduSavvy AI</h1>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <div className="px-3 py-2 text-xs text-gray-400">
          {user.firstName} {user.lastName}
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
