import { User } from '../../infrastructure/database/models/User';

export const UserRepository = {
    async findById(id: string, select?: string) {
        return select ? User.findById(id).select(select).lean() : User.findById(id).lean();
    },
    async findByIdAndUpdate(id: string, update: Record<string, unknown>, options?: any) {
        return User.findByIdAndUpdate(id, update, options);
    },
    async findByStripeId(userId: string) {
        return User.findById(userId).select('stripeAccountId');
    },
    async updateStripeAccountId(userId: string, stripeAccountId: string) {
        return User.findByIdAndUpdate(userId, { stripeAccountId });
    },
};
