'use server';

import { db } from '@/lib/firebase';
import { OnboardingTask } from '@/models/onboarding-task';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  WithFieldValue,
} from 'firebase/firestore';

/**
 * Retrieves the full list of onboarding tasks.
 * This can be expanded to fetch company-wide vs. project-specific tasks.
 * @returns A promise that resolves to an array of all onboarding tasks.
 */
export async function getAllTasks(): Promise<OnboardingTask[]> {
  // NOTE: This currently fetches from a single 'onboarding_tasks' collection.
  // A real-world scenario might involve multiple collections or filtering.
  const tasksCollection = collection(db, 'onboarding_tasks');
  const querySnapshot = await getDocs(tasksCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OnboardingTask));
}

/**
 * Adds a new task to the 'onboarding_tasks' collection.
 * (HR/Manager only - requires security rules).
 * @param taskData The data for the new task.
 * @returns A promise that resolves to the ID of the newly created task.
 */
export async function addTask(taskData: Omit<OnboardingTask, 'id'>): Promise<string> {
  const tasksCollection = collection(db, 'onboarding_tasks');
  const docRef = await addDoc(tasksCollection, taskData);
  return docRef.id;
}

/**
 * Updates an existing onboarding task.
 * @param taskId The ID of the task to update.
 * @param taskData The partial data to update the task with.
 * @returns A promise that resolves when the task has been updated.
 */
export async function updateTask(taskId: string, taskData: Partial<OnboardingTask>): Promise<void> {
  const taskRef = doc(db, 'onboarding_tasks', taskId);
  await updateDoc(taskRef, taskData as WithFieldValue<DocumentData>);
}

/**
 * Deletes an onboarding task.
 * @param taskId The ID of the task to delete.
 * @returns A promise that resolves when the task has been deleted.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, 'onboarding_tasks', taskId);
  await deleteDoc(taskRef);
}
