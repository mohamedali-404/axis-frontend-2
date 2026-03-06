'use client';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, ChevronDown, Check, ZoomIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductClientProps {
    initialProduct: any;
    relatedProducts: any[];
}

// ── Accordion Section ─────────────────────────────────────────────────────────
function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="accordion-section">
            <button className="accordion-trigger" onClick={() => setOpen(v => !v)} aria-expanded={open}>
                <span>{title}</span>
                <ChevronDown size={16} className={`accordion-icon${open ? ' open' : ''}`} />
            </button>
            <div className={`accordion-body${open ? ' open' : ''}`}>
                <div className="accordion-content">{children}</div>
            </div>
        </div>
    );
}

// ── Product Gallery ───────────────────────────────────────────────────────────
function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
    const [mainIndex, setMainIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const imgRef = useRef<HTMLDivElement>(null);

    // Reset to first image when images array changes (e.g. color switch)
    useEffect(() => { setMainIndex(0); }, [images]);

    const mainImage = images[mainIndex] || '';

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    return (
        <div className="pg-gallery">
            {/* Main image */}
            <div
                ref={imgRef}
                className={`pg-main-wrap${zoomed ? ' zoomed' : ''}`}
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={productName}
                        className="pg-main-img"
                        style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(1.7)' } : {}}
                    />
                ) : (
                    <div className="pg-no-image">No Image</div>
                )}
                {images.length > 1 && (
                    <div className="pg-zoom-hint"><ZoomIn size={14} /> Hover to zoom</div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="pg-thumbs">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            className={`pg-thumb-btn${mainIndex === idx ? ' active' : ''}`}
                            onClick={() => setMainIndex(idx)}
                            aria-label={`View image ${idx + 1}`}
                        >
                            <img src={img} alt={`${productName} view ${idx + 1}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Size Selector ─────────────────────────────────────────────────────────────
function SizeSelector({
    sizes,
    selected,
    onChange,
    stockInfo,
}: {
    sizes: string[];
    selected: string;
    onChange: (s: string) => void;
    stockInfo?: Record<string, number>;
}) {
    return (
        <div className="size-selector">
            {sizes.map(sz => {
                const outOfStock = stockInfo ? (stockInfo[sz] ?? 1) === 0 : false;
                const isSelected = selected === sz;
                return (
                    <button
                        key={sz}
                        disabled={outOfStock}
                        onClick={() => !outOfStock && onChange(sz)}
                        className={`size-btn${isSelected ? ' selected' : ''}${outOfStock ? ' disabled' : ''}`}
                        title={outOfStock ? 'Out of stock' : sz}
                        aria-pressed={isSelected}
                    >
                        {sz}
                    </button>
                );
            })}
        </div>
    );
}

// ── Add to Cart Button ────────────────────────────────────────────────────────
function AddToCartButton({ onAdd, disabled, label = 'Add to Cart' }: { onAdd: () => void; disabled?: boolean; label?: string }) {
    const [success, setSuccess] = useState(false);

    const handleClick = () => {
        if (disabled || success) return;
        onAdd();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1800);
    };

    return (
        <button
            className={`atc-btn${success ? ' success' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            aria-label={label}
        >
            {success ? (
                <span className="atc-success"><Check size={16} /> Added!</span>
            ) : label}
        </button>
    );
}

// ── Related Products ──────────────────────────────────────────────────────────
function RelatedProducts({ products }: { products: any[] }) {
    if (!products.length) return null;
    return (
        <section className="related-section stagger-3">
            <h2 className="related-title">You May Also Like</h2>
            <div className="related-grid">
                {products.map(rp => (
                    <Link href={`/product/${rp._id}`} key={rp._id} className="related-card">
                        <div className="related-card-img-wrap">
                            <img
                                src={rp.images?.[0] || 'https://placehold.co/400x533/f0f0f0/999?text=No+Image'}
                                alt={rp.name}
                                loading="lazy"
                            />
                            {rp.discountPrice && <span className="product-card-badge product-card-badge-sale">SALE</span>}
                        </div>
                        <div className="related-card-info">
                            <p className="related-card-name">{rp.name}</p>
                            <div className="related-card-prices">
                                {rp.discountPrice ? (
                                    <>
                                        <span className="product-card-price-sale">{rp.discountPrice.toFixed(0)} ج.م</span>
                                        <span className="product-card-price-old">{rp.price.toFixed(0)} ج.م</span>
                                    </>
                                ) : (
                                    <span className="product-card-price">{rp.price.toFixed(0)} ج.م</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// ── Main ProductClient ────────────────────────────────────────────────────────
export default function ProductClient({ initialProduct, relatedProducts = [] }: ProductClientProps) {
    const product = initialProduct;
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const addItem = useCartStore(state => state.addItem);
    const router = useRouter();
    const baseImages: string[] = product?.images || [];
    const colorVariants: { name: string; hexCode: string; images: string[] }[] = product?.colorVariants || [];

    // Compute active images based on selected color
    const activeImages = (() => {
        if (selectedColor && colorVariants.length > 0) {
            const cv = colorVariants.find(c => c.name === selectedColor);
            if (cv && cv.images.length > 0) return cv.images;
        }
        return baseImages;
    })();



    // Close size guide on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSizeGuide(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (!product) {
        return (
            <div className="product-page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>Product not found</h2>
                <button onClick={() => router.push('/shop')} className="btn-secondary" style={{ marginTop: '1rem', padding: '10px 20px' }}>Back to Shop</button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize) { alert('Please select a size'); return; }
        if (product.stock != null && product.stock < qty) { alert('Not enough stock available.'); return; }
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            size: selectedSize,
            quantity: qty,
            image: activeImages[0] || '',
            color: selectedColor || undefined,
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };

    const displayPrice = product.discountPrice || product.price;

    return (
        <div className="product-page-container stagger-1">

            {/* ── BREADCRUMB ── */}
            <nav className="product-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="bc-sep">/</span>
                <Link href="/shop">Shop</Link>
                <span className="bc-sep">/</span>
                <span>{product.name}</span>
            </nav>

            {/* ── MAIN GRID ── */}
            <div className="product-page-grid">

                {/* LEFT — Gallery */}
                <ProductGallery images={activeImages} productName={product.name} />

                {/* RIGHT — Info */}
                <div className="product-page-info stagger-2">

                    {/* Name */}
                    <h1 className="product-page-name">{product.name}</h1>

                    {/* Pricing */}
                    <div className="pp-price-row">
                        {product.discountPrice ? (
                            <>
                                <span className="pp-price-sale">{product.discountPrice.toFixed(0)} ج.م</span>
                                <span className="pp-price-original">{product.price.toFixed(0)} ج.م</span>
                                <span className="pp-discount-badge">
                                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                </span>
                            </>
                        ) : (
                            <span className="product-page-price">{product.price.toFixed(0)} ج.م</span>
                        )}
                    </div>

                    {/* Stock badge — only show when admin set a stock value */}
                    {product.stock != null && (
                        <div>
                            <span className={`pp-stock-badge${product.stock > 0 ? ' in-stock' : ' out-stock'}`}>
                                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                            </span>
                        </div>
                    )}

                    {/* ── COLOR SELECTOR ── */}
                    {colorVariants.length > 0 && (
                        <div className="pp-field-block">
                            <span className="pp-field-label">Color{selectedColor ? `: ${selectedColor}` : ''}</span>
                            <div className="color-selector">
                                {colorVariants.map(cv => (
                                    <button
                                        key={cv.name}
                                        className={`color-swatch${selectedColor === cv.name ? ' selected' : ''}`}
                                        style={{ '--swatch-color': cv.hexCode } as React.CSSProperties}
                                        onClick={() => setSelectedColor(prev => prev === cv.name ? null : cv.name)}
                                        title={cv.name}
                                        aria-label={`Select color ${cv.name}`}
                                        aria-pressed={selectedColor === cv.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── SIZE SELECTOR ── */}
                    <div className="pp-field-block">
                        <div className="pp-field-header">
                            <span className="pp-field-label">Size</span>
                            <button className="pp-size-guide-link" onClick={() => setShowSizeGuide(true)}>
                                Size Guide
                            </button>
                        </div>
                        {product.sizes?.length > 0 ? (
                            <SizeSelector
                                sizes={product.sizes}
                                selected={selectedSize}
                                onChange={setSelectedSize}
                            />
                        ) : (
                            <p style={{ fontSize: '13px', opacity: 0.6 }}>One Size</p>
                        )}
                    </div>

                    {/* ── QUANTITY ── */}
                    <div className="pp-field-block">
                        <span className="pp-field-label">Quantity</span>
                        <div className="pp-qty-control">
                            <button className="pp-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
                            <span className="pp-qty-val">{qty}</span>
                            <button className="pp-qty-btn" onClick={() => setQty(Math.min(product.stock != null ? product.stock : 99, qty + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
                        </div>
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    <div className="pp-actions">
                        <AddToCartButton onAdd={handleAddToCart} disabled={product.stock === 0} label="Add to Cart" />
                        <button className="btn-primary product-page-add-btn pp-buy-now" onClick={handleBuyNow} disabled={product.stock === 0}>
                            Buy Now
                        </button>
                    </div>

                    {/* WhatsApp */}
                    <button
                        className="pp-whatsapp-btn"
                        onClick={() => window.open(`https://wa.me/201140892554?text=I want to buy ${encodeURIComponent(product.name)} - Size: ${selectedSize || 'Any'}`, '_blank')}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Order via WhatsApp
                    </button>

                    {/* ── ACCORDION INFO ── */}
                    <div className="pp-accordions">
                        <AccordionSection title="Description">
                            <p>{product.descriptionEn || 'Premium quality activewear designed for performance and style.'}</p>
                        </AccordionSection>
                        <AccordionSection title="Materials & Care">
                            <ul className="accordion-list">
                                <li>90% Polyester, 10% Elastane</li>
                                <li>Moisture-wicking fabric</li>
                                <li>Machine wash cold, gentle cycle</li>
                                <li>Do not bleach or tumble dry</li>
                            </ul>
                        </AccordionSection>
                        <AccordionSection title="Shipping Information">
                            <ul className="accordion-list">
                                <li>Standard delivery: 3–5 business days</li>
                                <li>Express delivery: 1–2 business days</li>
                                <li>Free shipping on orders over 500 ج.م</li>
                                <li>Orders placed before 2 PM ship same day</li>
                            </ul>
                        </AccordionSection>
                        <AccordionSection title="Returns & Exchanges">
                            <ul className="accordion-list">
                                <li>Free returns within 30 days of purchase</li>
                                <li>Items must be unworn and in original packaging</li>
                                <li>Exchanges available for different sizes</li>
                                <li>Contact support to initiate a return</li>
                            </ul>
                        </AccordionSection>
                    </div>
                </div>
            </div>

            {/* ── RELATED PRODUCTS ── */}
            <RelatedProducts products={relatedProducts} />

            {/* ── STICKY MOBILE BAR ── */}
            {product.stock !== 0 && (
                <div className="sticky-atc-bar">
                    <div className="sticky-atc-price">
                        {product.discountPrice ? (
                            <>
                                <span className="sticky-price-sale">{product.discountPrice.toFixed(0)} ج.م</span>
                                <span className="sticky-price-old">{product.price.toFixed(0)} ج.م</span>
                            </>
                        ) : (
                            <span className="sticky-price-main">{product.price.toFixed(0)} ج.م</span>
                        )}
                    </div>
                    <AddToCartButton onAdd={handleAddToCart} disabled={false} label="Add to Cart" />
                </div>
            )}

            {/* ── SIZE GUIDE MODAL ── */}
            {showSizeGuide && (
                <div className="size-guide-overlay" onClick={() => setShowSizeGuide(false)} role="dialog" aria-modal="true" aria-label="Size Guide">
                    <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
                        <button className="size-guide-close" onClick={() => setShowSizeGuide(false)} aria-label="Close">×</button>
                        <h2 className="size-guide-title">Size Guide</h2>
                        <table className="size-guide-table">
                            <thead>
                                <tr>
                                    <th>Size</th>
                                    <th>Chest (CM)</th>
                                    <th>Waist (CM)</th>
                                    <th>Length (CM)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['S', '96–100', '78–82', '70'],
                                    ['M', '100–104', '82–86', '72'],
                                    ['L', '104–108', '86–90', '74'],
                                    ['XL', '108–114', '90–96', '76'],
                                    ['XXL', '114–120', '96–102', '78'],
                                ].map(([size, chest, waist, length]) => (
                                    <tr key={size}>
                                        <td><strong>{size}</strong></td>
                                        <td>{chest}</td>
                                        <td>{waist}</td>
                                        <td>{length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="size-guide-note">Measurements are approximate and may vary by style.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
