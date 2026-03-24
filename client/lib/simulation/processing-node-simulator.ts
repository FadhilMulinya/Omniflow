import { timestamp } from './index';
import { getBestAvailableAIService } from '../services/ai-service';

// Simulate processing node
export async function simulateProcessingNode(
  data: any,
  inputValues: Record<string, any>,
  consoleOutput: string[]
) {
  const outputs: Record<string, any> = {};

  if (data.name === 'Text Processor') {
    // Get the input text, or use a default if not provided
    console.log(`data: ${JSON.stringify(data)}, inputValues: ${JSON.stringify(inputValues)}`);
    const inputText =
      inputValues['text'] ||
      data.inputs?.find((input: any) => input.key === 'text')?.value ||
      'Default text';
    const model = data.inputs?.find((input: any) => input.key === 'model')?.value || 'GPT-4';
    const systemPrompt =
      data.inputs?.find((input: any) => input.key === 'prompt')?.value ||
      'You are a helpful assistant';

    // Determine which AI service to use based on the saved provider or model name
    let aiServiceProvider = data.modelProvider || 'gemini';

    if (!data.modelProvider) {
      if (model.toLowerCase().includes('gpt')) {
        aiServiceProvider = 'openai';
      } else if (model.toLowerCase().includes('gemini')) {
        aiServiceProvider = 'gemini';
      } else if (model.toLowerCase().includes('claude')) {
        aiServiceProvider = 'anthropic';
      }
    }

    // Get the appropriate AI service
    const aiService = getBestAvailableAIService(aiServiceProvider);

    consoleOutput.push(
      `${timestamp()} Connecting to ${aiServiceProvider.toUpperCase()} API for ${model}...`
    );

    try {
      // Prepare the full prompt with system instructions if needed
      // Note: BackendAIService handles character instructions now
      const fullPrompt = inputText;

      // Generate text using the AI service
      const aiResponse = await aiService.generateText(fullPrompt, {
        model: model,
        character: data.character, // Pass character profile
        temperature: 0.7,
        maxTokens: 1000,
      });

      consoleOutput.push(
        `${timestamp()} Received response from ${model}`
      );
      consoleOutput.push(
        `${timestamp()} Used ${aiResponse.usage.total_tokens} tokens (${aiResponse.usage.prompt_tokens} prompt, ${aiResponse.usage.completion_tokens} completion)`
      );

      // Set the output data
      outputs['result'] = aiResponse.text;
      outputs['model'] = aiResponse.model;
      outputs['tokenUsage'] = aiResponse.usage;
      outputs['processingTime'] = `${((Date.now() - aiResponse.created) / 1000).toFixed(2)}s`;
    } catch (error: any) {
      consoleOutput.push(`${timestamp()} Error: ${error.message}`);
      outputs['result'] = `Error: ${error.message}`;
      outputs['error'] = error.message;
      throw error; // Re-throw to mark the node as failed
    }
  } else if (data.name === 'Data Transformer') {
    // Get input data or use default
    const inputData: any =
      inputValues['data'] || data.inputs?.find((input: any) => input.key === 'data')?.value || {};
    const transformationType =
      data.inputs?.find((input: any) => input.key === 'transformation')?.value || 'default';

    // Simulate transformation with more realistic processing
    try {
      let transformedData;

      // Apply different transformations based on the type of input data
      if (Array.isArray(inputData)) {
        // Array transformation
        if (transformationType.includes('map')) {
          transformedData = inputData.map((item) =>
            typeof item === 'object' ? { ...item, processed: true } : item
          );
        } else if (transformationType.includes('filter')) {
          transformedData = inputData.filter((item) => typeof item === 'object' && item !== null);
        } else {
          transformedData = [...inputData]; // Clone array
        }
      } else if (typeof inputData === 'object' && inputData !== null) {
        // Object transformation
        transformedData = {
          ...inputData,
          processed: true,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Primitive value
        transformedData = {
          originalValue: inputData,
          processed: true,
          timestamp: new Date().toISOString(),
        };
      }

      outputs['result'] = transformedData;
    } catch (error: any) {
      outputs['result'] = {
        error: `Transformation error: ${error.message}`,
        originalData: inputData,
      };
    }
  }

  return outputs;
}
