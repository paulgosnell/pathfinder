'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <ProtectedRoute>
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      {children}
    </ProtectedRoute>
  );
}
