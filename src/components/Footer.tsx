'use client';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error);
    }, []);

    return (
        <footer style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', padding: '6rem 2rem 3rem', marginTop: '6rem' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1.5rem', lineHeight: 1 }}>AXIS</h2>
                    <p style={{ color: 'var(--accent-foreground)', opacity: 0.7, maxWidth: 300, marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {t('footer.tagline')}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity" target="_blank" rel="noopener"><Instagram size={28} /></a>}
                        {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity" target="_blank" rel="noopener"><Facebook size={28} /></a>}
                        {settings?.socialLinks?.tiktok && <a href={settings.socialLinks.tiktok} style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity" target="_blank" rel="noopener">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53 2.5h3.08A4.65 4.65 0 0018 7.37v3.13a8.2 8.2 0 01-3.6-.82v6.6a5.53 5.53 0 01-5.54 5.53 5.53 5.53 0 01-5.53-5.54 5.53 5.53 0 015.53-5.54 1.3 1.3 0 01.3.03v3.18a2.38 2.38 0 00-2.67 2.36 2.38 2.38 0 002.38 2.37 2.38 2.38 0 002.37-2.38v-13.8z" /></svg>
                        </a>}
                        {(!settings?.socialLinks?.facebook && !settings?.socialLinks?.instagram && !settings?.socialLinks?.tiktok) && (
                            <>
                                <a href="#" style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity"><Instagram size={28} /></a>
                                <a href="#" style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity"><Facebook size={28} /></a>
                                <a href="#" style={{ color: 'var(--accent-foreground)', opacity: 0.8 }} className="hover-opacity">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53 2.5h3.08A4.65 4.65 0 0018 7.37v3.13a8.2 8.2 0 01-3.6-.82v6.6a5.53 5.53 0 01-5.54 5.53 5.53 5.53 0 01-5.53-5.54 5.53 5.53 0 015.53-5.54 1.3 1.3 0 01.3.03v3.18a2.38 2.38 0 00-2.67 2.36 2.38 2.38 0 002.38 2.37 2.38 2.38 0 002.37-2.38v-13.8z" /></svg>
                                </a>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>{t('footer.shop')}</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: 0 }}>
                        <li><Link href="/shop" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.allProducts')}</Link></li>
                        <li><Link href="/shop?type=tshirts" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.tshirts')}</Link></li>
                        <li><Link href="/shop?type=longsleeve" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.longSleeves')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>{t('footer.support')}</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: 0 }}>
                        <li><Link href="/contact" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.contactUs')}</Link></li>
                        <li><Link href="/policy" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.returnExchange')}</Link></li>
                        <li><Link href="/shipping" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.shippingPolicy')}</Link></li>
                    </ul>
                </div>
            </div>
            <div style={{ maxWidth: 1400, margin: '5rem auto 0', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: 'var(--accent-foreground)' }}>
                <div style={{ fontSize: '1rem', opacity: 0.6 }}>
                    &copy; {new Date().getFullYear()} AXIS. {t('footer.rights')}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', opacity: 0.9 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px' }}>
                        Crafted with ❤️ and passion by <strong style={{ fontWeight: 800, letterSpacing: '1px' }}>Eng. Mohamed Ali</strong>
                    </span>
                    <span style={{ opacity: 0.4 }}>|</span>
                    <a href="https://wa.me/201282721189" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', backgroundColor: 'rgba(37, 211, 102, 0.1)', padding: '6px', borderRadius: '50%', transition: 'all 0.2s ease', cursor: 'pointer' }} title="Chat on WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
