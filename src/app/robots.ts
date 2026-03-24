import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Protect admin routes and APIs
    },
    sitemap: 'https://www.edvara.com/sitemap.xml', // Replace with your actual domain
  }
}