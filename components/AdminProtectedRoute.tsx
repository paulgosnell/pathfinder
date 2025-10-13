'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { isCurrentUserAdmin } from '@/lib/admin/auth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return;

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      setChecking(false);

      if (!adminStatus) {
        router.push('/chat');
      }
    }

    checkAdminStatus();
  }, [user, authLoading, router]);

  // Show loading state while checking authentication and admin status
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F3' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D7CDEC] mb-4"></div>
          <p style={{ color: '#586C8E', fontSize: '14px' }}>Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin
  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
