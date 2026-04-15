import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DeveloperApiKeyRepository } from './developer-api-key.repository';
import { ApiKeyAuthContext } from '../../shared/contracts/auth';
import { Workspace } from '../../infrastructure/database/models/Workspace';

export const DeveloperApiKeyService = {
    async createApiKeyForUser(userId: string, name: string, scopes: string[] = ['*']) {
        const workspace = await Workspace.findOne({ ownerId: userId });
        if (!workspace) throw { code: 404, message: 'Workspace not found' };

        const rawKey = `onh_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 7);
        const hashedKey = await bcrypt.hash(rawKey, 10);

        const apiKey = await DeveloperApiKeyRepository.create({
            userId,
            workspaceId: String(workspace._id),
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

    async authenticate(rawKey: string): Promise<ApiKeyAuthContext | null> {
        if (!rawKey.startsWith('onh_')) return null;

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
        const keys = await DeveloperApiKeyRepository.findByUserId(userId);
        return keys.map(key => ({
            id: key._id,
            name: key.name,
            keyPrefix: key.keyPrefix,
            scopes: key.scopes,
            isActive: key.isActive,
            lastUsedAt: key.lastUsedAt,
            createdAt: key.createdAt,
            expiresAt: key.expiresAt,
        }));
    },

    async revokeKey(id: string, userId: string) {
        const key = await DeveloperApiKeyRepository.findById(id);
        if (!key || String(key.userId) !== userId) {
            throw { code: 404, message: 'Key not found or unauthorized' };
        }

        return DeveloperApiKeyRepository.update(id, { isActive: false } as any);
    }
};
