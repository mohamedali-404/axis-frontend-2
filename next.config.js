/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    clientsClaim: true,
    reloadOnOnline: true,
    workboxOptions: {
        // Don't cache HTML pages — always fetch fresh from network
        runtimeCaching: [
            {
                urlPattern: /^https?.*/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'offlineCache',
                    expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    },
                },
            },
        ],
    },
});

const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'localhost', 'axis-backend-2.onrender.com'],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
                ],
            },
        ];
    },
};

module.exports = withPWA(nextConfig);
