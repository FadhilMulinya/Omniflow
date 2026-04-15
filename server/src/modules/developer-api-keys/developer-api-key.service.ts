import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DeveloperApiKeyRepository } from './developer-api-key.repository';
import { AuthContext } from '../../shared/contracts/auth';

export const DeveloperApiKeyService = {
    async createApiKey(userId: string, workspaceId: string, name: string, scopes: string[] = ['*']) {
        const rawKey = `onh_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 7); // sk_ + 4 chars
        const hashedKey = await bcrypt.hash(rawKey, 10);

        const apiKey = await DeveloperApiKeyRepository.create({
            userId,
            workspaceId,
            name,
            keyPrefix,
            hashedKey,
            scopes,
            isActive: true,
        });

        return {
            id: apiKey._id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            rawKey, // Only returned once
            scopes: apiKey.scopes,
            createdAt: apiKey.createdAt,
        };
    },

    async authenticate(rawKey: string): Promise<AuthContext | null> {
        if (!rawKey.startsWith('sk_')) return null;

        const keyPrefix = rawKey.substring(0, 7);
        const keys = await DeveloperApiKeyRepository.findByPrefix(keyPrefix);

        for (const key of keys) {
            const isMatch = await bcrypt.compare(rawKey, key.hashedKey);
            if (isMatch) {
                // Update last used
                await DeveloperApiKeyRepository.update(String(key._id), { lastUsedAt: new Date() } as any);

                return {
                    userId: String(key.userId),
                    workspaceId: String(key.workspaceId),
                    type: 'api_key',
                    apiKeyId: String(key._id),
                    scopes: key.scopes,
                };
            }
        }

        return null;
    },

    async listKeys(userId: string) {
        return DeveloperApiKeyRepository.findByUserId(userId);
    },

    async revokeKey(id: string, userId: string) {
        const key = await DeveloperApiKeyRepository.findById(id);
        if (!key || String(key.userId) !== userId) throw new Error('Key not found or unauthorized');

        return DeveloperApiKeyRepository.update(id, { isActive: false } as any);
    }
};
