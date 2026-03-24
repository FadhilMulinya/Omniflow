'use client';

import type React from 'react';
import { useState } from 'react';
import { X, Layers3, FileInput, Workflow, FileOutput, ArrowLeftRight } from 'lucide-react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

import { nodeDefinitions } from '@/lib/nodes';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeLibraryProps {
  onClose: () => void;
}

export default function NodeLibrary({ onClose }: NodeLibraryProps) {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: Layers3 },
    { id: 'input', label: 'Input', icon: FileInput },
    { id: 'processing', label: 'Processing', icon: Workflow },
    { id: 'output', label: 'Output', icon: FileOutput },
    { id: 'condition', label: 'Logic', icon: ArrowLeftRight },
  ];

  const filteredNodes =
    activeTab === 'all'
      ? nodeDefinitions
      : nodeDefinitions.filter((node) => node.category === activeTab);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodeData', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
    >
      <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
        <h3 className="font-bold text-xl flex items-center gap-3">
          <Layers3 className="w-6 h-6 text-primary" />
          Node Library
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full p-1 bg-muted/50 h-auto flex-wrap border-b border-border rounded-none">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex-1 text-xs px-3 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 ease-in-out flex items-center gap-2 font-medium"
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="p-3 space-y-2 max-h-[400px] overflow-y-auto"
          >
            <AnimatePresence>
              {filteredNodes.map((node, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-border rounded-xl cursor-grab bg-card hover:bg-muted/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                  draggable
                  onDragStart={(event: any) => onDragStart(event, node.type, node)}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {node.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {node.description}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        className="bg-blue-50 text-blue-600 rounded-full p-1"
                      >
                        <Layers3 className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
