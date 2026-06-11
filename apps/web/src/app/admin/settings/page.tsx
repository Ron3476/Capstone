'use client';

import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="School Settings"
      description="Configure school profile, curriculum, branding, and integrations. Coming in Phase 2."
      roles={['ADMIN']}
    />
  );
}
