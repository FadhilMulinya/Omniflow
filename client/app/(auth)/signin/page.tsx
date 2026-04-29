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

export function GoogleSignInButton() {
  const handleGoogleSignIn = () => {
    if (!API_URL) {
      toast.error('API URL is not configured');
      return;
    }
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}
      className="flex items-center gap-3 w-full h-12 px-4 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Google G Logo */}
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48" className="flex-shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>

      {/* Label */}
      <span className="flex-1 text-center text-h1 font-bold text-gray-700 tracking-wide">
        Continue with Google
      </span>
    </button>
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