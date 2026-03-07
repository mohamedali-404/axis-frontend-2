'use client';
import { useState, useEffect } from 'react';

export default function Contact() {
    const [contactInfo, setContactInfo] = useState({
        email: 'support@axis-store.com',
        phone: '+20 100 000 0000',
        address: 'Cairo, Egypt'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://axis-backend-2.onrender.com/api/settings`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.contactInfo) setContactInfo(data.contactInfo);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '8rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', opacity: 0.5 }}>Contact Us</h1>
                <div style={{ height: '250px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 2s infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>Contact Us</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#555', marginBottom: '2rem' }}>
                Have a question or need support? Reach out to us.
            </p>
            <div style={{ border: '1px solid var(--border-color)', padding: '3rem', backgroundColor: 'rgb(var(--background-start-rgb))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Customer Support</h3>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 600 }}>Email: <a href={`mailto:${contactInfo.email}`} style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{contactInfo.email}</a></p>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 600 }}>Phone: <a href={`tel:${contactInfo.phone}`} style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{contactInfo.phone}</a></p>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 600 }}>Address: <span style={{ opacity: 0.8 }}>{contactInfo.address}</span></p>
            </div>
        </div>
    );
}
