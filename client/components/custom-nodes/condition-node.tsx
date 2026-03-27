import { Handle, Position } from '@xyflow/react';
import type React from 'react';
import NodeControls from './node-controls';
import NodeOutputDisplay from '../node-output-display';
import * as LucideIcons from 'lucide-react';

interface ConditionNodeProps {
  data: any;
  isConnectable: boolean;
  selected: boolean;
  id: string;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ data, isConnectable, selected, id }) => {
  const IconComponent = (data.icon
    ? LucideIcons[data.icon as keyof typeof LucideIcons]
    : LucideIcons.Circle) as React.ElementType;

  const shellClass = [
    'node-base',
    'node-amber',
    selected ? 'node-selected' : '',
    data.isActive === false ? 'node-inactive' : '',
    data.isPlaying ? 'node-playing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <NodeControls nodeId={id} isPlaying={data.isPlaying || false} isActive={data.isActive !== false} />

      <div className="node-icon">
        {IconComponent && <IconComponent className="h-4 w-4 text-amber-600" />}
      </div>

      <div className="node-title">{data.name}</div>
      <div className="node-description">{data.description}</div>

      {data.inputs?.map((input: any, index: number) => (
        <Handle
          key={input.key}
          type="target"
          position={Position.Left}
          id={input.key}
          style={{ top: 40 + index * 10, background: '#555' }}
          isConnectable={isConnectable}
          className={data.isPlaying ? 'animate-ping' : ''}
        />
      ))}

      {data.outputs?.map((output: any, index: number) => (
        <Handle
          key={output.key}
          type="source"
          position={Position.Right}
          id={output.key}
          style={{ top: 40 + index * 10, background: '#555' }}
          isConnectable={isConnectable}
          className={data.isPlaying ? 'animate-ping' : ''}
        />
      ))}

      {data.isPlaying && data.outputData && (
        <NodeOutputDisplay nodeType="condition" nodeName={data.name} outputData={data.outputData} />
      )}

      {data.executionStatus && (
        <div className={`node-status-dot ${data.executionStatus === 'success' ? 'node-status-success'
            : data.executionStatus === 'error' ? 'node-status-error'
              : 'node-status-pending'
          }`} />
      )}
    </div>
  );
};

export default ConditionNode;
