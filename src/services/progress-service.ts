'use server';

import { db } from '@/lib/firebase';
import { UserProgress, Task } from '@/models/user-progress';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

/**
 * Retrieves all tasks and their statuses for a specific user.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user's progress data, or null if not found.
 */
export async function getUserProgress(uid: string): Promise<UserProgress | null> {
  const progressRef = doc(db, 'user_progress', uid);
  const docSnap = await getDoc(progressRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  }
  return null;
}

/**
 * Updates the status of a specific task for a user.
 * @param uid The user's unique ID.
 * @param taskId The ID of the task to update.
 * @param status The new status of the task.
 * @returns A promise that resolves when the task status has been updated.
 */
export async function updateTaskStatus(uid: string, taskId: string, status: 'done' | 'pending'): Promise<void> {
  const progressRef = doc(db, 'user_progress', uid);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    throw new Error('User progress document not found.');
  }

  const progressData = progressSnap.data() as UserProgress;
  const taskToUpdate = progressData.tasks.find(t => t.title === taskId); // Assuming title is used as ID here

  if (taskToUpdate) {
    // Atomically remove the old task and add the updated one
    await updateDoc(progressRef, {
      tasks: arrayRemove(taskToUpdate),
    });
    await updateDoc(progressRef, {
      tasks: arrayUnion({ ...taskToUpdate, status }),
      lastUpdated: Timestamp.now(),
    });
  } else {
    throw new Error('Task not found in user progress.');
  }
}

/**
 * Retrieves the progress of all employees reporting to a specific manager.
 * @param managerUid The manager's unique ID.
 * @returns A promise that resolves to an array of progress data for the manager's team.
 */
export async function getTeamProgress(managerUid: string): Promise<UserProgress[]> {
  // First, get all users who report to this manager
  const usersRef = collection(db, 'users');
  const q = where('managerUid', '==', managerUid);
  const usersSnapshot = await getDocs(q);
  const employeeUids = usersSnapshot.docs.map(doc => doc.id);

  if (employeeUids.length === 0) {
    return [];
  }

  // Then, fetch the progress for each of those employees
  const progressRef = collection(db, 'user_progress');
  const progressQuery = where('uid', 'in', employeeUids);
  const progressSnapshot = await getDocs(progressQuery);

  return progressSnapshot.docs.map(doc => doc.data() as UserProgress);
}
