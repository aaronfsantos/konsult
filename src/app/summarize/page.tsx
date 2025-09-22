'use client';

import { useState, useCallback } from 'react';
import { summarizePolicy as runSummarizePolicy } from '@/ai/flows/policy-summarization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, UploadCloud } from 'lucide-react';
import { FeedbackButtons } from '@/components/feedback-buttons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';

export default function SummarizePage() {
  const [policyDocument, setPolicyDocument] = useState('');
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setFileError('');
    if (fileRejections.length > 0) {
      setFileError('File is too large or not a valid type. Please upload a text file under 2MB.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPolicyDocument(text);
      };
      reader.onerror = () => {
        setFileError('Error reading file.');
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

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
  
  const handleRemoveFile = () => {
    setPolicyDocument('');
    setFileName('');
    setFileError('');
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
            <CardDescription>Drag and drop a document file below or click to upload.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex">
            <div {...getRootProps()} className={cn('w-full h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors', isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
              <input {...getInputProps()} />
              {policyDocument ? (
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-primary"/>
                  <p className="mt-2 font-semibold">{fileName}</p>
                  <p className="text-sm text-muted-foreground">File ready to be summarized.</p>
                  <Button variant="link" size="sm" onClick={handleRemoveFile} className="mt-2">Remove file</Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <UploadCloud className="mx-auto h-12 w-12"/>
                  <p className="mt-2 font-semibold">Drop your file here or click to browse</p>
                  <p className="text-sm">Supports: .txt, .md (max. 2MB)</p>
                </div>
              )}
            </div>
          </CardContent>
           {fileError && (
              <div className="px-6 pb-2 -mt-4">
                <Alert variant="destructive" className="py-2">
                    <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              </div>
            )}
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

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

