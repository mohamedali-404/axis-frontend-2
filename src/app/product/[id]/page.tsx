import ProductClient from '@/components/ProductClient';

// Force dynamic rendering to prevent stale item variants
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    let initialProduct = null;
    let relatedProducts: any[] = [];

    try {
        const [prodRes, allRes, settingsRes] = await Promise.all([
            fetch(`https://axis-backend-2.onrender.com/api/products/${id}`, { cache: 'no-store' }),
            fetch(`https://axis-backend-2.onrender.com/api/products`, { cache: 'no-store' }),
            fetch(`https://axis-backend-2.onrender.com/api/settings`, { cache: 'no-store' })
        ]);

        let settings = null;
        if (settingsRes.ok) {
            settings = await settingsRes.json();
        }

        if (prodRes.ok) {
            initialProduct = await prodRes.json();
            if (initialProduct && initialProduct.message === "Product not found") {
                initialProduct = null;
            }
        }

        if (allRes.ok) {
            const allProducts = await allRes.json();
            if (Array.isArray(allProducts)) {
                relatedProducts = allProducts.filter((p: any) => p._id !== id).slice(0, 4);
            }
        }

        return <ProductClient initialProduct={initialProduct} relatedProducts={relatedProducts} settings={settings} />;
    } catch (e) {
        console.error("Failed to fetch product data:", e);
        return <ProductClient initialProduct={initialProduct} relatedProducts={relatedProducts} settings={null} />;
    }
}
