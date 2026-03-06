'use client';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '@/store/cartStore';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getSocket } from '@/lib/socket';

const API = 'https://axis-backend-2.onrender.com/api';
const DEFAULT_ANNOUNCEMENT = 'Free shipping on orders over $50 ✦ New arrivals every week ✦ Premium quality sportswear';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const items = useCartStore((state) => state.items);
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    // Scroll handler
    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 10);
    }, []);

    // Fetch settings + Socket.IO listener
    useEffect(() => {
        setMounted(true);

        fetch(`${API}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.brandLogo) {
                    setLogoUrl(data.brandLogo);
                    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = data.brandLogo;
                }
                setAnnouncementText(data.announcementText || DEFAULT_ANNOUNCEMENT);
            })
            .catch(console.error);

        const socket = getSocket();
        const onSettingsUpdated = (s: any) => {
            if (s.announcementText !== undefined) setAnnouncementText(s.announcementText || DEFAULT_ANNOUNCEMENT);
            if (s.brandLogo) setLogoUrl(s.brandLogo);
        };
        socket.on('settings_updated', onSettingsUpdated);

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            socket.off('settings_updated', onSettingsUpdated);
        };
    }, [handleScroll]);

    // Lock body scroll when menu/search open
    useEffect(() => {
        document.body.style.overflow = (mobileMenuOpen || searchOpen) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen, searchOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setSearchResults([]);
            setHasSearched(false);
        }
    }, [searchOpen]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            setHasSearched(false);
            return;
        }

        setSearchLoading(true);
        searchTimerRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`${API}/products/search?q=${encodeURIComponent(value.trim())}`);
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            } catch {
                setSearchResults([]);
            }
            setSearchLoading(false);
            setHasSearched(true);
        }, 350);
    };

    const handleResultClick = (productId: string) => {
        setSearchOpen(false);
        router.push(`/product/${productId}`);
    };

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    if (pathname.startsWith('/admin')) return null;

    const marqueeContent = announcementText;

    return (
        <>
            {/* Announcement Bar */}
            <div className={`announcement-bar ${isScrolled ? 'hidden' : ''}`}>
                <div className="announcement-marquee-wrapper">
                    <div className="announcement-marquee-track">
                        {/* Render exactly 2 identical halves for mathematically perfect infinite scrolling */}
                        {[0, 1].map((half) => (
                            <div key={half} className="announcement-marquee-half" aria-hidden={half === 1 ? 'true' : undefined}>
                                {[...Array(10)].map((_, i) => (
                                    <span key={i} className="announcement-item">
                                        <span className="announcement-text">{marqueeContent}</span>
                                        <span className="announcement-spacer">✦</span>
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-left">
                    <button
                        className="header-icon-btn mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>

                    <nav className="desktop-menu" style={{ gap: '2rem', alignItems: 'center', marginLeft: '1rem' }} suppressHydrationWarning>
                        <Link href="/" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.home')}</Link>
                        <Link href="/shop" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.shop')}</Link>
                        <Link href="/track" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.trackOrder')}</Link>
                        <Link href="/about" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.about')}</Link>
                    </nav>
                </div>

                <div className="header-center">
                    <Link href="/" className="header-logo">AXIS</Link>
                </div>

                <div className="header-right">
                    <button className="header-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                        <Search size={20} />
                    </button>
                    <button className="header-icon-btn" onClick={toggleCart} aria-label="Cart">
                        <ShoppingBag size={20} />
                        {mounted && totalItems > 0 && (
                            <span className="cart-badge">{totalItems}</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Search Overlay */}
            {mounted && createPortal(
                <div className={`search-overlay ${searchOpen ? 'open' : ''}`} onClick={() => setSearchOpen(false)}>
                    <div className="search-container" onClick={e => e.stopPropagation()}>
                        <Search size={18} className="search-icon-inside" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="search-input"
                            placeholder={t('nav.searchPlaceholder') || 'Search products...'}
                            value={searchQuery}
                            onChange={e => handleSearchChange(e.target.value)}
                        />
                        <button className="search-close-btn" onClick={() => setSearchOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchQuery.trim() && (
                        <div className="search-results" onClick={e => e.stopPropagation()}>
                            {searchLoading ? (
                                <div className="search-loading">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(p => (
                                    <div key={p._id} className="search-result-item" onClick={() => handleResultClick(p._id)}>
                                        <img
                                            src={p.images?.[0] || 'https://via.placeholder.com/56x68'}
                                            alt={p.name}
                                            className="search-result-img"
                                            loading="lazy"
                                        />
                                        <div className="search-result-info">
                                            <div className="search-result-name">{p.name}</div>
                                            <div className="search-result-price">
                                                {p.discountPrice ? `${p.discountPrice.toFixed(0)} ج.م` : `${p.price.toFixed(0)} ج.م`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : hasSearched ? (
                                <div className="search-no-results">No products found</div>
                            ) : null}
                        </div>
                    )}
                </div>,
                document.body
            )}

            {/* Mobile Menu */}
            {mounted && createPortal(
                <div className={`mobile-menu-fullscreen ${mobileMenuOpen ? 'open' : 'closed'}`}>
                    <div className="mobile-menu-header">
                        <X size={28} cursor="pointer" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', transition: 'transform 0.3s ease' }} />
                    </div>
                    <div className="mobile-menu-links" style={{ opacity: mobileMenuOpen ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }} suppressHydrationWarning>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.home')}</Link>
                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.shop')}</Link>
                        <Link href="/track" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.trackOrder')}</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.about')}</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.contact')}</Link>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
