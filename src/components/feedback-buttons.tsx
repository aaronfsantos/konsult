'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function FeedbackButtons() {
  const { toast } = useToast();
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = () => {
    if (feedbackSent) return;
    setFeedbackSent(true);
    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for helping us improve!',
    });
  };

  return (
    <div className="flex justify-end gap-1 mt-2 -mb-1 -mr-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-primary disabled:opacity-100 disabled:text-primary"
        onClick={handleFeedback}
        disabled={feedbackSent}
        aria-label="Good response"
      >
        <ThumbsUp className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-destructive disabled:opacity-100 disabled:text-destructive"
        onClick={handleFeedback}
        disabled={feedbackSent}
        aria-label="Bad response"
      >
        <ThumbsDown className="size-4" />
      </Button>
    </div>
  );
}
