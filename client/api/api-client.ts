const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Automatic hybrid key management:
    // If we're calling an AI endpoint, try to inject the key from localStorage
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Inject Workspace ID if present in localStorage
    if (typeof window !== 'undefined') {
        const workspaceId = localStorage.getItem('active_workspace_id');
        if (workspaceId) {
            headers['x-workspace-id'] = workspaceId;
        }
    }

    if (typeof window !== 'undefined' && (endpoint.includes('/ai/') || endpoint.includes('/test-connection'))) {
        try {
            const body = options.body ? JSON.parse(options.body as string) : {};
            const provider = body.provider || 'gemini';
            const apiKey = localStorage.getItem(`${provider.toLowerCase()}_api_key`);
            if (apiKey) {
                headers['x-ai-api-key'] = apiKey;
            }
        } catch (e) {
            // Body might not be JSON or might be missing
        }
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (!response.ok) {
        let errorMsg = response.statusText || 'An error occurred';
        try {
            const body = await response.json();
            errorMsg = body.error || body.message || errorMsg;
        } catch (e) {
            // response not json
        }
        throw new Error(errorMsg);
    }

    return response.json();
}
