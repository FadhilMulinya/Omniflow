export const socialNodes = [
    {
        type: 'telegram',
        category: 'input',
        name: 'Telegram Bot',
        description: 'Connect with Telegram for notifications and commands',
        icon: 'MessageCircle',
        inputs: [
            {
                key: 'botToken',
                label: 'Bot Token',
                type: 'string',
                placeholder: 'Your Telegram bot token from BotFather',
                value: '',
            },
            {
                key: 'chatId',
                label: 'Chat ID',
                type: 'string',
                placeholder: 'Chat ID to send messages to',
                value: '',
            },
            {
                key: 'botName',
                label: 'Bot Name',
                type: 'string',
                placeholder: 'Name of your trading bot',
                value: 'Trading Bot',
            },
            {
                key: 'message',
                label: 'Message',
                type: 'string',
                placeholder: 'Message to send to Telegram',
                value: '',
            },
        ],
        outputs: [
            { key: 'telegramInfo', label: 'Telegram Info', type: 'object' },
            { key: 'connected', label: 'Connected', type: 'boolean' },
            { key: 'lastMessage', label: 'Last Message', type: 'object' },
        ],
        meta: { secure: true },
    },
];
