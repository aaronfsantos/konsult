'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Policy {
  id: string;
  title: string;
  content: string;
}

export async function getPolicies(): Promise<Policy[]> {
  try {
    const policiesCollection = collection(db, 'policies');
    const policySnapshot = await getDocs(policiesCollection);
    const policies = policySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      content: doc.data().content,
    }));
    return policies;
  } catch (error) {
    console.error("Error fetching policies:", error);
    return [];
  }
}
