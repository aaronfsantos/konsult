import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/policy-inquiry.ts';
import '@/ai/flows/generate-onboarding-guides.ts';
import '@/ai/flows/onboarding-chat.ts';
import '@/ai/flows/policy-summarization.ts';
import '@/ai/flows/get-jira-project.ts';
