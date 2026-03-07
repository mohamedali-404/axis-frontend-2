import ShopClient from '@/components/ShopClient';

// Force dynamic rendering to ensure products are always fresh
export const dynamic = 'force-dynamic';

export default async function Shop() {
    let initialProducts = [];

    try {
        const res = await fetch(`https://axis-backend-2.onrender.com/api/products`, { cache: 'no-store' });
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
