'use client';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => {
        fetch(`https://axis-backend-2.onrender.com/api/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error);
    }, []);

    return (
        <footer style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', padding: '3rem 2rem 2rem', marginTop: '3rem' }}>
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
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>{t('footer.support')}</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: 0 }}>
                        <li><Link href="/contact" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.contactUs')}</Link></li>
                        <li><Link href="/policy" style={{ color: 'var(--accent-foreground)', opacity: 0.7, fontSize: '1.1rem', textDecoration: 'none' }} className="hover-opacity">{t('footer.returnExchange')}</Link></li>

                    </ul>
                </div>
            </div>
            <div style={{ maxWidth: 1400, margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: 'var(--accent-foreground)' }}>
                <div style={{ fontSize: '1rem', opacity: 0.6 }}>
                    &copy; {new Date().getFullYear()} AXIS. {t('footer.rights')}
                </div>

            </div>
        </footer>
    );
}
