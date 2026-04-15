import { FastifyInstance } from 'fastify';
import { SupportService } from './support.service';
import type { AuthenticatedUser } from '../../shared/contracts/auth';

export async function supportController(fastify: FastifyInstance) {
    fastify.post<{ Body: { subject: string; message: string } }>(
        '/tickets', { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const user = request.user as AuthenticatedUser;
            try {
                const ticket = await SupportService.createTicket(user.id, request.body.subject, request.body.message);
                return reply.code(201).send(ticket);
            } catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );

    fastify.get(
        '/tickets', { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const user = request.user as AuthenticatedUser;
            return reply.send(await SupportService.listTickets(user.id));
        }
    );
}
