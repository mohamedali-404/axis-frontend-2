'use client';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const toggleCart = useCartStore((state) => state.toggleCart);
    const items = useCartStore((state) => state.items);
    const pathname = usePathname();
    const { t } = useLanguage();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
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
            })
            .catch(console.error);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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


    return (
        <>
            <nav style={{
                position: 'fixed',
                top: isScrolled ? '15px' : '0',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                width: isScrolled ? 'calc(100% - 30px)' : '100%',
                maxWidth: isScrolled ? 1200 : '100%',
                borderRadius: isScrolled ? '20px' : '0',
                backgroundColor: isScrolled ? 'rgba(15, 15, 15, 0.85)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(16px)' : 'none',
                border: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                color: isScrolled ? '#ffffff' : 'inherit',
                boxShadow: isScrolled ? '0 20px 40px rgba(0,0,0,0.2)' : 'none'
            }}>
                <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: isScrolled ? '60px' : '80px', transition: 'height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                    <Link href="/" style={{ fontSize: '2.5rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', color: 'inherit', textShadow: isScrolled ? 'none' : '2px 4px 10px rgba(0,0,0,0.5)', transition: 'all 0.3s' }}>
                        AXIS
                    </Link>

                    <div style={{ display: 'none', gap: '3rem' }} className="desktop-menu" suppressHydrationWarning>
                        <Link href="/" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }} suppressHydrationWarning>{t('nav.home')}</Link>
                        <Link href="/shop" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }} suppressHydrationWarning>{t('nav.shop')}</Link>
                        <Link href="/track" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }} suppressHydrationWarning>{t('nav.trackOrder')}</Link>
                        <Link href="/about" className="hover-opacity" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }} suppressHydrationWarning>{t('nav.about')}</Link>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>


                        {/* Cart Icon */}
                        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }} onClick={toggleCart} className="hover-bg-subtle">
                            <ShoppingBag size={24} />
                            {mounted && totalItems > 0 && (
                                <span style={{
                                    position: 'absolute', top: 0, right: 0, backgroundColor: isScrolled ? '#fff' : 'var(--accent-color)', color: isScrolled ? '#000' : 'var(--accent-foreground)',
                                    fontSize: '0.7rem', fontWeight: 700, width: 20, height: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transform: 'translate(25%, -25%)'
                                }}>
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <Menu size={28} style={{ cursor: 'pointer' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} />
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Portal */}
            {mounted && createPortal(
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%',
                    backgroundColor: '#0a0a0a', color: '#ffffff', zIndex: 9999,
                    padding: '2rem', display: 'flex', flexDirection: 'column',
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)',
                    pointerEvents: mobileMenuOpen ? 'auto' : 'none'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', height: '80px', alignItems: 'center' }}>
                        {/* Lang switcher in mobile menu */}
                        <X size={32} cursor="pointer" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', transform: mobileMenuOpen ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.6s ease' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', opacity: mobileMenuOpen ? 1 : 0, transition: 'opacity 0.4s ease 0.3s' }} suppressHydrationWarning>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.home')}</Link>
                        <Link href="/shop" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.shop')}</Link>
                        <Link href="/track" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.trackOrder')}</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.about')}</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>{t('nav.contact')}</Link>
                    </div>
                </div>,
                document.body
            )}
            <style>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        .hover-bg-subtle:hover {
            background-color: rgba(255,255,255,0.1);
        }
        .lang-switcher:hover {
            background-color: rgba(255,255,255,0.25) !important;
            transform: scale(1.05);
        }
      `}</style>
        </>
    );
}
