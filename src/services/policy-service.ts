'use server';

import { storage } from '@/lib/firebase';
import { ref, listAll, getBytes } from 'firebase/storage';

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
        const content = new TextDecoder().decode(bytes);
        // Use the file name (without extension) as the title
        const title = itemRef.name.replace(/\.[^/.]+$/, "");

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
