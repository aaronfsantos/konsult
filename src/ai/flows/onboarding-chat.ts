'use server';

/**
 * @fileOverview A chatbot for answering questions about a generated onboarding guide.
 *
 * - onboardingChat - A function that handles the chat interaction.
 * - OnboardingChatInput - The input type for the onboardingChat function.
 * - OnboardingChatOutput - The return type for the onboardingChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OnboardingChatInputSchema = z.object({
  query: z.string().describe('The new employee\'s question about the onboarding guide.'),
  guideContext: z.string().describe('The full markdown content of the generated onboarding guide.'),
});
export type OnboardingChatInput = z.infer<typeof OnboardingChatInputSchema>;

const OnboardingChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the provided guide context.'),
});
export type OnboardingChatOutput = z.infer<typeof OnboardingChatOutputSchema>;


export async function onboardingChat(input: OnboardingChatInput): Promise<OnboardingChatOutput> {
    return onboardingChatFlow(input);
}


const prompt = ai.definePrompt({
    name: 'onboardingChatPrompt',
    input: {schema: OnboardingChatInputSchema},
    output: {schema: OnboardingChatOutputSchema},
    prompt: `You are an AI assistant helping a new employee with their onboarding.
    
    Answer the user's question based *only* on the context provided in the Onboarding Guide.
    
    If the answer is not available in the context, say "I'm sorry, I don't have information about that in the provided guide. You might want to ask your manager."

    Onboarding Guide Context:
    ---
    {{{guideContext}}}
    ---

    Question:
    {{query}}
    `,
});


const onboardingChatFlow = ai.defineFlow(
    {
        name: 'onboardingChatFlow',
        inputSchema: OnboardingChatInputSchema,
        outputSchema: OnboardingChatOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
