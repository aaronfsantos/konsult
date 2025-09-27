'use server';

import { db } from '@/lib/firebase';
import { User, UserRole } from '@/models/user';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Retrieves a single user's data from Firestore.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user's data, or null if not found.
 */
export async function getUser(uid: string): Promise<User | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as User;
  }
  return null;
}

/**
 * Retrieves a list of all users.
 * @returns A promise that resolves to an array of all users.
 */
export async function getAllUsers(): Promise<User[]> {
  const usersCollection = collection(db, 'users');
  const querySnapshot = await getDocs(usersCollection);
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
}

/**
 * Adds a new user to the 'users' collection.
 * @param uid The user's unique ID.
 * @param userData The user data to add.
 * @returns A promise that resolves when the user has been added.
 */
export async function addUser(uid: string, userData: Omit<User, 'uid'>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, userData);
}

/**
 * Updates the role of a specific user.
 * @param uid The unique ID of the user to update.
 * @param role The new role to assign.
 * @returns a promise that resolves when the role has been updated.
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}
