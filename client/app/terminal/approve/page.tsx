'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function TerminalApprovePage() {
    const searchParams = useSearchParams();
    const userCode = searchParams.get('userCode');

    const { user, workspaces, activeWorkspace } = useAuth();

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!userCode) {
            setStatus('error');
            setErrorMessage('Invalid session link: userCode is missing.');
        }
    }, [userCode]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
                <Card className="w-full max-w-md border-neutral-800 bg-neutral-900">
                    <CardHeader>
                        <CardTitle>Terminal Login</CardTitle>
                        <CardDescription>Please log in to the web interface first to approve this terminal session.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        {/* Could add a login button redirecting back to here */}
                        <Button className="w-full" onClick={() => window.location.href = `/login?redirect=/terminal/approve?userCode=${userCode}`}>
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const handleApprove = async () => {
        if (!userCode) return;
        setStatus('loading');

        try {
            await apiClient.post('/terminal/auth/approve', {
                userCode,
                workspaceId: activeWorkspace?._id || workspaces[0]?._id
            });
            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.error || 'Failed to approve session. It may have expired.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
            <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-neutral-100">
                <CardHeader>
                    <CardTitle className="text-xl">Onhandl Terminal Request</CardTitle>
                    <CardDescription className="text-neutral-400">
                        A terminal session is requesting access to your Onhandl account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'error' && (
                        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                            {errorMessage}
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm">
                            Session approved! You may now close this window and return to your terminal.
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="bg-neutral-950 p-4 rounded-lg font-mono text-center tracking-widest text-2xl border border-neutral-800">
                            {userCode}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {status === 'idle' || status === 'error' ? (
                        <Button
                            className="w-full bg-white text-black hover:bg-neutral-200"
                            onClick={handleApprove}
                            disabled={status === 'loading' || !userCode}
                        >
                            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Approve Access
                        </Button>
                    ) : (
                        <Button className="w-full border border-neutral-700 bg-transparent text-white" variant="outline" onClick={() => window.close()}>
                            Close Window
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
