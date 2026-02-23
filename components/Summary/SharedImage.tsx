'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useSharedImage } from './useSharedImage';
import styles from './SharedImage.module.css';

export default function SharedImage() {
  const { imageUrl, loading, uploading, handleUpload } = useSharedImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className={styles.container}>
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt="Shared" 
          fill 
          className={styles.image} 
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={styles.placeholder}>
          <Camera className="w-8 h-8 opacity-20" />
        </div>
      )}
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className={styles.uploadButton}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
