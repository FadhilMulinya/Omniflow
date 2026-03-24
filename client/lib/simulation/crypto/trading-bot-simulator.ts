import { generateRandomPrice } from './helpers';

export async function simulateTradingBot(data: any, inputValues: Record<string, any>) {
    const outputs: Record<string, any> = {};
    let walletInfo = null;

    if (inputValues['walletInfo']) {
        walletInfo = inputValues['walletInfo'];
    } else if (data.inputs?.find((input: any) => input.key === 'walletInfo')?.value) {
        walletInfo = data.inputs.find((input: any) => input.key === 'walletInfo').value;
    }

    if (walletInfo && typeof walletInfo === 'object') {
        if (walletInfo.walletInfo) {
            walletInfo = walletInfo.walletInfo;
        }
    }

    const isWalletConnected = walletInfo && (walletInfo.connected === true || walletInfo.address);
    const strategy = data.inputs?.find((input: any) => input.key === 'strategy')?.value || 'Balanced';
    const tokens = data.inputs?.find((input: any) => input.key === 'tokens')?.value || ['ETH', 'BTC'];
    const budget = data.inputs?.find((input: any) => input.key === 'budget')?.value || 1000;
    const timeframe = data.inputs?.find((input: any) => input.key === 'timeframe')?.value || '4h';

    if (!isWalletConnected) {
        outputs['recommendation'] = {
            action: 'none',
            token: 'N/A',
            reason: 'Wallet not connected. Please connect a wallet first.',
        };
        return outputs;
    }

    const marketAnalysis = tokens.map((token: any) => ({
        token,
        price: generateRandomPrice(token),
        change24h: (Math.random() * 20 - 10).toFixed(2),
        sentiment: ['Bearish', 'Neutral', 'Bullish'][Math.floor(Math.random() * 3)],
    }));

    try {
        const { getBestAvailableAIService } = await import('../../services/ai-service');
        const provider = data.modelProvider || 'gemini';
        const aiService = getBestAvailableAIService(provider);

        const prompt = `As a ${strategy} trading agent, analyze factors... (simplified for brevity or refer to character profiles)`;
        const aiResponse = await aiService.generateText(prompt, { character: data.character });

        const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const recommendation = JSON.parse(jsonMatch[0]);
            outputs['recommendation'] = {
                ...recommendation,
                price: marketAnalysis.find((t: any) => t.token === recommendation.token)?.price || 0,
            };
        } else {
            throw new Error("AI parsing error");
        }
    } catch (error) {
        const selectedToken = marketAnalysis[0];
        outputs['recommendation'] = {
            action: Number.parseFloat(selectedToken.change24h) > 0 ? 'buy' : 'hold',
            token: selectedToken.token,
            amount: (budget * 0.1).toFixed(2),
            price: selectedToken.price,
            reason: "Simulation fallback active."
        };
    }

    outputs['analysis'] = { market: marketAnalysis, timeframe, timestamp: new Date().toISOString() };
    outputs['performance'] = { winRate: (50 + Math.random() * 20).toFixed(1), profit: (Math.random() * 10).toFixed(2) };
    outputs['walletInfo'] = walletInfo;

    return outputs;
}
