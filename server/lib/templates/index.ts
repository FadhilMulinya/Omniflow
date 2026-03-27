export const agentTemplates = [
    {
        id: 'blockchain-multi-step',
        name: 'Blockchain Workflow',
        description: 'Advanced flow for cross-chain actions (Wallet, Swap, Outputs).',
        nodes: [
            {
                id: 'input-1',
                type: 'input',
                position: { x: 50, y: 150 },
                data: { name: 'User Input', type: 'text', label: 'What do you want to do?' }
            },
            {
                id: 'blockchain-1',
                type: 'blockchain_tool',
                position: { x: 300, y: 150 },
                data: { name: 'Select Network', network: 'ckb-testnet' }
            },
            {
                id: 'wallet-1',
                type: 'crypto_wallet',
                position: { x: 550, y: 150 },
                data: { name: 'Connect Wallet' }
            },
            {
                id: 'condition-1',
                type: 'condition',
                position: { x: 800, y: 150 },
                data: {
                    name: 'Action Logic',
                    conditions: [
                        { label: 'Swap Assets', value: 'swap' },
                        { label: 'Send Funds', value: 'send' }
                    ]
                }
            },
            {
                id: 'swap-1',
                type: 'crypto_trade',
                position: { x: 1100, y: 50 },
                data: { name: 'Execute Swap' }
            },
            {
                id: 'send-1',
                type: 'action',
                position: { x: 1100, y: 250 },
                data: { name: 'Send Tokens', action: 'transfer' }
            },
            {
                id: 'output-1',
                type: 'output',
                position: { x: 1400, y: 150 },
                data: { name: 'Final Dashboard', outputType: 'dynamic' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'input-1', target: 'blockchain-1' },
            { id: 'e2-3', source: 'blockchain-1', target: 'wallet-1' },
            { id: 'e3-4', source: 'wallet-1', target: 'condition-1' },
            { id: 'e4-5', source: 'condition-1', target: 'swap-1', sourceHandle: 'swap' },
            { id: 'e4-6', source: 'condition-1', target: 'send-1', sourceHandle: 'send' },
            { id: 'e5-7', source: 'swap-1', target: 'output-1' },
            { id: 'e6-7', source: 'send-1', target: 'output-1' }
        ]
    },
    {
        id: 'ai-advisor',
        name: 'Simple AI Advisor',
        description: 'Quickly process text input with AI and show the result.',
        nodes: [
            {
                id: 'input-1',
                type: 'input',
                position: { x: 100, y: 100 },
                data: { name: 'Question', type: 'text' }
            },
            {
                id: 'proc-1',
                type: 'processing',
                position: { x: 400, y: 100 },
                data: { name: 'Text Processor' }
            },
            {
                id: 'output-1',
                type: 'output',
                position: { x: 700, y: 100 },
                data: { name: 'Response Viewer', outputType: 'text' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'input-1', target: 'proc-1' },
            { id: 'e2-3', source: 'proc-1', target: 'output-1' }
        ]
    },
    {
        id: 'telegram-bot',
        name: 'Telegram Auto-Responder',
        description: 'Listen to Telegram messages and respond using AI.',
        nodes: [
            {
                id: 'tel-trig-1',
                type: 'input',
                position: { x: 100, y: 100 },
                data: { name: 'Telegram Trigger' }
            },
            {
                id: 'proc-1',
                type: 'processing',
                position: { x: 400, y: 100 },
                data: { name: 'AI Logic' }
            },
            {
                id: 'tel-out-1',
                type: 'telegram',
                position: { x: 700, y: 100 },
                data: { name: 'Send Telegram Msg' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'tel-trig-1', target: 'proc-1' },
            { id: 'e2-3', source: 'proc-1', target: 'tel-out-1' }
        ]
    },
    {
        id: 'ckb-template',
        name: 'CKB Agent',
        description: 'An AI-driven flow that manages intent, checks balances, or transfers CKB automatically based on text.',
        nodes: [
            {
                id: 'input-1',
                type: 'input',
                position: { x: 50, y: 250 },
                data: { name: 'Text Input', type: 'text', label: 'User request (e.g., Transfer 100 CKB)' }
            },
            {
                id: 'proc-1',
                type: 'processing',
                position: { x: 300, y: 250 },
                data: { name: 'Text Processor (AI Extraction)', model: 'gemini-2.0-flash' }
            },
            {
                id: 'wallet-1',
                type: 'crypto_wallet',
                position: { x: 600, y: 250 },
                data: { name: 'Crypto Wallet', network: 'ckb-testnet', useSystemWallet: true }
            },
            {
                id: 'cond-balance',
                type: 'condition',
                position: { x: 900, y: 150 },
                data: { name: 'Check for Balance', inputs: [{ key: 'condition', value: 'intent_match' }, { key: 'value', value: 'balance' }, { key: 'field', value: 'intent' }] }
            },
            {
                id: 'cond-transfer',
                type: 'condition',
                position: { x: 1100, y: 350 },
                data: { name: 'Check for Transfer', inputs: [{ key: 'condition', value: 'intent_match' }, { key: 'value', value: 'transfer' }, { key: 'field', value: 'intent' }] }
            },
            {
                id: 'tool-balance',
                type: 'blockchain_tool',
                position: { x: 1300, y: 50 },
                data: { name: 'Get Balance', tool: 'blockchain.ckb.node.get CKB balance', chain: 'ckb', params: {} }
            },
            {
                id: 'tool-transfer',
                type: 'blockchain_tool',
                position: { x: 1500, y: 250 },
                data: { name: 'Transfer CKB', tool: 'blockchain.ckb.node.transfer ckb', chain: 'ckb', params: {} }
            },
            {
                id: 'output-1',
                type: 'output',
                position: { x: 1700, y: 150 },
                data: { name: 'Agent Reply', outputType: 'dynamic' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'input-1', target: 'proc-1' },
            { id: 'e2-3', source: 'proc-1', target: 'wallet-1' },
            { id: 'e3-4', source: 'wallet-1', target: 'cond-balance' },
            // If balance -> get balance tool -> Output
            { id: 'e4-5', source: 'cond-balance', target: 'tool-balance', sourceHandle: 'true' },
            { id: 'e5-6', source: 'tool-balance', target: 'output-1' },
            // Else -> check transfer
            { id: 'e4-7', source: 'cond-balance', target: 'cond-transfer', sourceHandle: 'false' },
            // If transfer -> transfer tool -> Output
            { id: 'e7-8', source: 'cond-transfer', target: 'tool-transfer', sourceHandle: 'true' },
            { id: 'e8-9', source: 'tool-transfer', target: 'output-1' },
            // Else -> Output (general reply fallback)
            { id: 'e7-10', source: 'cond-transfer', target: 'output-1', sourceHandle: 'false' }
        ]
    }
];
