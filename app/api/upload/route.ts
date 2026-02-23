import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const debugLogs: string[] = [];
  try {
    const rawBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
    const bucketName = rawBucket.replace(/^gs:\/\//, '').replace(/\/$/, '');
    
    debugLogs.push(`Bucket: ${bucketName}`);
    debugLogs.push(`Has Service Account: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY}`);

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('MISSING CREDENTIALS: You must set FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY and FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL in your environment variables for the API route to work.');
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      console.error('API Upload: No file or invalid file in form data');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileObject = file as unknown as File;
    const buffer = Buffer.from(await fileObject.arrayBuffer());
    
    // Try to get the bucket. We'll try a few variations if the first one fails.
    let bucket = adminStorage.bucket();
    
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        // Fallback 1: Try .appspot.com version if current is .firebasestorage.app
        if (bucket.name.endsWith('.firebasestorage.app')) {
          const altName = bucket.name.replace('.firebasestorage.app', '.appspot.com');
          console.log(`API Upload: Bucket ${bucket.name} not found, trying ${altName}`);
          const altBucket = adminStorage.bucket(altName);
          const [altExists] = await altBucket.exists();
          if (altExists) bucket = altBucket;
        }
      }
    } catch (e) {
      console.warn('API Upload: Initial bucket existence check failed, proceeding anyway:', e);
    }

    console.log('API Upload: Using bucket:', bucket.name);
    
    // Get old image info to delete it
    console.log('API Upload: Checking for old image to delete');
    const oldDoc = await adminDb.collection('settings').doc('appImage').get();
    if (oldDoc.exists) {
      const oldData = oldDoc.data();
      if (oldData?.filename) {
        try {
          await bucket.file(oldData.filename).delete();
          console.log('API Upload: Deleted old image:', oldData.filename);
        } catch (e) {
          console.warn('API Upload: Could not delete old image:', e);
        }
      }
    }

    const filename = `shared/app-image-${uuidv4()}.${fileObject.name.split('.').pop()}`;
    const fileRef = bucket.file(filename);

    console.log('API Upload: Saving to storage:', filename);
    await fileRef.save(buffer, {
      metadata: {
        contentType: fileObject.type,
      },
    });

    try {
      console.log('API Upload: Making file public');
      await fileRef.makePublic();
    } catch (e) {
      console.warn('API Upload: Could not make file public:', e);
    }

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;

    console.log('API Upload: Updating Firestore');
    await adminDb.collection('settings').doc('appImage').set({
      url: publicUrl,
      updatedAt: new Date(),
      filename: filename
    });

    console.log('API Upload: Success');
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('API Upload Error Detail:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      debugLogs,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
