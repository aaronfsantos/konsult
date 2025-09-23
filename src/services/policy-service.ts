'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll, getBytes } from 'firebase/storage';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

// TODO: To re-enable PDF support, you will need to find a compatible
// PDF parsing library and add the text extraction logic back here.

export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesRef = ref(storage, 'policies');
    const policySnapshot = await listAll(policiesRef);
    
    const policies = await Promise.all(
      policySnapshot.items.map(async (itemRef) => {
        const bytes = await getBytes(itemRef);
        const buffer = Buffer.from(bytes);
        const title = itemRef.name.replace(/\.[^/.]+$/, "");

        // Currently only supports text-based files.
        const content = buffer.toString('utf-8');

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
