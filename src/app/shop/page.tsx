import ShopClient from '@/components/ShopClient';

export const revalidate = 60; // Cache and update incrementally every 60s

export default async function Shop() {
    let initialProducts = [];

    try {
        const res = await fetch(`https://axis-backend-2.onrender.com/api/products`, { next: { revalidate: 60 } });
        if (res.ok) {
            initialProducts = await res.json();
        }
        if (!Array.isArray(initialProducts)) {
            initialProducts = [];
        }
    } catch (e) {
        console.error("Failed to fetch shop products:", e);
    }

    return <ShopClient initialProducts={initialProducts} />;
}
