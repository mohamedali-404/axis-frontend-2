import HomeClient from '@/components/HomeClient';

// Enable ISR (Incremental Static Regeneration)
// Vercel will cache this page and update it every 60 seconds in the background
export const revalidate = 60;

export default async function Home() {
    let initialProducts = [];
    let initialSettings = null;

    try {
        const [prodsRes, settsRes] = await Promise.all([
            fetch(`https://axis-backend-2.onrender.com/api/products`, { next: { revalidate: 60 } }),
            fetch(`https://axis-backend-2.onrender.com/api/settings`, { next: { revalidate: 60 } }),
        ]);

        if (prodsRes.ok) initialProducts = await prodsRes.json();
        if (settsRes.ok) initialSettings = await settsRes.json();

        if (!Array.isArray(initialProducts)) initialProducts = [];
    } catch (e) {
        console.error("Failed to fetch initial home data:", e);
    }

    return <HomeClient initialProducts={initialProducts} initialSettings={initialSettings} />;
}
