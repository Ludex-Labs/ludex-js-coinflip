/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enables remote images 
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
          port: '',
          pathname: '**',
        },
      ],
    },
    }
  
  module.exports = nextConfig
