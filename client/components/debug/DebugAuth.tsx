'use client';

import { useState } from 'react';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/buttons/button';

export function DebugAuth() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testAuth = async () => {
        setLoading(true);
        try {
            const data = await authApi.getMe();
            setResult({ status: 200, body: data });
        } catch (err: any) {
            setResult({ status: 'Error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl bg-card space-y-4">
            <h3 className="font-bold">Debug Auth Utility</h3>
            <Button onClick={testAuth} disabled={loading}>
                {loading ? 'Testing...' : 'Test GET /api/auth/me'}
            </Button>
            {result && (
                <pre className="text-xs p-2 bg-muted rounded overflow-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
