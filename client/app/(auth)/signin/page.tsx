'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface SignInProps {
    onSuccess?: () => void;
}

function GoogleSignInButton() {
    const handleGoogleSignIn = () => {
        if (!API_URL) {
            toast.error('API URL is not configured');
            return;
        }

        window.location.href = `${API_URL}/api/auth/google`;
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-2xl font-bold border-border"
        >
            Continue with Google
        </Button>
    );
}

export default function SignIn({ onSuccess }: SignInProps = {}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ identifier: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.identifier.trim() || !form.password.trim()) {
            toast.error('Email/username and password are required');
            return;
        }

        setLoading(true);

        try {
            await authApi.login({
                username: form.identifier.trim(),
                password: form.password,
            });

            toast.success('Welcome back!');

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error('Login failed', {
                description: error?.message || 'Invalid credentials',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-3xl border border-border shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} />
                    </div>

                    <h1 className="text-2xl font-black tracking-tight uppercase">
                        Login to Onhandl
                    </h1>

                    <p className="text-muted-foreground text-sm mt-1 font-medium">
                        Continue managing your autonomous treasury
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email or Username</Label>
                        <Input
                            required
                            placeholder="Enter your email or username"
                            value={form.identifier}
                            onChange={(e) =>
                                setForm({ ...form, identifier: e.target.value })
                            }
                            className="rounded-2xl h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Password</Label>
                            <Link
                                href="/forgot-password"
                                title="Forgot Password?"
                                className="text-[11px] font-bold text-primary hover:underline"
                            >
                                Forgot?
                            </Link>
                        </div>

                        <Input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            className="rounded-2xl h-12"
                        />
                    </div>

                    <Button
                        disabled={loading}
                        type="submit"
                        className="w-full h-12 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </>
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-3 text-muted-foreground font-bold">
                            Or
                        </span>
                    </div>
                </div>

                <GoogleSignInButton />

                <p className="text-center text-sm font-medium text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-primary font-bold hover:underline"
                    >
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
}