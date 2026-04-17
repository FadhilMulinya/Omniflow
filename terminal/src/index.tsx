import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

import { fileURLToPath } from 'url';

export async function main() {
    render(<App />);
}

if (process.argv[1] && fileURLToPath(import.meta.url).endsWith(process.argv[1].replace(/^[./]+/, ''))) {
    main();
}
