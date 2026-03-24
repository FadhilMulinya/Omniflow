// Simulate output node
export function simulateOutputNode(data: any, inputValues: Record<string, any>) {
  // Output nodes don't produce output data for other nodes,
  // but we'll return what they would display
  const displayData: Record<string, any> = {};

  if (data.name === 'Text Output') {
    // Get text from input values or node configuration
    const text =
      inputValues['text'] !== undefined
        ? inputValues['text']
        : data.inputs?.find((input: any) => input.key === 'text')?.value || '';

    const format = data.inputs?.find((input: any) => input.key === 'format')?.value || 'Plain';

    displayData['displayText'] = text;
    displayData['format'] = format;

    // Add formatted version based on the format type
    if (format === 'Markdown') {
      displayData['formattedText'] = `**Markdown Output:**\n${text}`;
    } else if (format === 'HTML') {
      displayData['formattedText'] = `<div><strong>HTML Output:</strong><div>${text}</div></div>`;
    }
  } else if (data.name === 'Chart Output') {
    // Get chart data from input values or node configuration
    const chartData =
      inputValues['data'] !== undefined
        ? inputValues['data']
        : data.inputs?.find((input: any) => input.key === 'data')?.value || [];

    const chartType = data.inputs?.find((input: any) => input.key === 'type')?.value || 'Bar';
    const title = data.inputs?.find((input: any) => input.key === 'title')?.value || 'Chart';

    displayData['chartData'] = chartData;
    displayData['chartType'] = chartType;
    displayData['title'] = title;

    // Add sample visualization data
    displayData['visualization'] = {
      type: chartType,
      title: title,
      data: chartData,
      config: {
        showLegend: true,
        showGrid: true,
        animated: true,
      },
    };
  }

  return displayData;
}
