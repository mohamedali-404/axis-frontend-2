'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [lang, setLang] = useState<'en' | 'ar'>('en');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const addItem = useCartStore(state => state.addItem);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        fetch(`https://axis-backend-2.onrender.com/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.images?.length > 0) setMainImage(data.images[0]);
                if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });

        fetch(`https://axis-backend-2.onrender.com/api/products`)
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter((p: any) => p._id !== id).slice(0, 4);
                setRelatedProducts(filtered);
            })
            .catch(console.error);
    }, [id]);

    if (isLoading || !product) {
        return (
            <div className="product-page-container">
                <div className="product-page-grid">
                    <div className="skeleton-loading" style={{ width: '100%', aspectRatio: '3/4', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="skeleton-loading" style={{ width: '80%', height: '24px' }} />
                        <div className="skeleton-loading" style={{ width: '40%', height: '20px' }} />
                        <div className="skeleton-loading" style={{ width: '60%', height: '16px' }} />
                        <div className="skeleton-loading" style={{ width: '100%', height: '48px', marginTop: '16px' }} />
                        <div className="skeleton-loading" style={{ width: '100%', height: '48px' }} />
                    </div>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        if (product.stock < qty) {
            alert('Not enough stock available.');
            return;
        }
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            size: selectedSize,
            quantity: qty,
            image: product.images?.[0] || ''
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };

    const description = lang === 'en' ? product.descriptionEn : product.descriptionAr;

    return (
        <div className="product-page-container">
            <div className="product-page-grid">

                {/* Gallery */}
                <div className="product-page-gallery">
                    <div className="product-page-main-image">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>No Image</div>
                        )}
                        {product.discountPrice && (
                            <span className="product-card-badge product-card-badge-sale" style={{ top: 12, left: 12 }}>SALE</span>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div className="product-page-thumbs">
                            {product.images.map((img: string, idx: number) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Thumb ${idx}`}
                                    onClick={() => setMainImage(img)}
                                    className={`product-page-thumb ${mainImage === img ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="product-page-info">
                    {/* 1. Product Name */}
                    <h1 className="product-page-name">{product.name}</h1>

                    {/* 2. Price */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {product.discountPrice ? (
                            <>
                                <span style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{product.discountPrice.toFixed(0)} ج.م</span>
                                <span style={{ fontSize: '16px', color: 'var(--accent-color)', opacity: 0.5, textDecoration: 'line-through', fontWeight: 500 }}>{product.price.toFixed(0)} ج.م</span>
                            </>
                        ) : (
                            <span className="product-page-price">{product.price.toFixed(0)} ج.م</span>
                        )}
                    </div>

                    {/* Stock */}
                    <div>
                        <span style={{
                            display: 'inline-block', padding: '4px 10px',
                            backgroundColor: product.stock > 0 ? '#ecfdf5' : '#fef2f2',
                            color: product.stock > 0 ? '#059669' : '#dc2626',
                            fontWeight: 600, fontSize: '12px', borderRadius: '4px', letterSpacing: '0.3px'
                        }}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* 3. Size Options */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '13px' }}>Size</span>
                            <span onClick={() => setShowSizeGuide(true)} style={{ color: 'var(--accent-color)', opacity: 0.7, textDecoration: 'underline', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Size Guide</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {product.sizes?.map((sz: string) => (
                                <button key={sz} onClick={() => setSelectedSize(sz)} style={{
                                    padding: '10px 18px',
                                    backgroundColor: selectedSize === sz ? 'var(--accent-color)' : 'transparent',
                                    color: selectedSize === sz ? 'var(--accent-foreground)' : 'var(--accent-color)',
                                    border: '1.5px solid var(--accent-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    minWidth: 48,
                                    transition: 'all 0.2s',
                                    minHeight: '40px',
                                    fontFamily: 'inherit'
                                }}>
                                    {sz}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Quantity */}
                    <div>
                        <span style={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontSize: '13px' }}>Quantity</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <button style={{ padding: '10px 14px', background: 'var(--secondary-color)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)', minHeight: '40px' }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                            <span style={{ padding: '0 1.5rem', fontWeight: 700, fontSize: '14px', color: 'var(--accent-color)', minWidth: '56px', textAlign: 'center' }}>{qty}</span>
                            <button style={{ padding: '10px 14px', background: 'var(--secondary-color)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)', minHeight: '40px' }} onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={16} /></button>
                        </div>
                    </div>

                    {/* 5. Add to Cart / Buy Now */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-secondary product-page-add-btn" style={{ flex: 1 }} onClick={handleAddToCart} disabled={product.stock === 0}>
                            Add to Cart
                        </button>
                        <button className="btn-primary product-page-add-btn" style={{ flex: 1 }} onClick={handleBuyNow} disabled={product.stock === 0}>
                            Buy Now
                        </button>
                    </div>

                    {/* WhatsApp */}
                    <button style={{
                        backgroundColor: '#25D366', color: '#fff', border: 'none',
                        padding: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        width: '100%', borderRadius: '4px', transition: 'opacity 0.2s', minHeight: '44px',
                        fontFamily: 'inherit'
                    }} className="hover-opacity" onClick={() => window.open(`https://wa.me/201140892554?text=I want to buy ${product.name} - Size: ${selectedSize || 'Any'}`, '_blank')}>
                        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Order via WhatsApp
                    </button>

                    {/* 6. Description */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-color)' }}>Description</h3>
                            <div>
                                <button onClick={() => setLang('en')} style={{ background: 'none', border: lang === 'en' ? '1.5px solid var(--accent-color)' : '1.5px solid transparent', padding: '3px 10px', marginRight: '6px', cursor: 'pointer', fontWeight: 700, borderRadius: '4px', color: 'var(--accent-color)', fontSize: '12px', fontFamily: 'inherit' }}>EN</button>
                                <button onClick={() => setLang('ar')} style={{ background: 'none', border: lang === 'ar' ? '1.5px solid var(--accent-color)' : '1.5px solid transparent', padding: '3px 10px', cursor: 'pointer', fontWeight: 700, borderRadius: '4px', color: 'var(--accent-color)', fontSize: '12px', fontFamily: 'inherit' }}>AR</button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--accent-color)', opacity: 0.8, lineHeight: 1.7, fontSize: '14px' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{description}</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--accent-color)' }}>Shipping & Return Policy</h3>
                        <p style={{ color: 'var(--accent-color)', opacity: 0.8, lineHeight: 1.7, fontSize: '14px' }}>Free shipping on all orders over $100. Returns are accepted within 30 days of purchase. Items must be in original condition.</p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>You May Also Like</h2>
                    <div className="product-grid">
                        {relatedProducts.map(rp => (
                            <div key={rp._id} className="product-card" style={{ cursor: 'pointer' }} onClick={() => router.push(`/product/${rp._id}`)}>
                                <div className="product-card-image-wrap">
                                    <img src={rp.images?.[0] || 'https://via.placeholder.com/600'} alt={rp.name} loading="lazy" />
                                    {rp.discountPrice && (
                                        <span className="product-card-badge product-card-badge-sale">SALE</span>
                                    )}
                                    <div className="product-card-overlay" />
                                </div>
                                <div className="product-card-info">
                                    <h3 className="product-card-name">{rp.name}</h3>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setShowSizeGuide(false)}>
                    <div style={{ backgroundColor: 'rgb(var(--background-start-rgb))', padding: '2rem', borderRadius: '8px', maxWidth: 500, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => setShowSizeGuide(false)}>×</button>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', textAlign: 'center' }}>Size Guide</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '10px', fontWeight: 700 }}>Size</th>
                                    <th style={{ padding: '10px', fontWeight: 700 }}>Chest (CM)</th>
                                    <th style={{ padding: '10px', fontWeight: 700 }}>Length (CM)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['S', '96 - 100', '70'],
                                    ['M', '100 - 104', '72'],
                                    ['L', '104 - 108', '74'],
                                    ['XL', '108 - 114', '76'],
                                    ['XXL', '114 - 120', '78'],
                                ].map(([size, chest, length]) => (
                                    <tr key={size} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px', fontWeight: 700 }}>{size}</td>
                                        <td style={{ padding: '10px' }}>{chest}</td>
                                        <td style={{ padding: '10px' }}>{length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ marginTop: '1.5rem', fontSize: '12px', opacity: 0.7, textAlign: 'center' }}>Measurements are generic standards for Activewear. Fits may vary slightly depending on the items.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
