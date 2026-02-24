'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams?.get('id');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) {
            router.push('/');
        }
    }, [id, router]);

    const handleCopy = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!id) return null;

    return (
        <div style={{ maxWidth: 600, width: '100%', margin: '0 auto', textAlign: 'center', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '4rem 2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={80} color="#10b981" />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '-1px' }}>Order Placed!</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '3rem', fontWeight: 500, lineHeight: 1.6 }}>
                Thank you for your purchase. Your order has been registered successfully!<br />
                <span style={{ color: '#b45309', fontWeight: 800 }}>Please save your Order ID below to track your delivery.</span>
            </p>

            <div style={{ backgroundColor: 'var(--secondary-color)', padding: '2rem', borderRadius: '12px', border: '2px dashed var(--border-color)', marginBottom: '3rem', position: 'relative' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Order ID</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '2px', wordBreak: 'break-all' }}>{id}</span>
                    <button
                        onClick={handleCopy}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 16px', backgroundColor: copied ? '#10b981' : 'var(--accent-color)', color: copied ? '#fff' : 'var(--accent-foreground)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                        <Copy size={18} />
                        {copied ? 'Copied!' : 'Copy ID'}
                    </button>
                </div>
            </div>

            <button onClick={() => router.push(`/track?id=${id}`)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '16px 32px', fontSize: '1.1rem', borderRadius: '8px' }}>
                Track My Order Now
                <ArrowRight size={20} />
            </button>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10rem 2rem 4rem', backgroundColor: 'var(--secondary-color)' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', fontWeight: 'bold' }}>Loading confirmation...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
