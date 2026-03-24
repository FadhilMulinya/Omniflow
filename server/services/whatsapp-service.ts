/**
 * WhatsApp Cloud API Service
 * This service handles interactions with the WhatsApp Business Cloud API
 */

interface WhatsAppServiceOptions {
  accessToken?: string;
  phoneNumberId?: string;
  version?: string;
}

interface WhatsAppTextMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

interface WhatsAppTemplateMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

interface WhatsAppMediaMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  [mediaType: string]: any;
}

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export class WhatsAppService {
  private accessToken: string | null = null;
  private baseUrl = 'https://graph.facebook.com';
  private apiVersion = 'v17.0';
  private phoneNumberId: string | null = null;

  constructor(options?: WhatsAppServiceOptions) {
    if (options?.accessToken) {
      this.accessToken = options.accessToken;
    } else {
      // Try to get API key from environment
      this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || null;
    }

    if (options?.phoneNumberId) {
      this.phoneNumberId = options.phoneNumberId;
    } else {
      this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
    }

    if (options?.version) {
      this.apiVersion = options.version;
    }
  }

  isConfigured(): boolean {
    return !!this.accessToken && !!this.phoneNumberId;
  }

  async sendTextMessage(to: string, text: string, phoneNumberId?: string): Promise<any> {
    const actualPhoneNumberId = phoneNumberId || this.phoneNumberId;

    if (!this.accessToken || !actualPhoneNumberId) {
      throw new Error('WhatsApp API is not configured. Missing access token or phone number ID.');
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${actualPhoneNumberId}/messages`;

    const message: WhatsAppTextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode = 'en_US',
    components?: any[],
    phoneNumberId?: string
  ): Promise<any> {
    const actualPhoneNumberId = phoneNumberId || this.phoneNumberId;

    if (!this.accessToken || !actualPhoneNumberId) {
      throw new Error('WhatsApp API is not configured. Missing access token or phone number ID.');
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${actualPhoneNumberId}/messages`;

    const message: WhatsAppTemplateMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    if (components && components.length > 0) {
      message.template.components = components;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  async sendMediaMessage(
    to: string,
    mediaType: string,
    mediaId: string,
    phoneNumberId?: string
  ): Promise<any> {
    const actualPhoneNumberId = phoneNumberId || this.phoneNumberId;

    if (!this.accessToken || !actualPhoneNumberId) {
      throw new Error('WhatsApp API is not configured. Missing access token or phone number ID.');
    }

    if (!['image', 'audio', 'document', 'video', 'sticker'].includes(mediaType)) {
      throw new Error(`Invalid media type: ${mediaType}`);
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${actualPhoneNumberId}/messages`;

    const message: WhatsAppMediaMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: mediaType,
      [mediaType]: {
        id: mediaId,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error sending WhatsApp media message:', error);
      throw error;
    }
  }

  // Method to verify webhook
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
    verifyToken: string
  ): string | null {
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  // Method to process incoming webhook messages
  processWebhookMessage(body: any): any {
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return null;
    }

    const entries = body.entry || [];
    const messages: any[] = [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value || {};
        const messagesList = value.messages || [];

        for (const message of messagesList) {
          const sender = value.contacts?.[0]?.wa_id;
          const messageType = message.type;
          let messageContent = null;

          if (messageType === 'text') {
            messageContent = message.text?.body;
          } else if (
            messageType === 'image' ||
            messageType === 'audio' ||
            messageType === 'video' ||
            messageType === 'document'
          ) {
            messageContent = {
              id: message[messageType]?.id,
              type: messageType,
              mimeType: message[messageType]?.mime_type,
              caption: message[messageType]?.caption,
            };
          }

          messages.push({
            id: message.id,
            timestamp: message.timestamp,
            from: sender,
            type: messageType,
            content: messageContent,
            metadata: {
              phoneNumberId: value.metadata?.phone_number_id,
              displayPhoneNumber: value.metadata?.display_phone_number,
            },
          });
        }
      }
    }

    return messages.length > 0 ? messages : null;
  }
}

// Create and export a default instance
export const whatsAppService = new WhatsAppService();
