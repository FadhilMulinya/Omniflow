/**
 * ChannelManager — high-level Fiber channel lifecycle
 * Wraps the low-level fiberRpcCall with per-agent node resolution.
 * "managed" = platform ENV node; "custom" = agent-supplied URL.
 */

const PLATFORM_FIBER_URL  = process.env.FIBER_NODE_URL  || 'http://localhost:8227'
const PLATFORM_FIBER_AUTH = process.env.FIBER_AUTH_TOKEN || ''

export async function fiberCall(method: string, params: any[], nodeUrl?: string, authToken?: string) {
    const url   = nodeUrl   || PLATFORM_FIBER_URL
    const token = authToken || PLATFORM_FIBER_AUTH

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.result
}

export interface ChannelConfig {
    fiberNodeUrl?: string   // undefined → managed (platform node)
    fiberAuthToken?: string
}

export async function openChannel(cfg: ChannelConfig, peerId: string, fundingAmountShannons: string, isPublic = true) {
    return fiberCall('open_channel', [{ peer_id: peerId, funding_amount: fundingAmountShannons, public: isPublic }], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}

export async function closeChannel(cfg: ChannelConfig, channelId: string, force = false) {
    return fiberCall('close_channel', [{ channel_id: channelId, force }], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}

export async function listChannels(cfg: ChannelConfig) {
    return fiberCall('list_channels', [], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}

export async function getNodeInfo(cfg: ChannelConfig) {
    return fiberCall('node_info', [], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}

/** Resolve ChannelConfig from AgentCard network entry */
export function resolveChannelConfig(network: { fiberNodeType?: string; fiberNodeUrl?: string }): ChannelConfig {
    if (network.fiberNodeType === 'custom') {
        if (!network.fiberNodeUrl) throw new Error('Custom Fiber node requires fiberNodeUrl')
        return { fiberNodeUrl: network.fiberNodeUrl }
    }
    // managed — use platform node
    return {}
}
