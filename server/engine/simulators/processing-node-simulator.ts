import { AIFactory } from '../../lib/ai/factory';
import { timestamp } from './base';
import { ProcessorContext, BaseProcessor } from '../processors/base-processor';
import { CKBProcessor } from '../processors/financial/ckb-processor';
import { SocialProcessor } from '../processors/social/social-processor';
import { OperationalProcessor } from '../processors/operational/operational-processor';

// Simulate processing node
export async function simulateProcessingNode(
    data: any,
    inputValues: Record<string, any>,
    consoleOutput: string[],
    agent?: any
) {
    const nodeName = data.name;
    const outputs: Record<string, any> = {};

    if (nodeName.includes('Processor') || nodeName === 'AI Text Analyzer') {
        const inputText =
            inputValues['text'] ||
            data.inputs?.find((input: any) => input.key === 'text')?.value ||
            '';

        const ctx: ProcessorContext = { agent, inputValues, consoleOutput };

        try {
            let result;
            if (nodeName === 'Financial Processor') {
                result = await CKBProcessor.execute(ctx, inputText);
            } else if (nodeName === 'Social Processor') {
                result = await SocialProcessor.execute(ctx, inputText);
            } else if (nodeName === 'Operational Processor') {
                result = await OperationalProcessor.execute(ctx, inputText);
            } else {
                // Fallback to a general analysis
                const provider = agent?.modelProvider || 'ollama';
                const model = agent?.modelConfig?.modelName || 'qwen2.5:3b';
                const systemPrompt = `${BaseProcessor.getIdentityContext(agent)}\n\nGeneral Text Analysis:\nIdentify intent and reply.\nReturn ONLY valid JSON: { "intent": "general", "message": "..." }`;
                const response = await BaseProcessor.getCompletion(provider, model, systemPrompt, inputText);
                result = BaseProcessor.parseJsonResponse(response.content, consoleOutput) || { intent: 'general', message: response.content };
            }

            Object.assign(outputs, result);
        } catch (error: any) {
            consoleOutput.push(`${timestamp()} Error in Processor: ${error.message}`);
            outputs['error'] = error.message;
            throw error;
        }
    }
    else if (data.name === 'Data Transformer') {
        const inputData = inputValues['data'] || data.inputs?.find((input: any) => input.key === 'data')?.value || {};
        const transformationType = data.inputs?.find((input: any) => input.key === 'transformation')?.value || 'default';

        try {
            let transformedData;
            if (Array.isArray(inputData)) {
                if (transformationType.includes('map')) {
                    transformedData = inputData.map(item => (typeof item === 'object' ? { ...item, processed: true } : item));
                } else if (transformationType.includes('filter')) {
                    transformedData = inputData.filter(item => typeof item === 'object' && item !== null);
                } else {
                    transformedData = [...inputData];
                }
            } else if (typeof inputData === 'object' && inputData !== null) {
                transformedData = { ...inputData, processed: true, timestamp: new Date().toISOString() };
            } else {
                transformedData = { originalValue: inputData, processed: true, timestamp: new Date().toISOString() };
            }
            outputs['result'] = transformedData;
        } catch (error: any) {
            outputs['result'] = { error: `Transformation error: ${error.message}`, originalData: inputData };
        }
    }

    return outputs;
}
