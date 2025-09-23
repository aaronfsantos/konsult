'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll } from 'firebase/storage';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

/**
 * Fetches policies from Firebase Storage.
 * Currently, it only fetches the titles of the policies.
 * Content fetching and parsing is disabled for debugging.
 */
export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesRef = ref(storage, 'policies');
    const policySnapshot = await listAll(policiesRef);
    
    const policies = policySnapshot.items.map((itemRef) => {
      const title = itemRef.name.replace(/\.[^/.]+$/, "");
      return {
        id: itemRef.name,
        title: title,
        // Content is intentionally left blank for now to test storage access.
        content: `Policy document: ${title}`,
      };
    });
    
    return policies;
  } catch (error) {
    console.error("Error fetching policies from storage:", error);
    // If the 'policies/' directory doesn't exist, Storage throws an error.
    // We'll return an empty array in that case.
    return [];
  }
}
