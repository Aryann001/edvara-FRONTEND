/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Whenever the frontend calls /api/..., proxy it to Render
        source: '/api/:path*',
        destination: 'https://edvara-backend.onrender.com/api/:path*', 
      },
    ];
  },
};

export default nextConfig;