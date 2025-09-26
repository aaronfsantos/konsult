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

const TaskSchema = z.object({
  text: z.string().describe('The text content of the task.'),
});

const GuideSectionSchema = z.object({
  title: z.string().describe('The title of the onboarding section (e.g., "Week 1: Getting Set Up").'),
  tasks: z.array(TaskSchema).describe('A list of tasks for this section.'),
});

const GenerateOnboardingGuideOutputSchema = z.object({
  title: z.string().describe('The main title of the onboarding guide.'),
  sections: z.array(GuideSectionSchema).describe('An array of sections that make up the guide.'),
  progressReport: z.string().describe('Instructions on how the new hire should report their progress.'),
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
  config: {
    temperature: 0.2,
  },
  prompt: `You are an expert in creating onboarding guides for new employees.

  Based on the employee's role, the projects they will be working on, and the available internal documentation, create a structured onboarding guide.

  The guide should be broken down into logical sections (e.g., by week or by topic). Each section should have a title and a list of specific tasks.
  
  Also, include a separate instruction on how the new hire should report their progress to their Manager, Team Lead, or HR.
  
  If the project name looks like a Jira Project Key, use the getJiraProjectDetails tool to get more information about the project and use that to create a more detailed and useful onboarding guide.
  
  Return a valid JSON object matching the output schema. Do not return markdown.

  Here is an example of the desired JSON output structure:
  {
    "title": "Onboarding Guide: Junior Software Engineer",
    "sections": [
      {
        "title": "Week 1: Getting Set Up",
        "tasks": [
          { "text": "Meet the Team: Introduction to your manager and team members." },
          { "text": "Hardware Setup: Get your laptop and peripherals from IT." },
          { "text": "Account Access: Ensure you have access to critical systems (Email, Slack, Jira, GitHub)." }
        ]
      },
      {
        "title": "Week 1: Development Environment",
         "tasks": [
          { "text": "Install Software: Follow the 'Dev Environment Setup' guide on the company wiki." },
          { "text": "Clone Repositories: Clone the main repositories for the 'Phoenix Project'." }
        ]
      }
    ],
    "progressReport": "At the end of each week, send a summary of your progress to your manager and team lead."
  }
  ---
  
  Now, create a new onboarding guide based on the following details.
  Make sure to return a valid JSON object matching the output schema.

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
