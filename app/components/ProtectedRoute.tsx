'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { token, _hasHydrated } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for zustand to hydrate from localStorage
        if (!_hasHydrated) return;

        // After hydration, if no token, redirect to login
        if (!token) {
            router.push('/login');
            return;
        }

        // Token exists, allow access
        setIsChecking(false);
    }, [token, router, _hasHydrated]);

    // Show loading while waiting for hydration or checking auth
    if (!_hasHydrated || isChecking) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--gray-600)',
            }}>
                Loading...
            </div>
        );
    }

    // If no token after hydration, don't render (will redirect)
    if (!token) {
        return null;
    }

    return <>{children}</>;
}

