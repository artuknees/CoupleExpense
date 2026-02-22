import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cule & Jen Expenses',
    short_name: 'Expenses',
    description: 'Shared expense tracker for Cule and Jen',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#059669',
    icons: [
      {
        src: 'https://picsum.photos/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
