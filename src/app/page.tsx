import HomeClient from '@/components/HomeClient';

// Opt out of caching to ensure data is always fresh and no stale banners flash
export const dynamic = 'force-dynamic';

export default async function Home() {
    let initialProducts = [];
    let initialSettings = null;

    try {
        const [prodsRes, settsRes] = await Promise.all([
            fetch(`https://axis-backend-2.onrender.com/api/products`, { cache: 'no-store' }),
            fetch(`https://axis-backend-2.onrender.com/api/settings`, { cache: 'no-store' }),
        ]);

        if (prodsRes.ok) initialProducts = await prodsRes.json();
        if (settsRes.ok) initialSettings = await settsRes.json();

        if (!Array.isArray(initialProducts)) initialProducts = [];
    } catch (e) {
        console.error("Failed to fetch initial home data:", e);
    }

    return <HomeClient initialProducts={initialProducts} initialSettings={initialSettings} />;
}
