import { FastifyPluginAsync } from 'fastify'
import { startAgent, stopAgent, getAgentStatus, getCommandHistory } from './handlers'

export const agentControlRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/:id/start',    startAgent)
    fastify.post('/:id/stop',     stopAgent)
    fastify.get('/:id/status',    getAgentStatus)
    fastify.get('/:id/commands',  getCommandHistory)
}
