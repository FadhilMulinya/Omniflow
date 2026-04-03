import { FastifyInstance } from 'fastify';
import { handleSimulateNode } from './handlers';

export async function nodeSimulatorRoutes(fastify: FastifyInstance) {
  fastify.post('/node', {
    schema: {
      body: {
        type: 'object',
        required: ['nodeType', 'nodeData'],
        properties: {
          nodeType:    { type: 'string' },
          nodeData:    { type: 'object' },
          inputValues: { type: 'object' },
          agentId:     { type: 'string' },
        },
      },
    },
  }, handleSimulateNode);
}
