import { Handle, Position } from '@xyflow/react';
import type React from 'react';
import NodeControls from './node-controls';
import { BrainCircuit, TrendingUp, TrendingDown, BarChart } from 'lucide-react';

interface TradingBotNodeProps {
  data: any;
  isConnectable: boolean;
  selected: boolean;
  id: string;
}

const TradingBotNode: React.FC<TradingBotNodeProps> = ({ data, isConnectable, selected, id }) => {
  // Get trading strategy
  const strategy = data.inputs?.find((input: any) => input.key === 'strategy')?.value || 'Balanced';

  // Get wallet info from inputs or from connected nodes via outputData
  const walletInfo =
    data.inputs?.find((input: any) => input.key === 'walletInfo')?.value ||
    (data.outputData?.walletInfo ? data.outputData.walletInfo : null);

  // More flexible check for wallet connection
  const isWalletConnected = Boolean(
    walletInfo &&
    (walletInfo.connected === true ||
      walletInfo.address ||
      (typeof walletInfo === 'object' && Object.keys(walletInfo).length > 0))
  );

  // Get tokens to trade
  const tokens = data.inputs?.find((input: any) => input.key === 'tokens')?.value || ['ETH', 'BTC'];

  const shellClass = [
    'node-base',
    'node-indigo',
    selected ? 'node-selected' : '',
    data.isActive === false ? 'node-inactive' : '',
    data.isPlaying ? 'node-playing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <NodeControls
        nodeId={id}
        isPlaying={data.isPlaying || false}
        isActive={data.isActive !== false}
      />

      {/* Icon + strategy badge */}
      <div className="node-icon">
        <BrainCircuit className="h-4 w-4 text-indigo-600" />
      </div>
      <div className={`absolute top-1 right-8 text-[10px] font-semibold ${strategy === 'Aggressive' ? 'text-red-600'
          : strategy === 'Conservative' ? 'text-green-600'
            : strategy === 'Custom' ? 'text-purple-600'
              : 'text-blue-600'
        }`}>
        {strategy}
      </div>

      <div className="node-title">{data.name}</div>
      <div className="node-description">{data.description}</div>

      {/* Wallet connection status indicator */}
      {isWalletConnected ? (
        <div className="text-xs mb-2 px-2 py-1 bg-green-100 text-green-700 rounded flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Wallet connected: {walletInfo.network || 'Ethereum'}
        </div>
      ) : (
        <div className="text-xs mb-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          No wallet connected
        </div>
      )}

      {Array.isArray(tokens) && tokens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tokens.map((token, index) => (
            <span key={index} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-semibold">
              {token}
            </span>
          ))}
        </div>
      )}

      {/* Input Handles */}
      {data.inputs?.map((input: any, index: number) => (
        <Handle
          key={input.key}
          type="target"
          position={Position.Left}
          id={input.key}
          style={{ top: 40 + index * 10, background: '#555' }}
          isConnectable={isConnectable}
        />
      ))}

      {/* Output Handles */}
      {data.outputs?.map((output: any, index: number) => (
        <Handle
          key={output.key}
          type="source"
          position={Position.Right}
          id={output.key}
          style={{ top: 40 + index * 10, background: '#555' }}
          isConnectable={isConnectable}
        />
      ))}

      {data.isPlaying && data.outputData && (
        <div className="node-output-panel">
          <div className="node-output-panel-label mb-1">AI Trading Analysis</div>
          {data.outputData.recommendation && (
            <div className="mb-1">
              <div className="node-output-panel-value flex items-center gap-1">
                {data.outputData.recommendation.action === 'buy' ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : data.outputData.recommendation.action === 'sell' ? (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                ) : (
                  <BarChart className="h-3 w-3 text-blue-400" />
                )}
                {data.outputData.recommendation.action?.toUpperCase()} {data.outputData.recommendation.token}
              </div>
              <div className="node-output-panel-value mt-0.5">{data.outputData.recommendation.reason}</div>
            </div>
          )}
          {data.outputData.performance && (
            <div className="node-output-panel-value border-t border-indigo-800 pt-1 mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className={data.outputData.performance.winRate > 50 ? 'text-green-400' : 'text-red-400'}>
                  {data.outputData.performance.winRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profit:</span>
                <span className={data.outputData.performance.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                  {data.outputData.performance.profit > 0 ? '+' : ''}{data.outputData.performance.profit}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {data.executionStatus && (
        <div className={`node-status-dot ${data.executionStatus === 'success' ? 'node-status-success'
            : data.executionStatus === 'error' ? 'node-status-error'
              : 'node-status-pending'
          }`} />
      )}

      {data.isPlaying && !data.outputData && (
        <div className="node-output-panel animate-pulse">
          <div className="node-output-panel-label">AI analyzing market data...</div>
        </div>
      )}
    </div>
  );
};

export default TradingBotNode;
