'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { AuthUI, OtpVerifyForm } from '@/components/ui/auth-fuse';

type Step = 'form' | 'otp';

export default function SignupPage() {
    const [step, setStep] = useState<Step>('form');
    const [pendingEmail, setPendingEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async ({ username, password }: { username: string; password: string }) => {
        setError('');
        setLoading(true);
        try {
            await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async ({ username, email, password }: { username: string; email: string; password: string }) => {
        setError('');
        setLoading(true);
        try {
            const res = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            if (res.requiresVerification) {
                setPendingEmail(email);
                setStep('otp');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (code: string) => {
        setError('');
        setLoading(true);
        try {
            await apiFetch('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ email: pendingEmail, code }),
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-[350px]">
                    <OtpVerifyForm
                        email={pendingEmail}
                        purpose="signup"
                        onSubmit={handleVerifyOtp}
                        onBack={() => { setStep('form'); setError(''); }}
                        error={error}
                        loading={loading}
                    />
                </div>
            </div>
        );
    }

    return (
        <AuthUI
            defaultSignIn={false}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            error={error}
            loading={loading}
        />
    );
}
