/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'websitedemos.net',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.facebook.com',
                pathname: '**',
            },
            
        ],
    },
};

export default nextConfig;
