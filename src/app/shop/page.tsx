'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Shop() {
    const [products, setProducts] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState('newest');
    const [sizeFilter, setSizeFilter] = useState('');
    const [sleeveFilter, setSleeveFilter] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        setIsLoading(true);
        fetch(`https://axis-backend-2.onrender.com/api/products`)
            .then(res => res.json())
            .then(data => {
                const validData = Array.isArray(data) ? data : [];
                setProducts(validData);
                setFiltered(validData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
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
            <h1 className="stagger-1" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', textAlign: 'center', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {t('shop.title')}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Filters */}
                <div className="store-filter-bar stagger-2">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', flex: 1 }}>
                        <div className="filter-group">
                            <span className="filter-label">{t('shop.size')}:</span>
                            <button className={`filter-pill ${sizeFilter === '' ? 'active' : ''}`} onClick={() => setSizeFilter('')}>{t('shop.allSizes')}</button>
                            {['S', 'M', 'L', 'XL'].map(s => (
                                <button key={s} className={`filter-pill ${sizeFilter === s ? 'active' : ''}`} onClick={() => setSizeFilter(s)}>{s}</button>
                            ))}
                        </div>
                        <div className="filter-group">
                            <span className="filter-label">{t('shop.sleeve')}:</span>
                            <button className={`filter-pill ${sleeveFilter === '' ? 'active' : ''}`} onClick={() => setSleeveFilter('')}>{t('shop.allTypes')}</button>
                            <button className={`filter-pill ${sleeveFilter === 'Short' ? 'active' : ''}`} onClick={() => setSleeveFilter('Short')}>{t('shop.short') || 'Short'}</button>
                            <button className={`filter-pill ${sleeveFilter === 'Long' ? 'active' : ''}`} onClick={() => setSleeveFilter('Long')}>{t('shop.long') || 'Long'}</button>
                        </div>
                    </div>
                    <div className="filter-group" style={{ justifyContent: 'flex-start' }}>
                        <span className="filter-label">{t('shop.sortBy')}:</span>
                        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="newest">{t('shop.newest')}</option>
                            <option value="priceLow">{t('shop.priceLow')}</option>
                            <option value="priceHigh">{t('shop.priceHigh')}</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem', marginTop: '2rem', minHeight: '50vh' }}>
                    {isLoading ? (
                        [...Array(6)].map((_, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="skeleton-loading" style={{ width: '100%', aspectRatio: '3/4' }}></div>
                                <div className="skeleton-loading" style={{ width: '80%', height: '24px' }}></div>
                                <div className="skeleton-loading" style={{ width: '40%', height: '20px' }}></div>
                            </div>
                        ))
                    ) : (
                        <>
                            {filtered.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                            {filtered.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 2rem', color: 'var(--accent-color)', opacity: 0.6, fontSize: '1.2rem', fontWeight: 500, backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                    {t('shop.noProducts')}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
