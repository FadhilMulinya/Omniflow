/**
 * SDK Contracts
 * Standardized shapes for SDK requests and responses.
 */

export interface SDKConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface SDKExecution {
    id: string;
    agentDefinitionId: string;
    status: string;
    state: Record<string, any>;
    triggeredBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SDKListResponse<T> {
    data: T[];
    count: number;
}

export interface SDKErrorResponse {
    error: string;
    code?: number;
    details?: any;
}
