import { ExecutionService } from '../modules/executions/execution.service';
import { FlowEngine } from '../core/engine/FlowEngine';
import { AuthContext } from '../shared/contracts/auth';

/**
 * OnhandlSDKInternal
 * Internal server-side methods that accept trusted AuthContext.
 * These are used by the /sdk routes.
 */
export const OnhandlSDKInternal = {
    async startExecution(agentId: string, auth: AuthContext, initialState?: any) {
        return ExecutionService.start(agentId, auth, initialState);
    },

    async runExecution(executionId: string, auth: AuthContext) {
        // Authorization check
        await ExecutionService.getById(executionId, auth);
        return FlowEngine.runExecution(executionId);
    },

    async simulateNode(data: any, auth: AuthContext) {
        return ExecutionService.simulateNode(data, auth);
    },

    async getExecution(executionId: string, auth: AuthContext) {
        const execution = await ExecutionService.getById(executionId, auth);
        return typeof execution.toObject === 'function' ? execution.toObject() : execution;
    },

    async listExecutions(agentId: string | undefined, auth: AuthContext) {
        const executions = await ExecutionService.list(agentId, auth);
        return executions.map(e => (typeof e.toObject === 'function' ? e.toObject() : e));
    }
};
