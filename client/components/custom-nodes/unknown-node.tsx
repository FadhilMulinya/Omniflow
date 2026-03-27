'use client';

import { Handle, Position } from '@xyflow/react';
import type React from 'react';
import NodeControls from './node-controls';
import { AlertTriangle } from 'lucide-react';

interface UnknownNodeProps {
    data: any;
    isConnectable: boolean;
    selected: boolean;
    id: string;
}

const UnknownNode: React.FC<UnknownNodeProps> = ({ data, isConnectable, selected, id }) => {
    const shellClass = [
        'node-base',
        'node-red',
        selected ? 'node-selected' : '',
        data?.isActive === false ? 'node-inactive' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={shellClass}>
            <NodeControls nodeId={id} isPlaying={false} isActive={data?.isActive !== false} />

            <div className="node-icon">
                <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>

            <div className="node-title" style={{ color: '#b91c1c' }}>Unknown Node</div>
            <div className="node-description" style={{ color: '#dc2626' }}>
                This node type is no longer valid. Please delete it.
            </div>

            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#ef4444' }}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#ef4444' }}
                isConnectable={isConnectable}
            />
        </div>
    );
};

export default UnknownNode;
