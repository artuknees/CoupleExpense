import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cule & Jen Expenses',
    short_name: 'Expenses',
    description: 'Shared expense tracker for Cule and Jen',
    start_url: '/',
    display: 'standalone',
    background_color: '#064e3b',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
