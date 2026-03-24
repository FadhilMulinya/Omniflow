// Crypto Simulation Helpers

export function generateRandomAddress(network: string): string {
    const prefix =
        network === 'Ethereum' || network === 'Binance Smart Chain' || network === 'Polygon'
            ? '0x'
            : '';
    const chars = '0123456789abcdef';
    let result = prefix;

    for (let i = 0; i < (network === 'Solana' ? 44 : 40); i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export function generateRandomBalance(network: string): string {
    let base: number;

    switch (network) {
        case 'Ethereum':
            base = Math.random() * 10;
            break;
        case 'Binance Smart Chain':
            base = Math.random() * 100;
            break;
        case 'Polygon':
            base = Math.random() * 1000;
            break;
        case 'Solana':
            base = Math.random() * 100;
            break;
        default:
            base = Math.random() * 10;
    }

    return base.toFixed(4);
}

export function getCurrencyForNetwork(network: string): string {
    switch (network) {
        case 'Ethereum':
            return 'ETH';
        case 'Binance Smart Chain':
            return 'BNB';
        case 'Polygon':
            return 'MATIC';
        case 'Solana':
            return 'SOL';
        default:
            return 'ETH';
    }
}

export function generateRandomTxId(network: string): string {
    const prefix =
        network === 'Ethereum' || network === 'Binance Smart Chain' || network === 'Polygon'
            ? '0x'
            : '';
    const chars = '0123456789abcdef';
    let result = prefix;

    for (let i = 0; i < 64; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export function generateRandomPrice(token: string): number {
    switch (token.toUpperCase()) {
        case 'BTC':
            return 30000 + Math.random() * 10000;
        case 'ETH':
            return 1800 + Math.random() * 400;
        case 'SOL':
            return 80 + Math.random() * 40;
        case 'BNB':
            return 200 + Math.random() * 100;
        case 'MATIC':
            return 0.5 + Math.random() * 0.5;
        case 'USDT':
        case 'USDC':
            return 0.99 + Math.random() * 0.02;
        default:
            return 10 + Math.random() * 90;
    }
}
