'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams?.get('id');

    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        if (!id) {
            router.push('/');
        }
    }, [id, router]);

    const handleCopyId = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    if (!id) return null;

    return (
        <div style={{ maxWidth: 650, width: '100%', margin: '0 auto', textAlign: 'center', backgroundColor: 'rgb(var(--background-start-rgb))', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={80} color="#10b981" style={{ width: 'clamp(60px, 10vw, 80px)', height: 'clamp(60px, 10vw, 80px)' }} />
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '-1px' }}>تم الطلب!</h1>
            <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', opacity: 0.8, marginBottom: '2rem', fontWeight: 500, lineHeight: 1.8, direction: 'rtl' }}>
                شكراً لك على طلبك! تم تسجيل طلبك بنجاح.<br />
                <span style={{ color: '#b45309', fontWeight: 800 }}>⚠️ احتفظ بـ ID الطلب الموجود أدناه — ستحتاجه لتتبع شحنتك.</span>
            </p>

            <div style={{ backgroundColor: 'var(--secondary-color)', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '12px', border: '2px dashed var(--border-color)', marginBottom: '2rem', position: 'relative' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>رقم طلبك</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 800, letterSpacing: '1px', wordBreak: 'break-all' }}>{id}</span>
                    <button onClick={handleCopyId} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', backgroundColor: copiedId ? '#10b981' : '', color: copiedId ? '#fff' : '', flexShrink: 0 }}>
                        <Copy size={16} />
                        {copiedId ? 'تم النسخ!' : 'نسخ'}
                    </button>
                </div>
            </div>



            <button onClick={() => router.push(`/track-order?id=${id}`)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '16px 24px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', borderRadius: '8px', width: '100%', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                تتبع طلبي الآن
                <ArrowRight size={20} style={{ width: '1.2em', height: '1.2em' }} />
            </button>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(6rem, 15vw, 10rem) clamp(1rem, 3vw, 2rem) 4rem', backgroundColor: 'var(--secondary-color)' }}>
            <Suspense fallback={<div style={{ textAlign: 'center', fontWeight: 'bold' }}>Loading confirmation...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
