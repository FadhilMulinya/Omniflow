'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Download, Copy, Bot } from 'lucide-react';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, ScrollArea, Tabs, TabsList, TabsTrigger } from '@/components/ui';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type BotMode = 'general' | 'analysis' | 'tasks';

const BotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<BotMode>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = generateBotResponse(input, mode);
      setMessages((prev) => [...prev, botResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string, currentMode: BotMode): Message => {
    const lowerInput = userInput.toLowerCase();
    let response = '';

    // Basic intent detection
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      response = 'Hello there! How can I assist you today?';
    } else if (lowerInput.includes('bye') || lowerInput.includes('goodbye')) {
      response = 'Goodbye! Feel free to come back if you need anything else.';
    } else if (lowerInput.includes('thank')) {
      response = "You're welcome! Is there anything else I can help with?";
    } else if (lowerInput.includes('help')) {
      response =
        'I can help with general questions, data analysis, and task management. What do you need assistance with?';
    } else {
      // Mode-specific responses
      switch (currentMode) {
        case 'general':
          response = `I understand you're asking about "${userInput}". As a general assistant, I can provide information, answer questions, or direct you to other capabilities.`;
          break;
        case 'analysis':
          response = `I can help analyze "${userInput}". In the analysis mode, I can process data, generate insights, and create visualizations.`;
          break;
        case 'tasks':
          if (lowerInput.includes('create') || lowerInput.includes('add')) {
            response = `Task created: "${userInput.replace(/create|add/i, '').trim()}". Is there anything else you'd like to add to this task?`;
          } else {
            response = `I can help manage your tasks related to "${userInput}". Would you like to create a new task, view existing ones, or mark tasks as complete?`;
          }
          break;
      }
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const copyConversation = () => {
    const text = messages
      .map((msg) => `${msg.sender === 'user' ? 'You' : 'Bot'}: ${msg.content}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadConversation = () => {
    const text = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleString()}] ${msg.sender === 'user' ? 'You' : 'Bot'}: ${msg.content}`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Mini Bot
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={clearConversation}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={copyConversation}
              title="Copy conversation"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={downloadConversation}
              title="Download conversation"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Tabs
          defaultValue="general"
          className="w-full"
          onValueChange={(value) => setMode(value as BotMode)}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-2">
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default BotInterface;
