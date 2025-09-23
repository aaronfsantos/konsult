// lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is a global declaration to avoid type errors in the global scope.
declare global {
    var __firebase_admin_initialized__: boolean;
}

function initializeFirebaseAdmin() {
    if (global.__firebase_admin_initialized__) {
        return;
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    
    if (!privateKey || !clientEmail || !projectId || !storageBucket) {
        const missingVars = [
            !privateKey && 'FIREBASE_PRIVATE_KEY',
            !clientEmail && 'FIREBASE_CLIENT_EMAIL',
            !projectId && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            !storageBucket && 'FIREBASE_STORAGE_BUCKET',
        ].filter(Boolean).join(', ');

        throw new Error(
            `Firebase admin initialization failed. The following environment variables are missing: ${missingVars}. Please check your .env.local file.`
        );
    }
    
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            storageBucket: storageBucket,
        });
        global.__firebase_admin_initialized__ = true;

    } catch (error: any) {
        console.error('Firebase admin initialization error:', error);
        throw new Error(
            `Firebase admin initialization failed with an unrecoverable error: ${error.message}`
        );
    }
}

// Initialize the app.
initializeFirebaseAdmin();

// Export the initialized admin instance.
export const firebaseAdmin = admin;
export const storage = admin.storage();
