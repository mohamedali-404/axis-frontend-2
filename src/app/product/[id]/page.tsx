'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [lang, setLang] = useState<'en' | 'ar'>('en');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const addItem = useCartStore(state => state.addItem);
    const router = useRouter();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.images?.length > 0) setMainImage(data.images[0]);
                if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
            })
            .catch(err => console.error(err));

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter((p: any) => p._id !== id).slice(0, 4);
                setRelatedProducts(filtered);
            })
            .catch(console.error);
    }, [id]);

    if (!product) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>LOADING...</div>;

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
        <div style={{ padding: '8rem clamp(1rem, 4vw, 2rem) 4rem', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>

                {/* Gallery */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="product-image-container" style={{ backgroundColor: 'var(--secondary-color)', aspectRatio: '3/4', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                        {mainImage ? <img src={mainImage} className="product-zoom" alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>No Image</div>}
                        {product.discountPrice && (
                            <span style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', padding: '6px 14px', fontSize: '0.9rem', fontWeight: 800, borderRadius: '4px' }}>SALE</span>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {product.images.map((img: string, idx: number) => (
                                <img key={idx} src={img} alt={`Thumb ${idx}`} onClick={() => setMainImage(img)} style={{ width: 80, height: 100, objectFit: 'cover', cursor: 'pointer', borderRadius: '8px', border: mainImage === img ? '2px solid var(--accent-color)' : '2px solid transparent', opacity: mainImage === img ? 1 : 0.6, transition: 'all 0.2s' }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', lineHeight: 1.1, letterSpacing: '-1px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{product.name}</h1>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {product.discountPrice ? (
                                <>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{product.discountPrice.toFixed(0)} ج.م</span>
                                    <span style={{ fontSize: '1.5rem', color: 'var(--accent-color)', opacity: 0.5, textDecoration: 'line-through', fontWeight: 600 }}>{product.price.toFixed(0)} ج.م</span>
                                </>
                            ) : (
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)' }}>{product.price.toFixed(0)} ج.م</span>
                            )}
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <span style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: product.stock > 0 ? '#ecfdf5' : '#fef2f2', color: product.stock > 0 ? '#059669' : '#dc2626', fontWeight: 700, fontSize: '0.9rem', borderRadius: '6px', letterSpacing: '0.5px' }}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Size</span>
                            <span onClick={() => setShowSizeGuide(true)} style={{ color: 'var(--accent-color)', opacity: 0.7, textDecoration: 'underline', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Size Guide</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {product.sizes?.map((sz: string) => (
                                <button key={sz} onClick={() => setSelectedSize(sz)} style={{ padding: '12px 24px', backgroundColor: selectedSize === sz ? 'var(--accent-color)' : 'transparent', color: selectedSize === sz ? 'var(--accent-foreground)' : 'var(--accent-color)', border: '2px solid var(--accent-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, minWidth: 60, transition: 'all 0.2s', opacity: selectedSize === sz ? 1 : 0.8 }}>
                                    {sz}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span style={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Quantity</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button style={{ padding: '12px 16px', background: 'var(--secondary-color)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={20} /></button>
                            <span style={{ padding: '0 2rem', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-color)', width: '80px', textAlign: 'center' }}>{qty}</span>
                            <button style={{ padding: '12px 16px', background: 'var(--secondary-color)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={20} /></button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn-secondary" style={{ flex: 1, padding: '18px 0', fontSize: '1.1rem', borderRadius: '8px' }} onClick={handleAddToCart} disabled={product.stock === 0}>
                            Add to Cart
                        </button>
                        <button className="btn-primary" style={{ flex: 1, padding: '18px 0', fontSize: '1.1rem', borderRadius: '8px' }} onClick={handleBuyNow} disabled={product.stock === 0}>
                            Buy Now
                        </button>
                    </div>

                    <button style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', width: '100%', borderRadius: '8px', transition: 'opacity 0.2s' }} className="hover-opacity" onClick={() => window.open(`https://wa.me/201140892554?text=I want to buy ${product.name} - Size: ${selectedSize || 'Any'}`, '_blank')}>
                        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'currentColor' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Order via WhatsApp
                    </button>

                    <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border-color)', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-color)' }}>Description</h3>
                            <div>
                                <button onClick={() => setLang('en')} style={{ background: 'none', border: lang === 'en' ? '2px solid var(--accent-color)' : '2px solid transparent', padding: '4px 12px', marginRight: '8px', cursor: 'pointer', fontWeight: 700, borderRadius: '6px', color: 'var(--accent-color)' }}>EN</button>
                                <button onClick={() => setLang('ar')} style={{ background: 'none', border: lang === 'ar' ? '2px solid var(--accent-color)' : '2px solid transparent', padding: '4px 12px', cursor: 'pointer', fontWeight: 700, borderRadius: '6px', color: 'var(--accent-color)' }}>AR</button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--accent-color)', opacity: 0.8, lineHeight: 1.8, fontSize: '1.1rem' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{description}</p>
                    </div>

                    <div style={{ marginTop: '1rem', borderTop: '2px solid var(--border-color)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--accent-color)' }}>Shipping & Return Policy</h3>
                        <p style={{ color: 'var(--accent-color)', opacity: 0.8, lineHeight: 1.8 }}>Free shipping on all orders over $100. Returns are accepted within 30 days of purchase. Items must be in original condition.</p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '6rem', borderTop: '2px solid var(--border-color)', paddingTop: '4rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '-1px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>You May Also Like</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {relatedProducts.map(rp => (
                            <div key={rp._id} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => router.push(`/product/${rp._id}`)}>
                                <div style={{ overflow: 'hidden', backgroundColor: 'var(--secondary-color)', aspectRatio: '3/4', position: 'relative', borderRadius: '12px' }}>
                                    <img src={rp.images?.[0] || 'https://via.placeholder.com/600'} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                                    {rp.discountPrice && (
                                        <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px' }}>SALE</span>
                                    )}
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', fontWeight: 700, marginBottom: '0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rp.name}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {rp.discountPrice ? (
                                            <>
                                                <span style={{ fontWeight: 800, color: '#ef4444' }}>{rp.discountPrice.toFixed(0)} ج.م</span>
                                                <span style={{ opacity: 0.5, textDecoration: 'line-through', fontSize: '0.9rem' }}>{rp.price.toFixed(0)} ج.م</span>
                                            </>
                                        ) : (
                                            <span style={{ fontWeight: 800 }}>{rp.price.toFixed(0)} ج.م</span>
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setShowSizeGuide(false)}>
                    <div style={{ backgroundColor: 'rgb(var(--background-start-rgb))', padding: '3rem', borderRadius: '16px', maxWidth: 600, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => setShowSizeGuide(false)}>×</button>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase', textAlign: 'center' }}>Size Guide</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 800 }}>Size</th>
                                    <th style={{ padding: '1rem', fontWeight: 800 }}>Chest (CM)</th>
                                    <th style={{ padding: '1rem', fontWeight: 800 }}>Length (CM)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>S</td>
                                    <td style={{ padding: '1rem' }}>96 - 100</td>
                                    <td style={{ padding: '1rem' }}>70</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>M</td>
                                    <td style={{ padding: '1rem' }}>100 - 104</td>
                                    <td style={{ padding: '1rem' }}>72</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>L</td>
                                    <td style={{ padding: '1rem' }}>104 - 108</td>
                                    <td style={{ padding: '1rem' }}>74</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>XL</td>
                                    <td style={{ padding: '1rem' }}>108 - 114</td>
                                    <td style={{ padding: '1rem' }}>76</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>XXL</td>
                                    <td style={{ padding: '1rem' }}>114 - 120</td>
                                    <td style={{ padding: '1rem' }}>78</td>
                                </tr>
                            </tbody>
                        </table>
                        <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7, textAlign: 'center' }}>Measurements are generic standards for Activewear. Fits may vary slightly depending on the items.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
