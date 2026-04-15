/**
 * OnhandlSDK
 * A production-ready HTTP-based SDK for Onhandl developers.
 * Communicates with the backend over authenticated HTTP.
 */
export class OnhandlSDK {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: { apiKey: string; baseUrl?: string }) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || 'http://localhost:3001').replace(/\/$/, '') + '/api/sdk';
    }

    private async request(path: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP error ${response.status}`);
        }

        return response.json();
    }

    /**
     * Starts a new execution for a given agent.
     */
    async startExecution(agentId: string, initialState?: any) {
        return this.request('/executions/start', {
            method: 'POST',
            body: JSON.stringify({ agentId, initialState }),
        });
    }

    /**
     * Resumes or runs a specific execution by ID.
     */
    async runExecution(executionId: string) {
        return this.request(`/executions/${executionId}/run`, {
            method: 'POST',
        });
    }

    /**
     * Simulates a single node execution.
     */
    async simulateNode(payload: {
        node?: any;
        nodeData?: any;
        nodeType?: string;
        inputValues?: Record<string, unknown>;
        agentId?: string;
    }) {
        return this.request('/executions/simulate-node', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Retrieves an execution by ID.
     */
    async getExecution(executionId: string) {
        return this.request(`/executions/${executionId}`);
    }

    /**
     * Lists executions, optionally filtered by agent.
     */
    async listExecutions(agentId?: string) {
        const query = agentId ? `?agentId=${agentId}` : '';
        return this.request(`/executions${query}`);
    }
}
