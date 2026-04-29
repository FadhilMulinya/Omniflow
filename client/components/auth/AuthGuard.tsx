'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/auth.api';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            try {
                await authApi.getMe();
                setAuthenticated(true);
            } catch (err) {
                console.error('Auth verification failed:', err);
                router.push('/signin');
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
                >
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">
                        Verifying Session...
                    </p>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (!authenticated) return null;

    return <>{children}</>;
}
