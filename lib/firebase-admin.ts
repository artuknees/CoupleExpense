import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function getAdminApp() {
  if (!admin.apps.length) {
    const rawBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
    const bucketName = rawBucket.replace(/^gs:\/\//, '').replace(/\/$/, '');
    
    const hasEmail = !!process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
    const hasKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;

    console.log('--- Firebase Admin Init ---');
    console.log('Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('Bucket:', bucketName);

    try {
      const config: admin.AppOptions = {
        storageBucket: bucketName,
      };

      if (hasEmail && hasKey) {
        let privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
        // Handle cases where the key might be wrapped in quotes
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');

        config.credential = admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
          privateKey: privateKey,
        } as any);
      } else {
        config.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      }

      admin.initializeApp(config);
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }
  return admin.app();
}

export const adminDb = admin.firestore(getAdminApp());
export const adminStorage = admin.storage(getAdminApp());
export const adminAuth = admin.auth(getAdminApp());
