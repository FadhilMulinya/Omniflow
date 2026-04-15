import { SDKConfig, SDKExecution, SDKListResponse, SDKErrorResponse } from '../shared/contracts/sdk';

/**
 * OnhandlSDKError
 * Custom error class for SDK-specific errors.
 */
export class OnhandlSDKError extends Error {
    public statusCode: number;
    public payload: any;

    constructor(message: string, statusCode: number, payload: any = {}) {
        super(message);
        this.name = 'OnhandlSDKError';
        this.statusCode = statusCode;
        this.payload = payload;
    }
}

/**
 * OnhandlSDK
 * A production-ready HTTP-based SDK for Onhandl developers.
 * Communicates with the backend over authenticated HTTP.
 */
export class OnhandlSDK {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: SDKConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || 'http://localhost:3001').replace(/\/$/, '') + '/api/sdk';
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers,
        };

        let response: Response;
        try {
            response = await fetch(url, { ...options, headers });
        } catch (err: any) {
            throw new OnhandlSDKError(`Network error: ${err.message}`, 0);
        }

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new OnhandlSDKError(
                errorPayload.error || `HTTP error ${response.status}`,
                response.status,
                errorPayload
            );
        }

        return response.json();
    }

    /**
     * Starts a new execution for a given agent.
     */
    async startExecution(params: { agentId: string; initialState?: any }): Promise<SDKExecution> {
        return this.request<SDKExecution>('/executions/start', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Resumes or runs a specific execution by ID.
     */
    async runExecution(params: { executionId: string }): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/executions/${params.executionId}/run`, {
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
    }): Promise<any> {
        return this.request<any>('/executions/simulate-node', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /**
     * Retrieves an execution by ID.
     */
    async getExecution(params: { executionId: string }): Promise<SDKExecution> {
        return this.request<SDKExecution>(`/executions/${params.executionId}`);
    }

    /**
     * Lists executions, optionally filtered by agent.
     */
    async listExecutions(params: { agentId?: string } = {}): Promise<SDKExecution[]> {
        const query = params.agentId ? `?agentId=${params.agentId}` : '';
        return this.request<SDKExecution[]>(`/executions${query}`);
    }
}
