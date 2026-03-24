// whatsapp-node-simulator.ts
export function simulateWhatsAppInput(data: any) {
  // Simulate WhatsApp input node
  const displayData: Record<string, any> = {};

  // Get WhatsApp message data from node configuration
  const message = data.inputs?.find((input: any) => input.key === 'message')?.value || '';
  const sender = data.inputs?.find((input: any) => input.key === 'sender')?.value || '';
  const timestamp =
    data.inputs?.find((input: any) => input.key === 'timestamp')?.value || new Date().toISOString();

  // Set display data
  displayData['message'] = message;
  displayData['sender'] = sender;
  displayData['timestamp'] = timestamp;

  return displayData;
}

export function simulateWhatsAppOutput(
  data: any,
  inputValues: Record<string, any>,
  consoleOutput: string[]
) {
  // Simulate WhatsApp output node
  const displayData: Record<string, any> = {};

  // Get WhatsApp message data from input values or node configuration
  const message =
    inputValues['message'] !== undefined
      ? inputValues['message']
      : data.inputs?.find((input: any) => input.key === 'message')?.value || '';

  const recipient = data.inputs?.find((input: any) => input.key === 'recipient')?.value || '';
  const timestamp =
    data.inputs?.find((input: any) => input.key === 'timestamp')?.value || new Date().toISOString();

  // Set display data
  displayData['message'] = message;
  displayData['recipient'] = recipient;
  displayData['timestamp'] = timestamp;

  // Log the output to the console
  consoleOutput.push(`${timestamp()} WhatsApp Output: ${JSON.stringify(displayData)}`);

  return displayData;
}
