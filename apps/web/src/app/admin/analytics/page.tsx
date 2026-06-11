'use client';

import { PlaceholderPage } from '@/components/ui/PlaceholderPage';

export default function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Advanced school analytics — attendance trends, performance heatmaps, and risk predictions. Core metrics are available on the main dashboard."
      roles={['ADMIN']}
    />
  );
}
