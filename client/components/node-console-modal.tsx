'use client';
import { X } from 'lucide-react';
import { Button, ScrollArea } from '@/components/ui';

interface NodeConsoleModalProps {
  nodeId: string;
  nodeName: string;
  consoleOutput: string[];
  onClose: () => void;
}

export default function NodeConsoleModal({
  nodeId,
  nodeName,
  consoleOutput,
  onClose,
}: NodeConsoleModalProps) {
  console.log('NodeConsoleModalProps', nodeId, nodeName, consoleOutput, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
          <h3 className="font-bold text-lg">Console: {nodeName}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-80 p-4">
          {consoleOutput.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center py-8">No console output yet.</div>
          ) : (
            <div className="space-y-2">
              {consoleOutput.map((message, index) => (
                <div key={index} className="text-sm font-mono p-3 rounded-lg bg-muted/30 border-l-4 border-primary/50">
                  {message}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex justify-end p-6 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={() => onClose()} className="rounded-full px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
