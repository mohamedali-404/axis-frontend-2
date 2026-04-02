import HomeClient from '@/components/HomeClient';

// Opt out of dynamic rendering to ensure lightning fast initial page loads (ISR)
export const revalidate = 60;

export default async function Home() {
    let initialProducts = [];
    let initialSettings = null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://axis-backend-2.onrender.com/api';

    try {
        const [prodsRes, settsRes] = await Promise.all([
            fetch(`${apiUrl}/products`, { next: { revalidate: 60 } }),
            fetch(`${apiUrl}/settings`, { next: { revalidate: 60 } }),
        ]);

        if (prodsRes.ok) initialProducts = await prodsRes.json();
        if (settsRes.ok) initialSettings = await settsRes.json();

        if (!Array.isArray(initialProducts)) initialProducts = [];
    } catch (e) {
        console.error("Failed to fetch initial home data:", e);
    }

    return <HomeClient initialProducts={initialProducts} initialSettings={initialSettings} />;
}
