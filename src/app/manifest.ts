import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edvara - Modern Learning Platform',
    short_name: 'Edvara',
    description: 'Master the logic, the rest is code. Specialized courses for Engineering and Coding.',
    start_url: '/',
    display: 'standalone',
    background_color: '#161616',
    theme_color: '#FE6100',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Ensure you add these images to your public folder later for full PWA support
      // {
      //   src: '/icon-192.png',
      //   sizes: '192x192',
      //   type: 'image/png',
      // },
      // {
      //   src: '/icon-512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      // },
    ],
  }
}