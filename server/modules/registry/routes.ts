import { FastifyPluginAsync } from 'fastify'
import {
    registerAgent, listRegistryAgents, getRegistryAgent,
    wellKnownAgent, heartbeat, deregisterAgent, rotateApiKey,
} from './handlers'

export const registryRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/register',                       registerAgent)
    fastify.get('/agents',                          listRegistryAgents)
    fastify.get('/agents/:id',                      getRegistryAgent)
    fastify.get('/well-known/:agentId',             wellKnownAgent)
    fastify.put('/agents/:id/heartbeat',            heartbeat)
    fastify.delete('/agents/:id',                   deregisterAgent)
    fastify.post('/agents/:id/rotate-key',          rotateApiKey)
}
