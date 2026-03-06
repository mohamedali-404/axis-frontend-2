'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight, AlertTriangle } from 'lucide-react';

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
                <div className="wallet-container" style={{ backgroundColor: '#ffffff', padding: 'clamp(1.5rem, 5vw, 2.5rem)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '3rem' }}>
                    <h3 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '2rem', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', textAlign: 'center' }}>💳 الدفع عبر المحفظة الإلكترونية</h3>

                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'column', textAlign: 'center', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)' }}>
                        <AlertTriangle color="#dc2626" size={36} />
                        <div>
                            <p style={{ color: '#991b1b', fontWeight: 900, margin: '0 0 0.5rem 0', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>تنبيه هام جداً!</p>
                            <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>يرجى عدم مغادرة هذه الصفحة قبل إتمام عملية التحويل ورفع صورة الإيصال لتأكيد طلبك.</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ marginBottom: '1rem', fontWeight: 700, color: '#475569', fontSize: '1.1rem' }}>الرجاء التحويل للرقم التالي:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem', backgroundColor: '#fff', padding: '1.2rem', borderRadius: '8px', border: '2px dashed #cbd5e1', marginBottom: '1rem' }}>
                            <span style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '2px' }}>{walletNumber}</span>
                            <button onClick={handleCopyWallet} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: copiedWallet ? '#10b981' : '#0f172a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '1rem' }}>
                                <Copy size={18} /> {copiedWallet ? 'تم النسخ بنجاح' : 'نسخ الرقم'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: '1.1rem' }}>المبلغ المطلوب تحويله:</span>
                            <span style={{ fontWeight: 900, color: '#ef4444', fontSize: '1.2rem' }}>{amount} ج.م</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', padding: '18px', borderRadius: '12px', fontWeight: 800, fontSize: 'clamp(1rem, 4vw, 1.2rem)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 16px rgba(37,211,102,0.2)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            إرسال إيصال الدفع عبر واتساب
                        </a>

                        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: receiptOk ? '#10b981' : '#fff', color: receiptOk ? '#fff' : '#0f172a', border: receiptOk ? '2px solid #10b981' : '2px dashed #cbd5e1', padding: '18px', borderRadius: '12px', fontWeight: 800, fontSize: 'clamp(1rem, 4vw, 1.2rem)', transition: 'all 0.3s' }}>
                            {receiptOk ? '✅ تم رفع الإيصال بنجاح!' : (uploading ? 'جاري الرفع...' : 'رفع صورة إيصال الدفع هنا 📎')}
                            {!receiptOk && !uploading && <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />}
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => router.push(`/track-order?id=${id}`)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '18px 32px', fontSize: '1.2rem', borderRadius: '8px', width: '100%', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
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
