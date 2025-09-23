'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll, getBytes } from 'firebase/storage';
import pdf from 'pdf-parse';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}

export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesRef = ref(storage, 'policies');
    const policySnapshot = await listAll(policiesRef);
    
    const policies = await Promise.all(
      policySnapshot.items.map(async (itemRef) => {
        const bytes = await getBytes(itemRef);
        const buffer = Buffer.from(bytes);
        let content = '';
        const title = itemRef.name.replace(/\.[^/.]+$/, "");

        if (itemRef.name.toLowerCase().endsWith('.pdf')) {
          content = await extractTextFromPdf(buffer);
        } else {
          content = buffer.toString('utf-8');
        }

        return {
          id: itemRef.name,
          title: title,
          content: content,
        };
      })
    );
    
    return policies;
  } catch (error) {
    console.error("Error fetching policies from storage:", error);
    // If the 'policies/' directory doesn't exist, Storage throws an error.
    // We'll return an empty array in that case.
    return [];
  }
}
