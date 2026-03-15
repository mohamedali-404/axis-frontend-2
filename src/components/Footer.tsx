'use client';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer({ settings: initialSettings }: { settings?: any }) {
    const [settings, setSettings] = useState<any>(initialSettings || null);
    const { t } = useLanguage();

    useEffect(() => {
        if (!initialSettings) {
            fetch(`https://axis-backend-2.onrender.com/api/settings`, { cache: 'no-store' })
                .then(res => res.json())
                .then(data => setSettings(data))
                .catch(console.error);
        }
    }, [initialSettings]);

    return (
        <footer className="footer-container" style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'var(--font-family, system-ui, sans-serif)' }}>
            <div className="footer-grid">
                <div>
                    <h2 className="footer-logo">AXIS</h2>
                    <p className="footer-tagline">
                        {t('footer.tagline')}
                    </p>
                    <div className="footer-socials">
                        {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} className="footer-social-icon" target="_blank" rel="noopener noreferrer"><Instagram size={28} /></a>}
                        {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} className="footer-social-icon" target="_blank" rel="noopener noreferrer"><Facebook size={28} /></a>}
                        {settings?.socialLinks?.tiktok && <a href={settings.socialLinks.tiktok} className="footer-social-icon" target="_blank" rel="noopener noreferrer">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53 2.5h3.08A4.65 4.65 0 0018 7.37v3.13a8.2 8.2 0 01-3.6-.82v6.6a5.53 5.53 0 01-5.54 5.53 5.53 5.53 0 01-5.53-5.54 5.53 5.53 0 015.53-5.54 1.3 1.3 0 01.3.03v3.18a2.38 2.38 0 00-2.67 2.36 2.38 2.38 0 002.38 2.37 2.38 2.38 0 002.37-2.38v-13.8z" /></svg>
                        </a>}
                        {(!settings?.socialLinks?.facebook && !settings?.socialLinks?.instagram && !settings?.socialLinks?.tiktok) && (
                            <>
                                <a href="#" className="footer-social-icon"><Instagram size={28} /></a>
                                <a href="#" className="footer-social-icon"><Facebook size={28} /></a>
                                <a href="#" className="footer-social-icon">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53 2.5h3.08A4.65 4.65 0 0018 7.37v3.13a8.2 8.2 0 01-3.6-.82v6.6a5.53 5.53 0 01-5.54 5.53 5.53 5.53 0 01-5.53-5.54 5.53 5.53 0 015.53-5.54 1.3 1.3 0 01.3.03v3.18a2.38 2.38 0 00-2.67 2.36 2.38 2.38 0 002.38 2.37 2.38 2.38 0 002.37-2.38v-13.8z" /></svg>
                                </a>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="footer-support-title">{t('footer.support')}</h3>
                    <ul className="footer-support-list">
                        <li><Link href="/contact" className="footer-link">{t('footer.contactUs')}</Link></li>
                        <li><Link href="/policy" className="footer-link">{t('footer.returnExchange')}</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="dev-badge" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src="/dev-avatar.jpg" alt="Developer Avatar" className="dev-avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover', objectPosition: 'center 15%' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Crafted & Developed by</span>
                            <strong style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>Eng. Mohamed Ali</strong>
                        </div>
                    </div>
                    <span className="dev-divider" style={{ opacity: 0.2, fontSize: '1.5rem', margin: '0 4px', fontWeight: 300 }}>|</span>
                    <div className="dev-socials" style={{ display: 'flex', gap: '0.5rem' }}>
                        <a href="https://wa.me/201282721189" target="_blank" rel="noopener noreferrer" className="dev-icon dev-whatsapp" title="Chat on WhatsApp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', padding: '6px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.175-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </a>
                        <a href="https://www.linkedin.com/in/mohamed-ali-00m88" target="_blank" rel="noopener noreferrer" className="dev-icon dev-linkedin" title="Connect on LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A66C2', padding: '6px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                    </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
                    &copy; {new Date().getFullYear()} AXIS. {t('footer.rights')}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .footer-container {
                    padding: 4rem 2rem 2rem;
                    margin-top: 3rem;
                }
                .footer-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 4rem;
                }
                .footer-logo {
                    font-size: 2.5rem;
                    font-weight: 900;
                    font-style: italic;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin-bottom: 1.5rem;
                    line-height: 1;
                }
                .footer-tagline {
                    color: #ccc;
                    max-width: 300px;
                    margin-bottom: 2.5rem;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }
                .footer-socials {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                    justify-content: flex-start;
                }
                .footer-support-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 2rem;
                    letter-spacing: 1px;
                }
                .footer-support-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    padding: 0;
                }
                .footer-bottom {
                    max-width: 1400px;
                    margin: 3rem auto 0;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                .footer-social-icon {
                    color: rgba(255, 255, 255, 0.7);
                    transition: all 0.2s ease-in-out;
                    display: inline-block;
                }
                .footer-social-icon:hover {
                    color: #fff;
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
                }
                .footer-link {
                    color: #ccc;
                    font-size: 1.1rem;
                    text-decoration: none;
                    transition: all 0.2s ease-in-out;
                }
                .footer-link:hover {
                    color: #fff;
                    transform: translateX(4px);
                }
                .dev-icon {
                    transition: all 0.2s ease-in-out;
                    opacity: 0.9;
                }
                .dev-icon:hover {
                    transform: scale(1.05);
                    opacity: 1;
                }
                .dev-whatsapp:hover {
                    transform: scale(1.2);
                    opacity: 1;
                    filter: drop-shadow(0 0 15px rgba(37, 211, 102, 0.9));
                    color: #25D366 !important;
                }
                .dev-linkedin:hover {
                    transform: scale(1.2);
                    opacity: 1;
                    filter: drop-shadow(0 0 15px rgba(10, 102, 194, 0.9));
                    color: #0A66C2 !important;
                }
                .dev-avatar {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    z-index: 1;
                }
                .dev-avatar:hover {
                    transform: scale(2.8) translateY(-10px);
                    z-index: 50;
                    border-color: #fff !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                }
                @media (max-width: 600px) {
                    .footer-container {
                        padding: 2rem 1.5rem 6.5rem;
                        margin-top: 1.5rem;
                    }
                    .footer-grid {
                        gap: 1.5rem;
                    }
                    .footer-logo {
                        margin-bottom: 0.8rem;
                        font-size: 2.2rem;
                    }
                    .footer-tagline {
                        margin-bottom: 1.2rem;
                        font-size: 1rem;
                        line-height: 1.4;
                    }
                    .footer-socials {
                        gap: 1rem;
                    }
                    .footer-support-title {
                        margin-bottom: 0.8rem;
                        font-size: 1.1rem;
                    }
                    .footer-support-list {
                        gap: 0.5rem;
                    }
                    .footer-link {
                        font-size: 0.95rem;
                    }
                    .footer-bottom {
                        margin-top: 1.5rem;
                        padding-top: 1.5rem;
                        gap: 1rem;
                    }
                    .dev-badge {
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        border-radius: 40px !important;
                        padding: 8px 12px !important;
                        flex-wrap: nowrap;
                        gap: 0.3rem !important;
                        transform: scale(0.95);
                    }
                    .dev-divider {
                        display: block;
                        font-size: 1.2rem;
                        margin: 0 1px;
                    }
                    .dev-socials {
                        margin-top: 0;
                    }
                }
            `}} />
        </footer>
    );
}
