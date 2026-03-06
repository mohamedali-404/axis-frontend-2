'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams?.get('id');
    const method = searchParams?.get('method') || 'Cash on Delivery';
    const amount = searchParams?.get('amount') || '0';
    const walletNumber = searchParams?.get('walletNumber') || '';

    const [copiedId, setCopiedId] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [receiptOk, setReceiptOk] = useState(false);

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

    const handleCopyWallet = () => {
        if (walletNumber) {
            navigator.clipboard.writeText(walletNumber);
            setCopiedWallet(true);
            setTimeout(() => setCopiedWallet(false), 2000);
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('https://axis-backend-2.onrender.com/api/upload/receipt', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                // Update Order with receipt
                const updateRes = await fetch(`https://axis-backend-2.onrender.com/api/orders/${id}/receipt`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiptImage: data.url })
                });
                if (updateRes.ok) {
                    setReceiptOk(true);
                }
            } else {
                alert('Upload failed. Allowed formats: jpg, png, webp, svg.');
            }
        } catch {
            alert('Error during upload.');
        } finally {
            setUploading(false);
        }
    };

    if (!id) return null;

    const waMsg = `Hello AXIS, I have transferred the payment for order #${id} amount ${amount}. I am sending the receipt.`;
    const waPhone = walletNumber.startsWith('0') ? `2${walletNumber}` : walletNumber;
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;

    return (
        <div style={{ maxWidth: 650, width: '100%', margin: '0 auto', textAlign: 'center', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '4rem 2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={80} color="#10b981" />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '-1px' }}>تم الطلب!</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem', fontWeight: 500, lineHeight: 1.8, direction: 'rtl' }}>
                شكراً لك على طلبك! تم تسجيل طلبك بنجاح.<br />
                <span style={{ color: '#b45309', fontWeight: 800 }}>⚠️ احتفظ بـ ID الطلب الموجود أدناه — ستحتاجه لتتبع شحنتك.</span>
            </p>

            <div style={{ backgroundColor: 'var(--secondary-color)', padding: '2rem', borderRadius: '12px', border: '2px dashed var(--border-color)', marginBottom: '2rem', position: 'relative' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>رقم طلبك</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px', wordBreak: 'break-all' }}>{id}</span>
                    <button onClick={handleCopyId} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', backgroundColor: copiedId ? '#10b981' : '', color: copiedId ? '#fff' : '' }}>
                        <Copy size={16} />
                        {copiedId ? 'تم النسخ!' : 'نسخ'}
                    </button>
                </div>
            </div>

            {method !== 'Cash on Delivery' && (
                <div style={{ backgroundColor: '#eef2ff', padding: '2rem', borderRadius: '12px', border: '2px solid #6366f1', marginBottom: '2.5rem' }}>
                    <h3 style={{ color: '#4338ca', fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.4rem' }}>💳 الدفع عبر المحفظة الإلكترونية</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src="/icon-192x192.png" alt="AXIS" style={{ width: 40, height: 40, borderRadius: '8px' }} onError={(e: any) => e.target.style.display = 'none'} />
                            <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '12px', border: '1px solid #c7d2fe', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <QRCodeCanvas value={walletNumber} size={150} level="H" includeMargin imageSettings={{ src: "/icon-192x192.png", height: 24, width: 24, excavate: true }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#4338ca', margin: 0 }}>امسح الكود عبر تطبيق محفظتك</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#4338ca' }}>أو قم بالتحويل للرقم التالي:</p>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', letterSpacing: '2px' }}>{walletNumber}</span>
                            <button onClick={handleCopyWallet} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: copiedWallet ? '#10b981' : '#4f46e5', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                                <Copy size={16} /> {copiedWallet ? 'تم النسخ' : 'نسخ'}
                            </button>
                        </div>
                        <p style={{ fontWeight: 800, color: '#ef4444', marginTop: '1rem' }}>المبلغ المطلوب: {amount} ج.م</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', padding: '14px', borderRadius: '8px', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}>
                            إرسال إيصال الدفع عبر واتساب
                        </a>

                        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: receiptOk ? '#10b981' : '#fff', color: receiptOk ? '#fff' : '#4338ca', border: '2px dashed #6366f1', padding: '14px', borderRadius: '8px', fontWeight: 800, transition: 'all 0.3s' }}>
                            {receiptOk ? '✅ تم رفع الإيصال بنجاح!' : (uploading ? 'جاري الرفع...' : 'رفع صورة إيصال الدفع هنا 📎')}
                            {!receiptOk && !uploading && <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />}
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => router.push(`/track-order?id=${id}`)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '16px 32px', fontSize: '1.1rem', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                تتبع طلبي الآن
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
