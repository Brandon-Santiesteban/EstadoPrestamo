'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from '@/components/dashboard-client';
import { AUTH_KEY } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== 'ok') {
      router.push('/login');
    }
  }, [router]);

  return <DashboardClient />;
}
