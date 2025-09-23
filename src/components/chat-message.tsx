'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FeedbackButtons } from './feedback-buttons';
import { KonsultLogo } from './konsult-logo';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
};

type ChatMessageProps = {
  message: Message;
  isLoading?: boolean;
};

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-start gap-4',
        !isAssistant && 'justify-end'
      )}
    >
      {isAssistant && (
        <Avatar className="size-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <KonsultLogo className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-2xl rounded-lg px-4 py-3 shadow-sm',
          isAssistant
            ? 'bg-card text-card-foreground'
            : 'bg-primary text-primary-foreground',
          message.isError && 'bg-destructive text-destructive-foreground'
        )}
      >
        <div className="prose prose-sm max-w-none text-inherit break-words whitespace-pre-line font-chat">
          {isLoading ? (
             <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-current rounded-full animate-bounce"></span>
            </div>
          ) : (
            message.content
          )}
        </div>
        {isAssistant && !isLoading && !message.isError && <FeedbackButtons />}
      </div>

      {!isAssistant && (
        <Avatar className="size-8 border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
