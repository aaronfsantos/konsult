'use client';

import { useState } from 'react';
import { summarizePolicy as runSummarizePolicy } from '@/ai/flows/policy-summarization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText } from 'lucide-react';
import { FeedbackButtons } from '@/components/feedback-buttons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SummarizePage() {
  const [policyDocument, setPolicyDocument] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!policyDocument.trim()) return;

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const result = await runSummarizePolicy({ policyDocument });
      setSummary(result.summary);
    } catch (e) {
      console.error('Error summarizing policy:', e);
      setError('An error occurred while summarizing the policy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
       <header>
        <h1 className="text-3xl font-bold font-headline">Policy Summarization</h1>
        <p className="text-muted-foreground">Condense lengthy policy documents into concise summaries.</p>
      </header>
      
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Policy Document</CardTitle>
            <CardDescription>Paste the full text of the policy document below.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex">
            <Textarea
              value={policyDocument}
              onChange={(e) => setPolicyDocument(e.target.value)}
              placeholder="Paste your policy document here..."
              className="w-full h-full min-h-[300px] resize-none"
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSummarize} disabled={isLoading || !policyDocument.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                'Summarize'
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>The generated summary will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!summary && !isLoading && !error && (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                    <div className="text-center">
                        <FileText className="mx-auto h-12 w-12"/>
                        <p className="mt-2">Your summary will be shown here.</p>
                    </div>
                </div>
            )}
            {summary && (
              <ScrollArea className="h-full max-h-[400px] pr-4">
                 <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap">
                    {summary}
                 </div>
                 <FeedbackButtons />
              </ScrollArea>
            )}
            {isLoading && !summary && (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
