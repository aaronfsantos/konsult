'use client';

import { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { policyInquiry as runPolicyInquiry } from '@/ai/flows/policy-inquiry';
import { ChatMessage, type Message } from '@/components/chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a ref for the scroll area's viewport
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runPolicyInquiry({ query: input });
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error with policy inquiry:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100dvh-2rem)] p-4 md:p-6">
       <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Policy Inquiry</h1>
        <p className="text-muted-foreground">Ask questions about company policies using our AI assistant.</p>
      </header>
      <div className="flex-1 relative mb-6">
        <ScrollArea className="h-full pr-4 absolute inset-0" viewportRef={viewportRef}>
          <div className="space-y-6">
            {messages.length === 0 && !isLoading && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Welcome to Konsult</CardTitle>
                  <CardDescription>
                    Your AI-powered policy assistant. Ask a question about company policies to get started.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  role: 'assistant',
                  content: 'Thinking...',
                }}
                isLoading
              />
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about our policies..."
            className="pr-20 text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <CornerDownLeft />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
