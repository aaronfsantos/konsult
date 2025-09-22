'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateOnboardingGuide as runGenerateOnboardingGuide } from '@/ai/flows/generate-onboarding-guides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen } from 'lucide-react';
import { FeedbackButtons } from '@/components/feedback-buttons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  projects: z.string().min(2, { message: 'Projects must be at least 2 characters.' }),
  internalDocumentation: z.string().optional(),
});

export default function OnboardingPage() {
  const [guide, setGuide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      projects: '',
      internalDocumentation: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');
    setGuide('');

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

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
       <header>
        <h1 className="text-3xl font-bold font-headline">Onboarding Guides</h1>
        <p className="text-muted-foreground">Generate step-by-step guides for new employees.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
            <CardDescription>Provide information to generate a personalized onboarding guide.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormField
                  control={form.control}
                  name="internalDocumentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Documentation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide links or summaries of relevant documentation..."
                          className="resize-none"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Guide</CardTitle>
            <CardDescription>The personalized onboarding guide will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             {!guide && !isLoading && !error && (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                    <div className="text-center">
                        <BookOpen className="mx-auto h-12 w-12"/>
                        <p className="mt-2">Your guide will be shown here.</p>
                    </div>
                </div>
            )}
            {guide && (
              <ScrollArea className="h-full max-h-[500px] pr-4">
                 <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap">
                    {guide}
                 </div>
                 <FeedbackButtons />
              </ScrollArea>
            )}
            {isLoading && !guide && (
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
