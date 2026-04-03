import { fiberCall, ChannelConfig } from './ChannelManager'

export type FiberCurrency = 'Fibb' | 'Fibt' | 'Fibd'

export interface InvoiceParams {
    amountShannons?: string
    description?: string
    currency?: FiberCurrency
    expirySeconds?: number
}

export async function generateInvoice(cfg: ChannelConfig, params: InvoiceParams) {
    const { amountShannons, description, currency = 'Fibt', expirySeconds = 3600 } = params
    return fiberCall(
        'new_invoice',
        [{ amount: amountShannons, currency, description, expiry: expirySeconds }],
        cfg.fiberNodeUrl,
        cfg.fiberAuthToken
    )
}

export async function decodeInvoice(cfg: ChannelConfig, invoice: string) {
    return fiberCall('parse_invoice', [{ invoice }], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}

export async function payInvoice(cfg: ChannelConfig, invoice: string, feeLimit?: string, timeout = 60) {
    return fiberCall(
        'pay_invoice',
        [{ invoice, fee_limit: feeLimit, timeout }],
        cfg.fiberNodeUrl,
        cfg.fiberAuthToken
    )
}

export async function getPaymentStatus(cfg: ChannelConfig, paymentHash: string) {
    return fiberCall('get_payment', [{ payment_hash: paymentHash }], cfg.fiberNodeUrl, cfg.fiberAuthToken)
}
