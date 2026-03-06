'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function ShopContent({ initialProducts = [] }: { initialProducts?: any[] }) {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>(initialProducts);
    const [filtered, setFiltered] = useState<any[]>(initialProducts);
    const [sort, setSort] = useState('newest');
    const [sizeFilter, setSizeFilter] = useState('');

    // Initialize filter from URL parameter if present
    const typeParam = searchParams?.get('type');
    const getInitialSleeve = () => {
        if (typeParam === 'longsleeve') return 'Long';
        if (typeParam === 'tshirts') return 'Short';
        return '';
    };

    const [sleeveFilter, setSleeveFilter] = useState(getInitialSleeve());
    const { t } = useLanguage();

    useEffect(() => {
        if (typeParam === 'longsleeve') setSleeveFilter('Long');
        else if (typeParam === 'tshirts') setSleeveFilter('Short');
        else setSleeveFilter('');
    }, [typeParam]);

    useEffect(() => {
        let result = Array.isArray(products) ? [...products] : [];
        if (sizeFilter) {
            result = result.filter(p => p.sizes && p.sizes.includes(sizeFilter));
        }
        if (sleeveFilter) {
            result = result.filter(p => p.sleeveType && p.sleeveType.toLowerCase() === sleeveFilter.toLowerCase());
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
        <div className="shop-page-container">
            <h1 className="shop-page-title stagger-1">
                {t('shop.title')}
            </h1>

            {/* Filters */}
            <div className="store-filter-bar stagger-2">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1 }}>
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
            <div className="product-grid stagger-3" style={{ minHeight: '50vh' }}>
                <>
                    {filtered.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--accent-color)', opacity: 0.6, fontSize: '1rem', fontWeight: 500, backgroundColor: 'var(--secondary-color)', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                            {t('shop.noProducts')}
                        </div>
                    )}
                </>
            </div>
        </div>
    );
}

export default function ShopClient({ initialProducts = [] }: { initialProducts?: any[] }) {
    return (
        <Suspense fallback={<div style={{ minHeight: '50vh', padding: '10rem 2rem', textAlign: 'center', fontWeight: 'bold' }}>Loading shop...</div>}>
            <ShopContent initialProducts={initialProducts} />
        </Suspense>
    );
}
