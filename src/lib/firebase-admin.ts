import * as admin from 'firebase-admin';

// Ensure all necessary environment variables are present.
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey || !storageBucket) {
  const missingVars = [
    !projectId && 'FIREBASE_PROJECT_ID',
    !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !privateKey && 'FIREBASE_PRIVATE_KEY',
    !storageBucket && 'FIREBASE_STORAGE_BUCKET',
  ].filter(Boolean).join(', ');

  throw new Error(
    `Firebase admin initialization failed. The following environment variables are missing: ${missingVars}. Please check your .env file.`
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        // The private key needs to be properly formatted.
        // The value from the JSON file needs to be parsed, often replacing \\n with \n
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: storageBucket,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error);
    // Re-throw a more informative error.
    throw new Error(`Firebase admin initialization failed with an unrecoverable error: ${error.message}`);
  }
}

const storage = admin.storage();
export { storage };
