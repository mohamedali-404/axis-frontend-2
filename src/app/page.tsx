'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
    const [products, setProducts] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' } as RequestInit)
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => { });

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { cache: 'no-store' } as RequestInit)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { });
    }, []);

    const featured = products.slice(0, 8);

    return (
        <div style={{ backgroundColor: 'rgb(var(--background-start-rgb))' }}>
            {/* Hero Section */}
            <section style={{
                height: '100vh',
                width: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("${settings?.heroBanner || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1920'}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: '#fff',
                textAlign: 'center',
                padding: '0 2rem'
            }}>
                <div style={{ animation: 'fadeIn 1s ease-out', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', textShadow: '2px 4px 10px rgba(0,0,0,0.5)', lineHeight: 1.1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {settings?.heroHeadline || "Train Hard. Look Sharp."}
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', marginBottom: '3rem', maxWidth: 650, margin: '0 auto 3rem', opacity: 0.9, fontWeight: 500, letterSpacing: '0.5px', padding: '0 1rem' }}>
                        {settings?.subHeadline || "Minimal design. Maximum performance. Discover our new premium collection."}
                    </p>
                    <Link href="/shop" className="btn-primary" style={{ fontSize: '1.2rem', padding: '16px 48px', backgroundColor: '#fff', color: '#000', borderRadius: '50px', fontWeight: 800, transition: 'transform 0.2s', display: 'inline-block' }}>
                        {t('home.shopNow')}
                    </Link>
                </div>
            </section>

            {/* Collections Section */}
            {(settings?.collectionCards?.length > 0 || settings?.collectionSectionTitle) && (
                <section style={{ padding: '4rem 2rem' }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, textAlign: 'center', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '-1.5px', color: 'var(--accent-color)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                            {settings?.collectionSectionTitle || "THE ESSENTIALS"}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                            {(settings?.collectionCards?.length ? settings.collectionCards : [...Array(3)]).slice(0, 3).map((card: any, idx: number) => (
                                <Link href={card?.link || '/shop'} key={idx} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none' }} className="product-image-container">
                                    <div style={{ flex: 1, backgroundColor: 'var(--secondary-color)', backgroundImage: `url('${card?.image || `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600&h=800&sig=${idx + 20}`}')`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }} className="product-zoom"></div>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}>
                                        <h3 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 1rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{card?.title || `COLLECTION ${idx + 1}`}</h3>
                                        <span style={{ backgroundColor: '#fff', color: '#000', padding: '12px 32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', transition: 'all 0.2s' }} className="hover-scale">{t('home.collectionShopNow')}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Collection */}
            <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--secondary-color)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, textAlign: 'center', marginBottom: '4rem', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '-1px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {t('home.featuredCollection')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
                        {featured.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    {products.length > 8 && (
                        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                            <Link href="/shop" className="btn-secondary" style={{ padding: '18px 48px', fontSize: '1.1rem', borderRadius: '50px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                                {t('home.viewCollection')}
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
