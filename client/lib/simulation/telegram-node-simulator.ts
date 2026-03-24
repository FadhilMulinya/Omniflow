// telegram-node-simulator.ts

import { timestamp } from './index';

// Simulate sending a message to Telegram
export async function simulateTelegramSendMessage(
  data: any,
  inputValues: Record<string, any>,
  consoleOutput: string[]
) {
  const outputData: Record<string, any> = {};

  // Get telegram configuration from node data
  const botToken = data.inputs?.find((input: any) => input.key === 'botToken')?.value || '';
  const chatId = data.inputs?.find((input: any) => input.key === 'chatId')?.value || '';
  const botName =
    data.inputs?.find((input: any) => input.key === 'botName')?.value || 'Trading Bot';

  // Get message from input or use default
  const message =
    inputValues['message'] ||
    data.inputs?.find((input: any) => input.key === 'message')?.value ||
    'Hello from Telegram Bot!';

  // Check if Telegram is configured
  const isConfigured = botToken && chatId;

  // Enhanced wallet info extraction
  let walletInfo = null;
  let tradingRecommendation = null;
  let tradeDetails = null;

  // Extract wallet info from connected nodes
  if (inputValues['walletInfo']) {
    walletInfo = inputValues['walletInfo'];
    consoleOutput.push(`${timestamp()} Received wallet info from connected node`);
  }

  // Extract trading recommendation if available
  if (inputValues['recommendation']) {
    tradingRecommendation = inputValues['recommendation'];
    consoleOutput.push(`${timestamp()} Received trading recommendation from connected node`);
  }

  // Extract trade details if available
  if (inputValues['tradeDetails'] || inputValues['details']) {
    tradeDetails = inputValues['tradeDetails'] || inputValues['details'];
    consoleOutput.push(`${timestamp()} Received trade details from connected node`);
  }

  // Generate appropriate message based on connected data
  let generatedMessage = message;

  if (walletInfo && !message.includes('wallet')) {
    const address = walletInfo.address || 'unknown';
    const network = walletInfo.network || 'Ethereum';
    const balance = walletInfo.balance || inputValues['balance'] || '0';

    generatedMessage = `💼 *Wallet Update*\nNetwork: ${network}\nAddress: ${address.substring(0, 8)}...${address.substring(address.length - 6)}\nBalance: ${balance} ${walletInfo.currency || 'ETH'}`;
  }

  if (tradingRecommendation && !message.includes('recommendation')) {
    const action = tradingRecommendation.action || 'hold';
    const token = tradingRecommendation.token || 'BTC';
    const price = tradingRecommendation.price
      ? `$${tradingRecommendation.price.toFixed(2)}`
      : 'market price';

    generatedMessage = `🤖 *Trading Recommendation*\nAction: ${action.toUpperCase()}\nToken: ${token}\nPrice: ${price}\nReason: ${tradingRecommendation.reason || 'Market analysis'}`;
  }

  if (tradeDetails && !message.includes('trade')) {
    const action = tradeDetails.action || 'buy';
    const token = tradeDetails.token || 'BTC';
    const amount = tradeDetails.amount || '0';
    const price = tradeDetails.price ? `$${tradeDetails.price}` : 'market price';

    generatedMessage = `🔄 *Trade Executed*\nAction: ${action.toUpperCase()}\nToken: ${token}\nAmount: ${amount}\nPrice: ${price}\nTotal: $${tradeDetails.total?.toFixed(2) || 'N/A'}`;
  }

  if (isConfigured) {
    // In real implementation, we would send a message via Telegram API
    // For simulation, we'll simulate a successful message delivery
    consoleOutput.push(`${timestamp()} Sending Telegram message to chat ID: ${chatId}`);
    consoleOutput.push(`${timestamp()} Message: ${generatedMessage}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update message count
    const previousMessageCount = data.outputData?.messagesSent || 0;

    // Create response
    outputData['connected'] = true;
    outputData['telegramInfo'] = {
      botToken,
      chatId,
      botName,
      lastUpdated: new Date().toISOString(),
    };
    outputData['lastMessage'] = {
      text: generatedMessage,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    outputData['messagesSent'] = previousMessageCount + 1;

    // Pass through wallet info and trading data for downstream nodes
    if (walletInfo) outputData['walletInfo'] = walletInfo;
    if (tradingRecommendation) outputData['recommendation'] = tradingRecommendation;
    if (tradeDetails) outputData['tradeDetails'] = tradeDetails;

    consoleOutput.push(`${timestamp()} Telegram message sent successfully!`);
  } else {
    // Telegram not configured
    consoleOutput.push(
      `${timestamp()} Error: Telegram is not configured. Please configure bot token and chat ID.`
    );

    outputData['connected'] = false;
    outputData['error'] = 'Telegram is not configured';
    outputData['messagesSent'] = 0;

    // Still pass through wallet info and trading data for downstream nodes
    if (walletInfo) outputData['walletInfo'] = walletInfo;
    if (tradingRecommendation) outputData['recommendation'] = tradingRecommendation;
    if (tradeDetails) outputData['tradeDetails'] = tradeDetails;
  }

  return outputData;
}

// Simulate receiving a message from Telegram
export async function simulateTelegramReceiveMessage(data: any, consoleOutput: string[]) {
  const outputData: Record<string, any> = {};

  // Get telegram configuration from node data
  const botToken = data.inputs?.find((input: any) => input.key === 'botToken')?.value || '';
  const chatId = data.inputs?.find((input: any) => input.key === 'chatId')?.value || '';
  const botName =
    data.inputs?.find((input: any) => input.key === 'botName')?.value || 'Trading Bot';

  // Check if Telegram is configured
  const isConfigured = botToken && chatId;

  if (isConfigured) {
    // Simulate random commands a user might send
    const possibleCommands = [
      '/status',
      '/balance',
      '/buy BTC',
      '/sell ETH',
      '/price BTC',
      '/portfolio',
      "What's my portfolio?",
      'Show me the market',
    ];

    const randomCommand = possibleCommands[Math.floor(Math.random() * possibleCommands.length)];

    consoleOutput.push(`${timestamp()} Received Telegram message: ${randomCommand}`);

    // Create response
    outputData['connected'] = true;
    outputData['telegramInfo'] = {
      botToken,
      chatId,
      botName,
      lastUpdated: new Date().toISOString(),
    };
    outputData['receivedMessage'] = {
      text: randomCommand,
      receivedAt: new Date().toISOString(),
      from: {
        id: Math.floor(Math.random() * 1000000),
        username: 'simulated_user',
      },
    };

    // Parse command to generate appropriate outputs for downstream nodes
    if (randomCommand.startsWith('/buy') || randomCommand.toLowerCase().includes('buy')) {
      const parts = randomCommand.split(' ');
      const token = parts.length > 1 ? parts[1] : 'BTC';

      outputData['command'] = {
        action: 'buy',
        token: token,
        amount: 0.1, // Default amount
      };
    } else if (randomCommand.startsWith('/sell') || randomCommand.toLowerCase().includes('sell')) {
      const parts = randomCommand.split(' ');
      const token = parts.length > 1 ? parts[1] : 'BTC';

      outputData['command'] = {
        action: 'sell',
        token: token,
        amount: 0.1, // Default amount
      };
    } else if (
      randomCommand.startsWith('/balance') ||
      randomCommand.toLowerCase().includes('balance')
    ) {
      outputData['command'] = {
        action: 'getBalance',
      };
    } else if (
      randomCommand.startsWith('/portfolio') ||
      randomCommand.toLowerCase().includes('portfolio')
    ) {
      outputData['command'] = {
        action: 'getPortfolio',
      };
    } else if (
      randomCommand.startsWith('/price') ||
      randomCommand.toLowerCase().includes('price')
    ) {
      const parts = randomCommand.split(' ');
      const token = parts.length > 1 ? parts[1] : 'BTC';

      outputData['command'] = {
        action: 'getPrice',
        token: token,
      };
    } else if (
      randomCommand.startsWith('/status') ||
      randomCommand.toLowerCase().includes('status')
    ) {
      outputData['command'] = {
        action: 'getStatus',
      };
    }
  } else {
    // Telegram not configured
    consoleOutput.push(
      `${timestamp()} Error: Telegram is not configured. Please configure bot token and chat ID.`
    );

    outputData['connected'] = false;
    outputData['error'] = 'Telegram is not configured';
    outputData['receivedMessage'] = null;
  }

  return outputData;
}
