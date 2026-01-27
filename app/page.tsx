'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export default function Home() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for zustand to hydrate from localStorage
    if (!_hasHydrated) return;

    // Redirect based on authentication status
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [_hasHydrated, token, router]);

  // Show loading while checking auth
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: '#6b7280',
    }}>
      Loading...
    </div>
  );
}
