'use client';

import { Play, Pause, Terminal, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface NodeControlsProps {
  nodeId: string;
  isPlaying: boolean;
  isActive: boolean;
  onPlayPause: (nodeId: string) => void;
  onToggleActive: (nodeId: string) => void;
  onOpenConsole: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export default function NodeControls({
  nodeId,
  isPlaying,
  isActive,
  onPlayPause,
  onToggleActive,
  onOpenConsole,
  onDeleteNode,
}: NodeControlsProps) {
  return (
    <div className="absolute top-0 right-0 flex gap-1 p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 bg-white/80 hover:bg-white"
        onClick={() => onPlayPause(nodeId)}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>
      {/* <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 bg-white/80 hover:bg-white"
        onClick={() => onOpenConsole(nodeId)}
      >
        <Terminal className="h-3 w-3" />
      </Button> */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-5 w-5 ${isActive ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}
        onClick={() => onToggleActive(nodeId)}
      >
        {isActive ? (
          <Power className="h-3 w-3 text-green-500" />
        ) : (
          <PowerOff className="h-3 w-3 text-red-500" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 bg-white/80 hover:bg-red-100"
        onClick={() => onDeleteNode(nodeId)}
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
}
