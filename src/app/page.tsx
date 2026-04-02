import HomeClient from '@/components/HomeClient';

// Opt out of dynamic rendering to ensure lightning fast initial page loads (ISR)
export const dynamic = 'force-dynamic';

export default async function Home() {
    let initialProducts = [];
    let initialSettings = null;

    const apiUrl = 'https://axis-backend-2.onrender.com/api';

    try {
        const [prodsRes, settsRes] = await Promise.all([
            fetch(`${apiUrl}/products`, { cache: 'no-store' }),
            fetch(`${apiUrl}/settings`, { cache: 'no-store' }),
        ]);

        if (prodsRes.ok) initialProducts = await prodsRes.json();
        if (settsRes.ok) initialSettings = await settsRes.json();

        if (!Array.isArray(initialProducts)) initialProducts = [];
    } catch (e) {
        console.error("Failed to fetch initial home data:", e);
    }

    return <HomeClient initialProducts={initialProducts} initialSettings={initialSettings} />;
}
