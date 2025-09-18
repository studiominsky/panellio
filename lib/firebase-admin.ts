import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (!serviceAccountKey) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
  const serviceAccount = JSON.parse(decodedKey);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminApp = admin.app();