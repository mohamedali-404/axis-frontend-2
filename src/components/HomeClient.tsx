'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HomeClient({ initialProducts = [], initialSettings = null }: { initialProducts?: any[], initialSettings?: any }) {
    const { t } = useLanguage();
    const products = Array.isArray(initialProducts) ? initialProducts : [];
    const settings = initialSettings;
    const settingsReady = true;

    const featured = products.slice(0, 8);

    return (
        <div style={{ backgroundColor: 'rgb(var(--background-start-rgb))' }}>
            {/* Hero Section */}
            <section className="hero-section" style={{ backgroundColor: '#050505' }}>
                <div
                    className="hero-bg"
                    style={{
                        backgroundImage: settings?.heroBanner
                            ? `url("${settings.heroBanner}")`
                            : 'none',
                        opacity: settingsReady ? 1 : 0,
                    }}
                />
                <div className="hero-overlay" />
                <div className="hero-content" style={{ opacity: settingsReady ? 1 : 0, transition: 'opacity 0.6s ease' }}>
                    <h1 className="hero-title">
                        {settings?.heroHeadline || "WELCOME TO AXIS"}
                    </h1>
                    <p className="hero-subtitle">
                        {settings?.subHeadline || "Minimal design. Maximum performance."}
                    </p>
                    <Link href="/shop" className="hero-cta">
                        {t('home.shopNow')}
                    </Link>
                </div>
            </section>

            {/* Collections Section */}
            {(settings?.collectionCards?.length > 0 || settings?.collectionSectionTitle) && (
                <section className="section-container">
                    <h2 className="section-title" style={{ color: 'var(--accent-color)' }}>
                        {settings?.collectionSectionTitle || "THE ESSENTIALS"}
                    </h2>
                    <div className="collection-grid">
                        {(settings?.collectionCards?.length ? settings.collectionCards : [...Array(3)]).slice(0, 3).map((card: any, idx: number) => (
                            <Link href={card?.link || '/shop'} key={idx} className="collection-card">
                                <div
                                    className="collection-card-bg"
                                    style={{
                                        backgroundColor: 'var(--secondary-color)',
                                        backgroundImage: `url('${card?.image || `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600&h=800&sig=${idx + 20}`}')`,
                                    }}
                                />
                                <div className="collection-card-overlay">
                                    <h3 className="collection-card-title">{card?.title || `COLLECTION ${idx + 1}`}</h3>
                                    <span className="collection-card-btn">{t('home.collectionShopNow')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Collection */}
            <section style={{ padding: '24px 0', backgroundColor: 'var(--secondary-color)' }}>
                <div className="section-container">
                    <h2 className="section-title" style={{ color: 'var(--accent-color)' }}>
                        {t('home.featuredCollection')}
                    </h2>

                    <div className="product-grid">
                        {featured.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {products.length > 8 && (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link href="/shop" className="btn-secondary" style={{ padding: '14px 36px', fontSize: '0.85rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                                {t('home.viewCollection')}
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
