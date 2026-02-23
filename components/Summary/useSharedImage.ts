import { useState, useEffect } from 'react';
import { db, storage, auth } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function useSharedImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'appImage'), (doc) => {
      if (doc.exists()) {
        setImageUrl(doc.data().url);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching image URL:', error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (file: File) => {
    if (!file) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('You must be logged in to upload images.');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading via API route...');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        } else {
          const errorText = await response.text();
          console.error('Server returned non-JSON error:', errorText);
          throw new Error(`Server error (${response.status}). Check console for details.`);
        }
      }

      const data = await response.json();
      console.log('Upload successful via API:', data.url);
      // The Firestore listener in useEffect will pick up the change automatically
    } catch (error: any) {
      console.error('API Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return { imageUrl, loading, uploading, handleUpload };
}
