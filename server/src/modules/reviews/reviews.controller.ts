import { FastifyInstance } from 'fastify';
import { ReviewService as ReviewsService } from './reviews.service';
import {
    cookieAuthSecurity,
    idParamSchema,
    reviewSchema,
    standardErrorResponses,
} from '../../shared/docs';

/**
 * ReviewsController: Community feedback and ratings for marketplace agents.
 */
export async function reviewsController(fastify: FastifyInstance) {

    // POST /reviews/:agentId - Submit Feedback
    fastify.post<{ Params: { agentId: string }; Body: { rating: number; comment?: string } }>(
        '/reviews/:agentId', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Reviews'],
            summary: 'Submit a review',
            description: 'Submit technical feedback or user experience rating for an agent. Limited to one review per user per agent version.',
            security: [cookieAuthSecurity],
            params: idParamSchema('Marketplace Agent ID'),
            body: {
                type: 'object',
                required: ['rating'],
                properties: {
                    rating: { type: 'number', minimum: 1, maximum: 5, description: 'Star rating from 1 to 5' },
                    comment: { type: 'string', description: 'Optional detailed feedback' },
                },
            },
            response: {
                201: {
                    description: 'Review submitted successfully',
                    ...reviewSchema,
                },
                ...standardErrorResponses([400, 401, 403, 500]),
            },
        },
    },
        async (request, reply) => {
            try {
                const review = await ReviewsService.submitReview(request.params.agentId, request.user.id, request.body.rating, request.body.comment);
                return reply.code(201).send(review);
            } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
        }
    );

    // GET /reviews/:agentId - View agent feedback
    fastify.get<{ Params: { agentId: string } }>('/reviews/:agentId', {
        schema: {
            tags: ['Reviews'],
            summary: 'List reviews for an agent',
            description: 'Returns public reviews and ratings for a given marketplace agent.',
            params: idParamSchema('Marketplace Agent ID'),
            response: {
                200: {
                    description: 'List of public reviews',
                    type: 'array',
                    items: reviewSchema,
                },
                ...standardErrorResponses([404, 500]),
            },
        },
    }, async (request, reply) => {
        try { return await ReviewsService.listReviews(request.params.agentId, 1, 50); }
        catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
    });

    // GET /reviews/mine - Personal history
    fastify.get('/reviews/mine', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Reviews'],
            summary: 'Get my reviews',
            description: 'Returns all reviews submitted by the current user across all marketplace agents.',
            security: [cookieAuthSecurity],
            response: {
                200: {
                    description: 'User\'s review history',
                    type: 'array',
                    items: reviewSchema,
                },
                ...standardErrorResponses([401, 500]),
            },
        },
    }, async (request, reply) => {
        try { return await ReviewsService.getMyReview(request.user.id, ''); }
        catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
    });
}
