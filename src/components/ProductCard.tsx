'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProductCard({ product }: { product: any }) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { t } = useLanguage();

    const handleMouseEnter = () => {
        if (product.images && product.images.length > 1) {
            let i = 1;
            setCurrentImgIndex(i);
            hoverIntervalRef.current = setInterval(() => {
                i = (i + 1) % product.images.length;
                setCurrentImgIndex(i);
            }, 800);
        }
    };

    const handleMouseLeave = () => {
        if (hoverIntervalRef.current) {
            clearInterval(hoverIntervalRef.current);
            hoverIntervalRef.current = null;
        }
        setCurrentImgIndex(0);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link
                href={`/product/${product._id}`}
                style={{ overflow: 'hidden', backgroundColor: 'var(--secondary-color)', aspectRatio: '3/4', position: 'relative', borderRadius: '16px', display: 'block' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={product.images?.[currentImgIndex] || product.images?.[0] || 'https://via.placeholder.com/600'}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                />

                {product.discountPrice && (
                    <span style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '4px', letterSpacing: '1px' }}>
                        {t('product.sale')}
                    </span>
                )}
                {product.stock === 0 && (
                    <span style={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'var(--background-start-rgb)', color: 'var(--foreground-rgb)', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, border: '2px solid var(--accent-color)', borderRadius: '4px' }}>
                        {t('product.soldOut')}
                    </span>
                )}
            </Link>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.3px', color: 'var(--accent-color)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {product.discountPrice ? (
                            <>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>{product.discountPrice.toFixed(0)} ج.م</span>
                                <span style={{ color: 'var(--accent-color)', opacity: 0.5, textDecoration: 'line-through', fontWeight: 600 }}>{product.price.toFixed(0)} ج.م</span>
                            </>
                        ) : (
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)' }}>{product.price.toFixed(0)} ج.م</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
