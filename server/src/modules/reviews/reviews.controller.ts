import { FastifyPluginAsync } from 'fastify';
import { ReviewService } from './reviews.service';
import type { AuthenticatedUser } from '../../shared/contracts/auth';

export const reviewsController: FastifyPluginAsync = async (fastify) => {

    fastify.post<{ Params: { id: string }; Body: { rating: number; comment?: string } }>(
        '/agents/:id/reviews', { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const user = request.user as AuthenticatedUser;
            try {
                return reply.send(await ReviewService.submitReview(user.id, request.params.id, request.body.rating, request.body.comment));
            } catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );

    fastify.get<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>(
        '/agents/:id/reviews',
        async (request) => {
            return ReviewService.listReviews(request.params.id, parseInt(request.query.page ?? '1'), parseInt(request.query.limit ?? '10'));
        }
    );

    fastify.get<{ Params: { id: string } }>(
        '/agents/:id/reviews/mine', { onRequest: [fastify.authenticate] },
        async (request) => {
            const user = request.user as AuthenticatedUser;
            return ReviewService.getMyReview(user.id, request.params.id);
        }
    );
};
