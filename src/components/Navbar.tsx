'use client';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getSocket } from '@/lib/socket';

const DEFAULT_ANNOUNCEMENT = 'Free shipping on orders over $50 ✦ New arrivals every week ✦ Premium quality sportswear';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const items = useCartStore((state) => state.items);
    const pathname = usePathname();
    const { t } = useLanguage();

    const [mounted, setMounted] = useState(false);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 10);
    }, []);

    useEffect(() => {
        setMounted(true);

        // Fetch settings
        fetch(`https://axis-backend-2.onrender.com/api/settings`)
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
                // Use the announcement text from the database, or fall back to default
                setAnnouncementText(data.announcementText || DEFAULT_ANNOUNCEMENT);
            })
            .catch(console.error);

        // Listen for real-time settings updates via Socket.IO
        const socket = getSocket();
        const onSettingsUpdated = (newSettings: any) => {
            if (newSettings.announcementText !== undefined) {
                setAnnouncementText(newSettings.announcementText || DEFAULT_ANNOUNCEMENT);
            }
            if (newSettings.brandLogo) {
                setLogoUrl(newSettings.brandLogo);
            }
        };
        socket.on('settings_updated', onSettingsUpdated);

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            socket.off('settings_updated', onSettingsUpdated);
        };
    }, [handleScroll]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    if (pathname.startsWith('/admin')) return null;

    // The marquee text content
    const marqueeContent = announcementText;

    return (
        <>
            {/* Announcement Bar — Marquee Ticker */}
            <div className={`announcement-bar ${isScrolled ? 'hidden' : ''}`}>
                <div className="announcement-marquee-wrapper">
                    <div className="announcement-marquee">
                        <span className="announcement-marquee-text">{marqueeContent}</span>
                        <span className="announcement-marquee-spacer">✦</span>
                        <span className="announcement-marquee-text">{marqueeContent}</span>
                        <span className="announcement-marquee-spacer">✦</span>
                        <span className="announcement-marquee-text">{marqueeContent}</span>
                        <span className="announcement-marquee-spacer">✦</span>
                        <span className="announcement-marquee-text">{marqueeContent}</span>
                        <span className="announcement-marquee-spacer">✦</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
                {/* Left: Hamburger (mobile) */}
                <div className="header-left">
                    <button
                        className="header-icon-btn mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Desktop Nav Links */}
                    <nav className="desktop-menu" style={{ gap: '2rem', alignItems: 'center', marginLeft: '1rem' }} suppressHydrationWarning>
                        <Link href="/" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.home')}</Link>
                        <Link href="/shop" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.shop')}</Link>
                        <Link href="/track" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.trackOrder')}</Link>
                        <Link href="/about" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }} suppressHydrationWarning>{t('nav.about')}</Link>
                    </nav>
                </div>

                {/* Center: Logo */}
                <div className="header-center">
                    <Link href="/" className="header-logo">
                        AXIS
                    </Link>
                </div>

                {/* Right: Search + Cart */}
                <div className="header-right">
                    <Link href="/shop" className="header-icon-btn" aria-label="Search">
                        <Search size={20} />
                    </Link>
                    <button className="header-icon-btn" onClick={toggleCart} aria-label="Cart">
                        <ShoppingBag size={20} />
                        {mounted && totalItems > 0 && (
                            <span className="cart-badge">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Portal */}
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
