/**
 * Live Mode Manager
 * This service manages the transition from simulation to live mode
 */

import { telegramService } from '../services/telegram-service';
import { backgroundService } from '../services/background-service';

interface LiveModeConfig {
  flowId: string;
  telegramNodes: {
    nodeId: string;
    botToken: string;
    chatId: string;
  }[];
  walletNodes: {
    nodeId: string;
    walletAddress: string;
    network: string;
  }[];
  tradeNodes: {
    nodeId: string;
    maxAmount: number;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export class LiveModeManager {
  private liveFlows: Map<string, LiveModeConfig> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    // Register background job to monitor live flows
    backgroundService.registerJob('live-mode-monitor', this.monitorLiveFlows.bind(this), {
      interval: 60000, // Check every minute
    });

    this.isInitialized = true;
    console.log('Live Mode Manager initialized');
  }

  async enableLiveMode(config: LiveModeConfig): Promise<boolean> {
    try {
      // Validate configuration
      if (!config.flowId) {
        throw new Error('Flow ID is required');
      }

      // Set up Telegram webhooks for all Telegram nodes
      for (const node of config.telegramNodes) {
        if (!node.botToken || !node.chatId) {
          throw new Error(`Telegram node ${node.nodeId} is not properly configured`);
        }

        // Create a service instance with the bot token
        const service = new telegramService.constructor(node.botToken);

        // Set the webhook URL
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/api/telegram/webhook`;
        const result = await service.setWebhook(webhookUrl);

        if (!result.ok) {
          throw new Error(
            `Failed to set webhook for Telegram node ${node.nodeId}: ${result.description}`
          );
        }

        console.log(`Webhook set for Telegram node ${node.nodeId}`);
      }

      // Register the flow
      this.liveFlows.set(config.flowId, config);

      // Register Telegram flows with the webhook handler
      for (const node of config.telegramNodes) {
        // In a real implementation, you would register the flow with the webhook handler
        // registerTelegramFlow(config.flowId, node.nodeId, { botToken: node.botToken, chatId: node.chatId })
      }

      console.log(`Live mode enabled for flow ${config.flowId}`);
      return true;
    } catch (error) {
      console.error('Error enabling live mode:', error);
      return false;
    }
  }

  async disableLiveMode(flowId: string): Promise<boolean> {
    try {
      const config = this.liveFlows.get(flowId);
      if (!config) {
        return false;
      }

      // Remove webhooks for all Telegram nodes
      for (const node of config.telegramNodes) {
        // Create a service instance with the bot token
        const service = new telegramService.constructor(node.botToken);

        // Delete the webhook
        await service.deleteWebhook();

        console.log(`Webhook removed for Telegram node ${node.nodeId}`);
      }

      // Unregister the flow
      this.liveFlows.delete(flowId);

      // Unregister Telegram flows with the webhook handler
      // unregisterTelegramFlow(flowId)

      console.log(`Live mode disabled for flow ${flowId}`);
      return true;
    } catch (error) {
      console.error('Error disabling live mode:', error);
      return false;
    }
  }

  async monitorLiveFlows() {
    try {
      console.log(`Monitoring ${this.liveFlows.size} live flows`);

      // Check each live flow
      for (const [flowId, config] of this.liveFlows.entries()) {
        // Check Telegram webhooks
        for (const node of config.telegramNodes) {
          const service = new telegramService.constructor(node.botToken);
          const webhookInfo = await service.getWebhookInfo();

          if (!webhookInfo.ok || !webhookInfo.result?.url) {
            console.warn(`Webhook not set for Telegram node ${node.nodeId} in flow ${flowId}`);

            // Attempt to reset the webhook
            const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/api/telegram/webhook`;
            await service.setWebhook(webhookUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring live flows:', error);
    }
  }

  getLiveFlowConfig(flowId: string): LiveModeConfig | undefined {
    return this.liveFlows.get(flowId);
  }

  isFlowLive(flowId: string): boolean {
    return this.liveFlows.has(flowId);
  }
}

// Create and export a singleton instance
export const liveModeManager = new LiveModeManager();
