'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateOnboardingGuide as runGenerateOnboardingGuide } from '@/ai/flows/generate-onboarding-guides';
import { onboardingChat as runOnboardingChat } from '@/ai/flows/onboarding-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, UploadCloud, FileText, CornerDownLeft, Bot, User } from 'lucide-react';
import { FeedbackButtons } from '@/components/feedback-buttons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import * as mammoth from 'mammoth';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, type Message } from '@/components/chat-message';

const formSchema = z.object({
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  projects: z.string().min(2, { message: 'Projects must be at least 2 characters.' }),
  internalDocumentation: z.string().optional(),
});

export default function OnboardingPage() {
  const [guide, setGuide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatViewportRef = useRef<HTMLDivElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      projects: '',
      internalDocumentation: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setFileError('');
    if (fileRejections.length > 0) {
      setFileError('File is too large or not a valid type. Please upload a supported file under 2MB.');
      setFileName('');
      form.setValue('internalDocumentation', '');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result;
          if (arrayBuffer instanceof ArrayBuffer) {
            let text;
            if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                text = new TextDecoder().decode(arrayBuffer);
            }
            form.setValue('internalDocumentation', text);
          } else {
            throw new Error('Failed to read file as ArrayBuffer.');
          }
        } catch (readError) {
          console.error('Error processing file:', readError);
          setFileError('Error reading or parsing file.');
          setFileName('');
          form.setValue('internalDocumentation', '');
        }
      };

      reader.onerror = () => {
        setFileError('Error reading file.');
        setFileName('');
        form.setValue('internalDocumentation', '');
      };
      
      reader.readAsArrayBuffer(file);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

  async function onGuideSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');
    setGuide('');
    setChatMessages([]);

    try {
      const result = await runGenerateOnboardingGuide({
        role: values.role,
        projects: values.projects,
        internalDocumentation: values.internalDocumentation || 'No specific documentation provided.',
      });
      setGuide(result.guide);
    } catch (e) {
      console.error('Error generating guide:', e);
      setError('An error occurred while generating the guide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim() || !guide) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const result = await runOnboardingChat({ query: chatInput, guideContext: guide });
        const assistantMessage: Message = {
            role: 'assistant',
            content: result.answer,
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
        console.error('Error with onboarding chat:', error);
        const errorMessage: Message = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            isError: true,
        };
        setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatViewportRef.current) {
        chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName('');
    setFileError('');
    form.setValue('internalDocumentation', '');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
       <header>
        <h1 className="text-3xl font-bold font-headline">Onboarding Assistant</h1>
        <p className="text-muted-foreground">Generate a new hire guide and ask questions about it.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col gap-6">
            <Card>
            <CardHeader>
                <CardTitle>1. Generate Onboarding Guide</CardTitle>
                <CardDescription>Provide employee details to generate a personalized guide.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onGuideSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software Engineer" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Projects</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Project Phoenix, Q3 initiatives" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                        <FormLabel>Internal Documentation (Optional)</FormLabel>
                        <div {...getRootProps()} className={cn('relative w-full p-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors', isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
                            <input {...getInputProps()} />
                            {fileName ? (
                            <div className="text-center">
                                <FileText className="mx-auto h-8 w-8 text-primary"/>
                                <p className="mt-1 font-semibold text-sm">{fileName}</p>
                                <Button variant="link" size="sm" onClick={handleRemoveFile} className="mt-0 text-xs h-auto py-0">Remove file</Button>
                            </div>
                            ) : (
                            <div className="text-center text-muted-foreground">
                                <UploadCloud className="mx-auto h-8 w-8"/>
                                <p className="mt-2 text-sm font-semibold">Drop a .docx, .txt, or .md file</p>
                                <p className="text-xs">(max. 2MB)</p>
                            </div>
                            )}
                        </div>
                        {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
                    </FormItem>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                        </>
                    ) : (
                        'Generate Guide'
                    )}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            {guide && (
                <Card className="flex flex-col flex-1">
                    <CardHeader>
                        <CardTitle>Project Guidelines</CardTitle>
                        <CardDescription>The generated step-by-step guide for the new hire.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-full max-h-[400px] pr-4">
                            <div className="prose prose-sm max-w-none break-words">
                                <ReactMarkdown>{guide}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>2. Ask Questions</CardTitle>
            <CardDescription>Ask the AI assistant about the generated onboarding guide.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
             <div className="flex-1 relative">
                <ScrollArea className="h-full pr-4 absolute inset-0" viewportRef={chatViewportRef}>
                    <div className="space-y-4">
                        {chatMessages.length === 0 && (
                            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                                <div className="text-center">
                                    <Bot className="mx-auto h-12 w-12"/>
                                    <p className="mt-2">Generate a guide to start chatting.</p>
                                </div>
                            </div>
                        )}
                        {chatMessages.map((msg, index) => (
                          <ChatMessage key={index} message={msg} />
                        ))}
                        {isChatLoading && (
                            <ChatMessage
                                message={{ role: 'assistant', content: '' }}
                                isLoading
                            />
                        )}
                    </div>
                </ScrollArea>
            </div>
            <form onSubmit={handleChatSubmit} className="relative">
                <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about the project..."
                    className="pr-12"
                    disabled={isChatLoading || !guide}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    disabled={isChatLoading || !chatInput.trim() || !guide}
                >
                    {isChatLoading ? <Loader2 className="animate-spin" /> : <CornerDownLeft />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
