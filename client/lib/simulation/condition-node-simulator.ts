// Simulate condition node - CSP-safe version without eval()
export function simulateConditionNode(data: any, inputValues: Record<string, any>) {
  const outputs: Record<string, any> = {};

  if (data.name === 'If Condition') {
    // Get condition and value
    const conditionStr = data.inputs?.find((input: any) => input.key === 'condition')?.value || '';
    const value =
      inputValues['value'] !== undefined
        ? inputValues['value']
        : data.inputs?.find((input: any) => input.key === 'value')?.value;

    // Parse condition without using eval - CSP safe approach
    let result = false;
    let conditionEvaluated = false;

    try {
      // Handle different comparison operators
      if (conditionStr.includes('>=')) {
        const parts = conditionStr.split('>=').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parseNumericValue(parts[0]);
        const rightSide = parseNumericValue(parts[1]);
        result = Number(leftSide) >= Number(rightSide);
        conditionEvaluated = true;
      } else if (conditionStr.includes('<=')) {
        const parts = conditionStr.split('<=').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parseNumericValue(parts[0]);
        const rightSide = parseNumericValue(parts[1]);
        result = Number(leftSide) <= Number(rightSide);
        conditionEvaluated = true;
      } else if (conditionStr.includes('>')) {
        const parts = conditionStr.split('>').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parseNumericValue(parts[0]);
        const rightSide = parseNumericValue(parts[1]);
        result = Number(leftSide) > Number(rightSide);
        conditionEvaluated = true;
      } else if (conditionStr.includes('<')) {
        const parts = conditionStr.split('<').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parseNumericValue(parts[0]);
        const rightSide = parseNumericValue(parts[1]);
        result = Number(leftSide) < Number(rightSide);
        conditionEvaluated = true;
      } else if (conditionStr.includes('==')) {
        const parts = conditionStr.split('==').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parts[0];
        const rightSide = parts[1];

        // Handle string comparisons with quotes
        const leftValue = parseValue(leftSide);
        const rightValue = parseValue(rightSide);

        result = leftValue == rightValue; // Intentional loose equality
        conditionEvaluated = true;
      } else if (conditionStr.includes('!=')) {
        const parts = conditionStr.split('!=').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parts[0];
        const rightSide = parts[1];

        // Handle string comparisons with quotes
        const leftValue = parseValue(leftSide);
        const rightValue = parseValue(rightSide);

        result = leftValue != rightValue; // Intentional loose inequality
        conditionEvaluated = true;
      } else if (conditionStr.includes('contains')) {
        const parts = conditionStr.split('contains').map((p: string) => p.trim());
        const leftSide = parts[0] === 'value' ? value : parts[0];
        const rightSide = parts[1];

        // Handle string comparisons
        const leftValue = String(parseValue(leftSide));
        const rightValue = String(parseValue(rightSide));

        result = leftValue.includes(rightValue);
        conditionEvaluated = true;
      }

      // If no condition was evaluated, try a simple boolean check
      if (!conditionEvaluated) {
        if (conditionStr === 'true') {
          result = true;
        } else if (conditionStr === 'false') {
          result = false;
        } else if (conditionStr === 'value') {
          // Treat the value itself as a boolean
          result = Boolean(value);
        }
      }
    } catch (error) {
      // If there's an error in evaluation, default to false
      result = false;
    }

    outputs['true'] = result;
    outputs['false'] = !result;

    // Add evaluation details for debugging
    outputs['_debug'] = {
      condition: conditionStr,
      value: value,
      result: result,
    };
  } else if (data.name === 'Switch Case') {
    const value =
      inputValues['value'] !== undefined
        ? inputValues['value']
        : data.inputs?.find((input: any) => input.key === 'value')?.value;

    const cases = data.inputs?.find((input: any) => input.key === 'cases')?.value || {};

    // Check which case matches
    let matched = false;
    Object.keys(cases).forEach((caseKey) => {
      // Convert both to strings for comparison to avoid type issues
      const matches = String(cases[caseKey]) === String(value);
      outputs[caseKey] = matches;
      if (matches) matched = true;
    });

    // Default case
    outputs['default'] = !matched;

    // Add evaluation details for debugging
    outputs['_debug'] = {
      value: value,
      cases: cases,
      matched: matched,
    };
  }

  return outputs;
}

// Helper function to parse numeric values
function parseNumericValue(value: string): number {
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.substring(1, value.length - 1);
  }

  // Try to convert to number
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Helper function to parse values from condition strings
function parseValue(value: string): any {
  // Handle quoted strings
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.substring(1, value.length - 1);
  }

  // Handle numbers
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Default case - return as is
  return value;
}
