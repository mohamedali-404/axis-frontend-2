'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }: { product: any }) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { t, lang } = useLanguage();
    const addItem = useCartStore((state) => state.addItem);

    const handleMouseEnter = () => {
        setIsHovered(true);
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
        setIsHovered(false);
        if (hoverIntervalRef.current) {
            clearInterval(hoverIntervalRef.current);
            hoverIntervalRef.current = null;
        }
        setCurrentImgIndex(0);
    };

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            size: product.sizes?.[0] || 'OS',
            quantity: 1,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
        });
        setIsModalOpen(false);
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="product-card-premium" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div style={{ position: 'relative' }}>
                    <Link
                        href={`/product/${product._id}`}
                        style={{ overflow: 'hidden', backgroundColor: 'var(--secondary-color)', aspectRatio: '3/4', position: 'relative', borderRadius: '16px', display: 'block' }}
                    >
                        <img
                            src={product.images?.[currentImgIndex] || product.images?.[0] || 'https://via.placeholder.com/600'}
                            alt={product.name}
                            loading="lazy"
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

                        {/* Gradient overlay on hover */}
                        <div style={{
                            position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)',
                            opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none'
                        }}></div>
                    </Link>

                    {/* Quick Actions */}
                    <div style={{
                        position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
                        display: 'flex', gap: '0.5rem', opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}>
                        <button
                            className="btn-card-action"
                            style={{ flex: 1 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }}
                        >
                            Quick View
                        </button>
                        <button
                            className="btn-card-action"
                            style={{ flex: 1, background: 'var(--accent-color)', color: 'var(--accent-foreground)' }}
                            onClick={handleAddToCart}
                        >
                            Add
                        </button>
                    </div>
                </div>
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

            {/* Quick View Modal */}
            {isModalOpen && (
                <div className="quick-view-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                        <button className="quick-view-close" onClick={() => setIsModalOpen(false)}>×</button>

                        <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: 'var(--secondary-color)', borderRadius: '12px', overflow: 'hidden' }}>
                            <img
                                src={product.images?.[0] || 'https://via.placeholder.com/600'}
                                alt={product.name}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--accent-color)', lineHeight: 1.1 }}>
                                {product.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                {product.discountPrice ? (
                                    <>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{product.discountPrice.toFixed(0)} ج.م</span>
                                        <span style={{ color: 'var(--accent-color)', opacity: 0.5, textDecoration: 'line-through', fontWeight: 600, fontSize: '1.2rem' }}>{product.price.toFixed(0)} ج.م</span>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>{product.price.toFixed(0)} ج.م</span>
                                )}
                            </div>
                            <p style={{ color: 'var(--accent-color)', opacity: 0.8, fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                                {(lang as string) === 'ar' ? (product.descriptionAr || product.descriptionEn) : product.descriptionEn}
                            </p>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
                                onClick={handleAddToCart}
                            >
                                {t('product.addToCart')} - {product.sizes?.[0] || 'OS'}
                            </button>
                            <Link
                                href={`/product/${product._id}`}
                                className="btn-secondary"
                                style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                            >
                                {t('product.viewDetails')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
