import { baseNodes } from './base-nodes';
import { cryptoNodes } from './crypto-nodes';
import { socialNodes } from './social-nodes';

export const nodeDefinitions = [
    ...baseNodes,
    ...cryptoNodes,
    ...socialNodes,
];

export { baseNodes, cryptoNodes, socialNodes };
