import { getBestAvailableAIService } from '../services/ai-service';

// Simulate action node (with async support for API calls)
export async function simulateActionNode(data: any, inputValues: Record<string, any>) {
  const outputs: Record<string, any> = {};

  if (data.name === 'API Call') {
    try {
      // Get API details from inputs or connected nodes
      const url =
        inputValues['url'] ||
        data.inputs?.find((input: any) => input.key === 'url')?.value ||
        'https://api.example.com';
      const method =
        inputValues['method'] ||
        data.inputs?.find((input: any) => input.key === 'method')?.value ||
        'GET';
      const headers =
        inputValues['headers'] ||
        data.inputs?.find((input: any) => input.key === 'headers')?.value ||
        {};
      const body =
        inputValues['body'] || data.inputs?.find((input: any) => input.key === 'body')?.value || {};

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Instead of actually making the request, simulate a response
      // This avoids CORS issues and network dependencies
      let simulatedResponse;

      if (url.includes('example.com')) {
        // Simulate example.com API
        simulatedResponse = {
          success: true,
          data: {
            id: Math.floor(Math.random() * 10000),
            timestamp: new Date().toISOString(),
            method: method,
            receivedHeaders: headers,
            receivedBody: method !== 'GET' ? body : undefined,
          },
          message: 'Simulated API response',
        };
      } else if (url.includes('error')) {
        // Simulate error response
        throw new Error('API returned error status 500');
      } else {
        // Generic simulation
        simulatedResponse = {
          status: 'success',
          data: {
            result: 'Simulated response for ' + url,
            timestamp: new Date().toISOString(),
          },
        };
      }

      outputs['response'] = simulatedResponse;
      outputs['status'] = 200;
      outputs['headers'] = {
        'content-type': 'application/json',
        'x-powered-by': 'Omniflow Simulator',
      };
    } catch (error: any) {
      outputs['response'] = { error: error.message };
      outputs['status'] = 500;
      outputs['headers'] = {
        'content-type': 'application/json',
        'x-error': 'true',
      };
    }
  } else if (data.name === 'AI Processor') {
    try {
      // Extract input values or use defaults from node configuration
      const prompt =
        inputValues['prompt'] ||
        data.inputs?.find((input: any) => input.key === 'prompt')?.value ||
        '';
      const model =
        inputValues['model'] ||
        data.inputs?.find((input: any) => input.key === 'model')?.value ||
        'gemini-pro';
      const temperature =
        inputValues['temperature'] ||
        data.inputs?.find((input: any) => input.key === 'temperature')?.value ||
        0.7;
      const context =
        inputValues['context'] ||
        data.inputs?.find((input: any) => input.key === 'context')?.value ||
        {};

      // Use the AI service architecture
      const aiService = getBestAvailableAIService(
        model.includes('gemini') ? 'gemini' : 'simulation'
      );

      const aiResponse = await aiService.generateText(prompt, {
        model,
        temperature,
        maxTokens: 1000,
      });

      outputs['response'] = aiResponse.text;
      outputs['status'] = aiResponse.status || 200;
      outputs['fullResponse'] = aiResponse;
    } catch (error: any) {
      outputs['response'] = `Error processing with AI: ${error.message}`;
      outputs['status'] = 500;
      outputs['fullResponse'] = { error: error.message };
    }
  } else if (data.name === 'Data Transformation') {
    const inputData =
      inputValues['data'] || data.inputs?.find((input: any) => input.key === 'data')?.value || {};
    try {
      // Get input data
      const transformationType =
        data.inputs?.find((input: any) => input.key === 'type')?.value || 'default';

      // Different transformation types
      let transformedData;
      switch (transformationType) {
        case 'flatten':
          transformedData = flattenObject(inputData);
          break;
        case 'uppercase':
          transformedData = transformToUppercase(inputData);
          break;
        case 'lowercase':
          transformedData = transformToLowercase(inputData);
          break;
        case 'filter':
          const filterKey = data.inputs?.find((input: any) => input.key === 'filterKey')?.value;
          transformedData = filterObject(inputData, filterKey);
          break;
        default:
          // Default transformation - add metadata
          transformedData = addMetadata(inputData);
      }

      outputs['result'] = transformedData;
      outputs['status'] = 200;
    } catch (error: any) {
      outputs['result'] = { error: error.message, originalData: inputData };
      outputs['status'] = 500;
    }
  }

  return outputs;
}

// Add metadata to an object (default transformation)
function addMetadata(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return {
      value: data,
      metadata: {
        type: typeof data,
        transformed: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (Array.isArray(data)) {
    return {
      values: [...data],
      metadata: {
        type: 'array',
        length: data.length,
        transformed: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return {
    ...data,
    metadata: {
      type: 'object',
      keys: Object.keys(data),
      transformed: true,
      timestamp: new Date().toISOString(),
    },
  };
}

// Utility functions for data transformation
function flattenObject(obj: any, prefix = ''): any {
  if (typeof obj !== 'object' || obj === null) return { [prefix]: obj };

  return Object.keys(obj).reduce((acc: Record<string, any>, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

function transformToUppercase(obj: any): any {
  if (typeof obj === 'string') return obj.toUpperCase();
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformToUppercase(item));
  }

  return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
    acc[key] = transformToUppercase(obj[key]);
    return acc;
  }, {});
}

function transformToLowercase(obj: any): any {
  if (typeof obj === 'string') return obj.toLowerCase();
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformToLowercase(item));
  }

  return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
    acc[key] = transformToLowercase(obj[key]);
    return acc;
  }, {});
}

function filterObject(obj: any, filterKey?: string): any {
  if (!filterKey) return obj;

  if (Array.isArray(obj)) {
    return obj.filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        item.hasOwnProperty(filterKey) &&
        item[filterKey] !== null &&
        item[filterKey] !== undefined
    );
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};

    // Keep only keys that match the filter or contain objects that might have the filter key
    Object.keys(obj).forEach((key) => {
      if (key === filterKey) {
        result[key] = obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const filtered = filterObject(obj[key], filterKey);
        if (Object.keys(filtered).length > 0) {
          result[key] = filtered;
        }
      }
    });

    return result;
  }

  return {};
}
