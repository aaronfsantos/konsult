'use server';

import { firebaseAdmin, storage } from '@/lib/firebase-admin';
import { Policy } from '@/models/policy';

/**
 * Fetches policies from Firebase Storage.
 */
export async function getPolicies(): Promise<Policy[]> {
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'policies/' });

    const policies: Policy[] = await Promise.all(
      files
        .filter(file => file.name !== 'policies/') // Filter out the folder itself
        .map(async file => {
          const title = file.name
            .replace('policies/', '')
            .replace(/\.[^/.]+$/, '');
          
          const contentBuffer = (await file.download())[0];
          
          return {
            id: file.name,
            title: title,
            content: contentBuffer.toString('utf-8'),
          };
        })
    );
    
    return policies;
  } catch (error) {
    console.error("Error fetching policies from Firebase Storage:", error);
    // Re-throw the error to be caught by the calling flow
    throw new Error(`Failed to retrieve policies from storage. Please check configuration and permissions. Error: ${(error as Error).message}`);
  }
}
