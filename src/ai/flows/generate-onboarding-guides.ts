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
import { getJiraProjectDetailsTool } from './get-jira-project';

const GenerateOnboardingGuideInputSchema = z.object({
  role: z.string().describe('The role of the new employee.'),
  projects: z
    .string()
    .describe('The projects the new employee will be working on. This might be a project key or name.'),
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
  tools: [getJiraProjectDetailsTool],
  prompt: `You are an expert in creating onboarding guides for new employees.

  Based on the employee's role, the projects they will be working on, and the available internal documentation, create a step-by-step onboarding guide. Use markdown for formatting.

  If the project name looks like a Jira Project Key, use the getJiraProjectDetails tool to get more information about the project and use that to create a more detailed and useful onboarding guide.

  Make sure to return a valid JSON object matching the output schema.

  Here is an example of a good onboarding guide:

  ---
  # Onboarding Guide: Junior Software Engineer

  Welcome to the team! This guide will help you get started during your first few weeks.

  ## Week 1: Getting Set Up

  ### Day 1: Welcome & Setup
  - [ ] **Meet the Team:** Introduction to your manager and team members.
  - [ ] **Hardware Setup:** Get your laptop and peripherals from IT.
  - [ ] **Account Access:** Ensure you have access to critical systems (Email, Slack, Jira, GitHub).

  ### Day 2-3: Development Environment
  - [ ] **Install Software:** Follow the "Dev Environment Setup" guide on the company wiki.
  - [ ] **Clone Repositories:** Clone the main repositories for the 'Phoenix Project'.
  - [ ] **Run the Project:** Get the project running on your local machine. Pair with a teammate if you run into issues.

  ### Day 4-5: Introduction to the Project
  - [ ] **Project Overview:** Your manager will walk you through the architecture of the 'Phoenix Project'.
  - [ ] **Review Documentation:** Read the project's README and any linked documentation.
  - [ ] **Your First Ticket:** Pick up a simple "good first issue" ticket from Jira to get familiar with the contribution workflow.
  ---

  Now, create a new onboarding guide based on the following details.

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
