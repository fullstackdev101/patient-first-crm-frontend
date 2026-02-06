'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [userRoleId, setUserRoleId] = useState<number | null>(null);

    useEffect(() => {
        // Get user role_id from localStorage (Zustand persist stores in 'auth-storage')
        const authStorageStr = localStorage.getItem('auth-storage');
        if (authStorageStr) {
            try {
                const authStorage = JSON.parse(authStorageStr);
                const roleId = authStorage.state?.user?.role_id || null;
                console.log('🔍 Sidebar - User role_id from localStorage:', roleId);
                console.log('🔍 Sidebar - Full user object:', authStorage.state?.user);
                setUserRoleId(roleId);
            } catch (error) {
                console.error('Error parsing auth-storage from localStorage:', error);
            }
        } else {
            console.log('⚠️ Sidebar - No auth-storage found in localStorage');
        }
    }, []);

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    // Define which modules each role can access
    const canAccessModule = (module: string) => {
        console.log(`🔍 Sidebar - Checking access for module: ${module}, userRoleId: ${userRoleId}`);

        if (!userRoleId) {
            console.log('⚠️ Sidebar - No role loaded, showing all modules');
            return true; // Show all if role not loaded yet
        }

        // Agent (3), License Agent (4), and QA Review (5) can access Dashboard and Leads only
        if (userRoleId === 3 || userRoleId === 4 || userRoleId === 5) {
            const hasAccess = module === 'dashboard' || module === 'leads';
            console.log(`🔍 Sidebar - Role ID ${userRoleId}, module ${module}: ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
            return hasAccess;
        }

        // All other roles can access everything
        console.log(`🔍 Sidebar - Role ID ${userRoleId}, module ${module}: ALLOWED`);
        return true;
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">PF</div>
                    <span className="logo-text">PatientFirst</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {canAccessModule('dashboard') && (
                    <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                            </path>
                        </svg>
                        <span>Dashboard</span>
                    </Link>
                )}

                {canAccessModule('leads') && (
                    <Link
                        href={userRoleId === 3 ? '/leads-agent' : '/leads'}
                        className={`nav-item ${isActive('/leads') || isActive('/leads-agent') ? 'active' : ''}`}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                        <span>Leads</span>
                    </Link>
                )}

                {canAccessModule('users') && (
                    <Link href="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                            </path>
                        </svg>
                        <span>Users</span>
                    </Link>
                )}

                {/* Teams - Super Admin (1) and QA Manager (6) only */}
                {(userRoleId === 1 || userRoleId === 6) && (
                    <Link href="/teams" className={`nav-item ${isActive('/teams') ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                            </path>
                        </svg>
                        <span>Teams</span>
                    </Link>
                )}

                {canAccessModule('ip-access') && (
                    <Link href="/ip-access" className={`nav-item ${isActive('/ip-access') ? 'active' : ''}`}>
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                            </path>
                        </svg>
                        <span>IP Access Control</span>
                    </Link>
                )}

                {/* <Link href="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                        </path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Settings</span>
                </Link> */}
            </nav>

            <div className="sidebar-footer">
                v1.0.0 • PatientFirst CRM
            </div>
        </aside>
    );
}
