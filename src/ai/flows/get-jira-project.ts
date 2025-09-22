'use server';

import { ai } from '@/ai/genkit';
import { getJiraProjectDetails } from '@/services/jira-service';
import { z } from 'genkit';

export const getJiraProjectDetailsTool = ai.defineTool(
    {
      name: 'getJiraProjectDetails',
      description: 'Get details for a given Jira project key.',
      inputSchema: z.object({
        projectKey: z.string().describe('The Jira project key, e.g., "PROJ".'),
      }),
      outputSchema: z.object({
        name: z.string().describe('The name of the project.'),
        description: z.string().describe('The project description.'),
        lead: z.string().describe('The project lead.'),
      }),
    },
    async (input) => {
        return getJiraProjectDetails(input.projectKey);
    }
  );
  