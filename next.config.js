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
        domains: ['res.cloudinary.com'],
    },
};

module.exports = withPWA(nextConfig);
