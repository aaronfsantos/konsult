'use server';

/**
 * @fileOverview Generates step-by-step onboarding guides for new employees based on their role and projects.
 *
 * - generateOnboardingGuide - A function that generates the onboarding guide.
 * - GenerateOnboardingGuideInput - The input type for the generateOnboardingGuide function.
 * - GenerateOnboardingGuideOutput - The return type for the generateOnboardingGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOnboardingGuideInputSchema = z.object({
  role: z.string().describe('The role of the new employee.'),
  projects: z
    .string()
    .describe('The projects the new employee will be working on.'),
  internalDocumentation: z
    .string()
    .describe('Available internal documentation for onboarding.'),
});
export type GenerateOnboardingGuideInput = z.infer<
  typeof GenerateOnboardingGuideInputSchema
>;

const GenerateOnboardingGuideOutputSchema = z.object({
  guide: z.string().describe('The generated step-by-step onboarding guide.'),
});
export type GenerateOnboardingGuideOutput = z.infer<
  typeof GenerateOnboardingGuideOutputSchema
>;

export async function generateOnboardingGuide(
  input: GenerateOnboardingGuideInput
): Promise<GenerateOnboardingGuideOutput> {
  return generateOnboardingGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOnboardingGuidePrompt',
  input: {schema: GenerateOnboardingGuideInputSchema},
  output: {schema: GenerateOnboardingGuideOutputSchema},
  prompt: `You are an expert in creating onboarding guides for new employees.

  Based on the employee's role, the projects they will be working on, and the available internal documentation, create a step-by-step onboarding guide.

  Role: {{{role}}}
  Projects: {{{projects}}}
  Internal Documentation: {{{internalDocumentation}}}

  Onboarding Guide:`,
});

const generateOnboardingGuideFlow = ai.defineFlow(
  {
    name: 'generateOnboardingGuideFlow',
    inputSchema: GenerateOnboardingGuideInputSchema,
    outputSchema: GenerateOnboardingGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
