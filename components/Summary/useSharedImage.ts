import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use JPEG with 0.7 quality to keep size small
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('You must be logged in to update the image.');
      return;
    }

    try {
      setUploading(true);
      console.log('Processing image for Firestore storage...');

      // Resize and convert to Base64
      const base64Image = await resizeImage(file);
      
      // Check size (Firestore limit is 1MB, but we want to stay well below)
      const sizeInBytes = Math.round((base64Image.length * 3) / 4);
      if (sizeInBytes > 800000) {
        throw new Error('Image is too large even after compression. Please try a smaller image.');
      }

      console.log(`Image processed. Size: ${Math.round(sizeInBytes / 1024)}KB`);

      // Update Firestore directly with the Base64 string
      await setDoc(doc(db, 'settings', 'appImage'), {
        url: base64Image,
        updatedAt: new Date(),
        uploadedBy: currentUser.uid,
        type: 'base64'
      });

      console.log('Firestore updated with Base64 image');
    } catch (error: any) {
      console.error('Image update failed:', error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return { imageUrl, loading, uploading, handleUpload };
}
