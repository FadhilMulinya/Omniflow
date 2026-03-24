import { FastifyPluginAsync } from 'fastify';
import { User } from '../models/User';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
    // Get current user profile
    fastify.get('/me', async (request, reply) => {
        try {
            const token = request.cookies['auth_token'];
            if (!token) return reply.code(401).send({ error: 'Unauthorized' });

            const decoded = fastify.jwt.verify(token) as any;
            const user = await User.findById(decoded.id).select('-password');

            if (!user) return reply.code(404).send({ error: 'User not found' });
            return user;
        } catch (err) {
            return reply.code(401).send({ error: 'Invalid token' });
        }
    });

    // Update current user profile
    fastify.post<{ Body: { username?: string; email?: string; whatsapp?: string; telegramUsername?: string } }>(
        '/me',
        async (request, reply) => {
            try {
                const token = request.cookies['auth_token'];
                if (!token) return reply.code(401).send({ error: 'Unauthorized' });

                const decoded = fastify.jwt.verify(token) as any;
                const { username, email, whatsapp, telegramUsername } = request.body;

                const user = await User.findByIdAndUpdate(
                    decoded.id,
                    { $set: { username, email, whatsapp, telegramUsername } },
                    { new: true }
                ).select('-password');

                if (!user) return reply.code(404).send({ error: 'User not found' });
                return user;
            } catch (err) {
                return reply.code(401).send({ error: 'Invalid token' });
            }
        }
    );

    fastify.get('/users', async (request, reply) => {
        const users = await User.find({});
        return users;
    });

    fastify.post<{ Body: { walletAddress: string; email?: string; name?: string } }>(
        '/users',
        async (request, reply) => {
            const { walletAddress, email, name } = request.body;
            const user = new User({ walletAddress, email, name });
            await user.save();
            return reply.code(201).send(user);
        }
    );
};
