'use client';
import { useState, useEffect } from 'react';

export default function About() {
    const [aboutText, setAboutText] = useState('AXIS is a premium sportswear brand built for modern athletes. We believe in minimal design and maximum performance. Our mission is to provide high-quality gym wear that looks as good as it feels.');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.aboutText) setAboutText(data.aboutText);
            });
    }, []);

    return (
        <div style={{ padding: '8rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>About AXIS</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#555', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
                {aboutText}
            </p>
        </div>
    );
}
