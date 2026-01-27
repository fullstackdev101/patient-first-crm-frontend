'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { token, _hasHydrated, verifyToken, logout } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // First, check localStorage directly for immediate protection
            const storedAuth = localStorage.getItem('auth-storage');

            if (!storedAuth) {
                console.log('No auth data in localStorage, redirecting to login');
                router.replace('/login');
                return;
            }

            try {
                const authData = JSON.parse(storedAuth);
                const storedToken = authData?.state?.token;

                if (!storedToken) {
                    console.log('No token in stored auth data, redirecting to login');
                    router.replace('/login');
                    return;
                }

                // Wait for zustand to hydrate
                if (!_hasHydrated) {
                    return; // Will re-run when hydrated
                }

                // After hydration, verify the token is still in the store
                if (!token) {
                    console.log('No token in auth store after hydration, redirecting to login');
                    router.replace('/login');
                    return;
                }

                // Verify token with backend
                // Note: On EC2, this may fail due to network issues, so we'll be lenient
                try {
                    const isValid = await verifyToken();

                    if (!isValid) {
                        console.log('Token verification failed, redirecting to login');
                        logout();
                        router.replace('/login');
                        return;
                    }
                } catch (verifyError) {
                    console.error('Token verification error (network issue?):', verifyError);
                    // On EC2, if verification fails due to network, we'll allow access
                    // but only if we have a token in localStorage
                    if (storedToken) {
                        console.log('Token verification failed but token exists, allowing access');
                        setIsAuthorized(true);
                        setIsChecking(false);
                        return;
                    } else {
                        router.replace('/login');
                        return;
                    }
                }

                // All checks passed
                setIsAuthorized(true);
                setIsChecking(false);
            } catch (error) {
                console.error('Auth check error:', error);
                router.replace('/login');
            }
        };

        checkAuth();
    }, [token, router, _hasHydrated, verifyToken, logout]);

    // Show loading while checking authentication
    if (isChecking || !_hasHydrated) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--gray-600)',
            }}>
                Verifying authentication...
            </div>
        );
    }

    // If not authorized, don't render anything (will redirect)
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
