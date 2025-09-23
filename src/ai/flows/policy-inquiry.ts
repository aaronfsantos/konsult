'use server';

/**
 * @fileOverview A company policy inquiry AI agent.
 *
 * - policyInquiry - A function that handles the policy inquiry process.
 * - PolicyInquiryInput - The input type for the policyInquiry function.
 * - PolicyInquiryOutput - The return type for the policyInquiry function.
 */

import {ai} from '@/ai/genkit';
import { getPolicies } from '@/services/policy-service';
import {z} from 'genkit';

const PolicyInquiryInputSchema = z.object({
  query: z.string().describe('The question about company policies.'),
});
export type PolicyInquiryInput = z.infer<typeof PolicyInquiryInputSchema>;

const PolicyInquiryOutputSchema = z.object({
  answer: z.string().describe('The answer to the policy inquiry question.'),
});
export type PolicyInquiryOutput = z.infer<typeof PolicyInquiryOutputSchema>;

export async function policyInquiry(input: PolicyInquiryInput): Promise<PolicyInquiryOutput> {
  return policyInquiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'policyInquiryPrompt',
  input: {schema: z.object({
    query: z.string(),
    context: z.string(),
  })},
  output: {schema: PolicyInquiryOutputSchema},
  prompt: `You are a helpful assistant that answers questions about company policies.

  Use the provided context to answer the user's question.

  Context:
  {{{context}}}

  Question:
  {{query}}
  
  Format your answer in a clear and easy-to-read way, using paragraphs for separation. The answer should be based *only* on the context provided. If the answer is not available in the context, say "I'm sorry, I don't have information about that policy."`,
});

const policyInquiryFlow = ai.defineFlow(
  {
    name: 'policyInquiryFlow',
    inputSchema: PolicyInquiryInputSchema,
    outputSchema: PolicyInquiryOutputSchema,
  },
  async (input) => {
    try {
      const policies = await getPolicies();
      
      if (policies.length === 0) {
        return { answer: "I couldn't find any policy documents in the knowledge base. Please make sure policy files are uploaded to the 'policies/' directory in Firebase Storage." };
      }

      const context = policies.map(p => `## ${p.title}\n${p.content}`).join('\n\n');

      const {output} = await prompt({
        query: input.query,
        context: context,
      });
      return output!;

    } catch (error: any)
      {
      console.error("Error in policyInquiryFlow:", error);
      return { answer: `There was an error connecting to the knowledge base. Please check the storage configuration and permissions. \n\n**Error Details:**\n\`\`\`\n${error.message}\n\`\`\`` };
    }
  }
);
