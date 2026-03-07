'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function About() {
    const [aboutText, setAboutText] = useState('');
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetch(`https://axis-backend-2.onrender.com/api/settings`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.aboutText) setAboutText(data.aboutText);
                else setAboutText('AXIS is a premium sportswear brand built for modern athletes. We believe in minimal design and maximum performance. Our mission is to provide high-quality gym wear that looks as good as it feels.');
            })
            .catch(() => {
                setAboutText('AXIS is a premium sportswear brand built for modern athletes. We believe in minimal design and maximum performance. Our mission is to provide high-quality gym wear that looks as good as it feels.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '8rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', opacity: 0.5 }}>{t('about.title')}</h1>
                <div style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 2s infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>{t('about.title')}</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#555', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
                {aboutText}
            </p>
        </div>
    );
}
