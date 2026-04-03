import crypto from 'crypto'

/** Generate a secure per-agent API key. Returns raw key (shown once) + hash + prefix. */
export function generateAgentApiKey(): { raw: string; hash: string; prefix: string } {
    const raw    = `omni_${crypto.randomBytes(24).toString('hex')}`
    const hash   = crypto.createHash('sha256').update(raw).digest('hex')
    const prefix = raw.slice(0, 10)
    return { raw, hash, prefix }
}

/** Verify a raw key against its stored hash. */
export function verifyAgentApiKey(raw: string, hash: string): boolean {
    const attempt = crypto.createHash('sha256').update(raw).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'))
}

/** Extract key from Authorization header: Bearer <key> or X-Agent-Key: <key> */
export function extractKeyFromRequest(headers: Record<string, any>): string | null {
    const auth = headers['authorization'] as string | undefined
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
    const direct = headers['x-agent-key'] as string | undefined
    if (direct) return direct.trim()
    return null
}
