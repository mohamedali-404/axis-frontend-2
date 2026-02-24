'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function Shop() {
    const [products, setProducts] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [sort, setSort] = useState('newest');
    const [sizeFilter, setSizeFilter] = useState('');
    const [sleeveFilter, setSleeveFilter] = useState('');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            .then(res => res.json())
            .then(data => {
                const validData = Array.isArray(data) ? data : [];
                setProducts(validData);
                setFiltered(validData);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let result = Array.isArray(products) ? [...products] : [];
        if (sizeFilter) {
            result = result.filter(p => p.sizes && p.sizes.includes(sizeFilter));
        }
        if (sleeveFilter) {
            result = result.filter(p => p.sleeveType === sleeveFilter);
        }
        if (sort === 'priceLow') {
            result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sort === 'priceHigh') {
            result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        setFiltered(result);
    }, [sort, sizeFilter, sleeveFilter, products]);

    return (
        <div style={{ padding: '8rem 2rem 4rem', maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', textAlign: 'center', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                Store
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--secondary-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>Size</label>
                        <select className="select" value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
                            <option value="">All Sizes</option>
                            {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>Sleeve</label>
                        <select className="select" value={sleeveFilter} onChange={e => setSleeveFilter(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="Short">Short</option>
                            <option value="Long">Long</option>
                        </select>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>Sort By</label>
                        <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem', marginTop: '2rem', minHeight: '50vh' }}>
                    {filtered.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 2rem', color: 'var(--accent-color)', opacity: 0.6, fontSize: '1.2rem', fontWeight: 500, backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                            No products found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
