'use server';

import { db } from '@/lib/firebase';
import { Faq } from '@/models/faq';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  WithFieldValue,
} from 'firebase/firestore';

/**
 * Retrieves all FAQs, grouped by category.
 * @returns A promise that resolves to an object where keys are categories
 *          and values are arrays of FAQs.
 */
export async function getAllFAQs(): Promise<Record<string, Faq[]>> {
  const faqsCollection = collection(db, 'faqs');
  const querySnapshot = await getDocs(faqsCollection);
  const faqs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faq));

  // Group by category
  return faqs.reduce((acc, faq) => {
    (acc[faq.category] = acc[faq.category] || []).push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);
}

/**
 * Adds a new FAQ to the 'faqs' collection.
 * (HR/Manager only - requires security rules).
 * @param question The FAQ question.
 * @param answer The FAQ answer.
 * @param category The category for the FAQ.
 * @returns A promise that resolves to the ID of the newly created FAQ.
 */
export async function addFAQ(question: string, answer: string, category: string): Promise<string> {
  const faqsCollection = collection(db, 'faqs');
  const docRef = await addDoc(faqsCollection, { question, answer, category });
  return docRef.id;
}

/**
 * Updates an existing FAQ entry.
 * @param faqId The ID of the FAQ to update.
 * @param data The partial data to update the FAQ with.
 * @returns A promise that resolves when the FAQ has been updated.
 */
export async function updateFAQ(faqId: string, data: Partial<Faq>): Promise<void> {
  const faqRef = doc(db, 'faqs', faqId);
  await updateDoc(faqRef, data as WithFieldValue<DocumentData>);
}

/**
 * Deletes an FAQ from the 'faqs' collection.
 * @param faqId The ID of the FAQ to delete.
 * @returns A promise that resolves when the FAQ has been deleted.
 */
export async function deleteFAQ(faqId: string): Promise<void> {
  const faqRef = doc(db, 'faqs', faqId);
  await deleteDoc(faqRef);
}
