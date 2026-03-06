'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }: { product: any }) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { t, lang } = useLanguage();
    const addItem = useCartStore((state) => state.addItem);

    // Sanitize images to prevent broken images
    const validImages = product.images?.filter((img: string) => img && typeof img === 'string' && img.trim() !== '') || [];
    const imagesToDisplay = validImages.length > 0 ? validImages : ['https://via.placeholder.com/600'];

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (imagesToDisplay.length > 1) {
            let i = 1;
            setCurrentImgIndex(i);
            hoverIntervalRef.current = setInterval(() => {
                i = (i + 1) % imagesToDisplay.length;
                setCurrentImgIndex(i);
            }, 1200);
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
            image: imagesToDisplay[0],
        });
        setIsModalOpen(false);
    };

    return (
        <>
            <div
                className="product-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Link
                    href={`/product/${product._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <div className="product-card-image-wrap">
                        {/* Desktop: Auto Preview Slider */}
                        <div className="desktop-preview">
                            {imagesToDisplay.map((img: string, idx: number) => {
                                const isActive = idx === currentImgIndex;
                                return (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={product.name}
                                        loading="lazy"
                                        className={`preview-img ${isActive ? 'active' : ''}`}
                                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600'; }}
                                    />
                                );
                            })}
                        </div>

                        {/* Mobile: Swipeable Scroller */}
                        <div
                            className="mobile-swipe-scroller"
                            onScroll={(e) => {
                                const target = e.currentTarget;
                                const index = Math.round(target.scrollLeft / target.clientWidth);
                                setCurrentImgIndex(index);
                            }}
                        >
                            {imagesToDisplay.map((img: string, idx: number) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={product.name}
                                    loading="lazy"
                                    className="swipe-img"
                                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600'; }}
                                />
                            ))}
                        </div>

                        {/* Overlay */}
                        <div className="product-card-overlay" />

                        {/* Badges */}
                        {product.discountPrice && (
                            <span className="product-card-badge product-card-badge-sale">
                                {t('product.sale')}
                            </span>
                        )}
                        {product.stock === 0 && (
                            <span className="product-card-badge product-card-badge-out">
                                {t('product.soldOut')}
                            </span>
                        )}

                        {/* Indicator Dots */}
                        {imagesToDisplay.length > 1 && (
                            <div className="product-card-dots">
                                {imagesToDisplay.map((_: any, idx: number) => (
                                    <span key={idx} className={`dot ${idx === currentImgIndex ? 'active' : ''}`} />
                                ))}
                            </div>
                        )}

                        {/* Quick Add Button */}
                        {product.stock > 0 && (
                            <button
                                className="product-card-quick-add"
                                onClick={handleAddToCart}
                                aria-label="Quick Add"
                            >
                                <ShoppingBag size={18} />
                            </button>
                        )}
                    </div>

                    {/* Card Info */}
                    <div className="product-card-info">
                        <h3 className="product-card-name" title={product.name}>{product.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {product.discountPrice ? (
                                <>
                                    <span className="product-card-price-sale">{product.discountPrice.toFixed(0)} ج.م</span>
                                    <span className="product-card-price-old">{product.price.toFixed(0)} ج.م</span>
                                </>
                            ) : (
                                <span className="product-card-price">{product.price.toFixed(0)} ج.م</span>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick View Modal */}
            {isModalOpen && (
                <div className="quick-view-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                        <button className="quick-view-close" onClick={() => setIsModalOpen(false)}>×</button>

                        <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: 'var(--secondary-color)', borderRadius: '8px', overflow: 'hidden' }}>
                            <img
                                src={imagesToDisplay[0]}
                                alt={product.name}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600'; }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-color)', lineHeight: 1.1 }}>
                                {product.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                                {product.discountPrice ? (
                                    <>
                                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>{product.discountPrice.toFixed(0)} ج.م</span>
                                        <span style={{ color: 'var(--accent-color)', opacity: 0.5, textDecoration: 'line-through', fontWeight: 600, fontSize: '1rem' }}>{product.price.toFixed(0)} ج.م</span>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-color)' }}>{product.price.toFixed(0)} ج.م</span>
                                )}
                            </div>
                            <p style={{ color: 'var(--accent-color)', opacity: 0.8, fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                {(lang as string) === 'ar' ? (product.descriptionAr || product.descriptionEn) : product.descriptionEn}
                            </p>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                                onClick={handleAddToCart}
                            >
                                {t('product.addToCart')} - {product.sizes?.[0] || 'OS'}
                            </button>
                            <Link
                                href={`/product/${product._id}`}
                                className="btn-secondary"
                                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '0.75rem', textAlign: 'center' }}
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
