'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll, getBytes } from 'firebase/storage';
// TODO: Add a compatible PDF parsing library to handle PDF files.
// For example, using a library like 'pdf-parse' or another alternative.
// import pdf from 'pdf-parse';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesRef = ref(storage, 'policies');
    const policySnapshot = await listAll(policiesRef);
    
    const policies = await Promise.all(
      policySnapshot.items.map(async (itemRef) => {
        const bytes = await getBytes(itemRef);
        const buffer = Buffer.from(bytes);
        const title = itemRef.name.replace(/\.[^/.]+$/, "");
        let content = '';

        if (itemRef.name.toLowerCase().endsWith('.pdf')) {
          // Placeholder for PDF parsing logic.
          // The buffer contains the PDF data.
          // content = (await pdf(buffer)).text;
          content = `(Content of ${itemRef.name} is a PDF and needs a parsing library to be read.)`;
        } else {
          // For text-based files
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
