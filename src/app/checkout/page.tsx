'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Checkout() {
    const router = useRouter();
    const { items, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const { t } = useLanguage();

    const [form, setForm] = useState({
        customerName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        notes: '',
        paymentMethod: 'Cash on Delivery',
        vodafoneCashNumber: '',
    });
    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [step, setStep] = useState(1);
    const [paymentSettings, setPaymentSettings] = useState<any>({
        cashOnDelivery: true,
        eWallet: true,
        eWalletNumber: '01000000000',
        eWalletName: 'E-Wallet / Cash'
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        fetch(`https://axis-backend-2.onrender.com/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.shippingRates) {
                    setShippingRates(data.shippingRates);
                }
                if (data.paymentMethods) {
                    setPaymentSettings(data.paymentMethods);
                    if (data.paymentMethods.cashOnDelivery) {
                        setForm(f => ({ ...f, paymentMethod: 'Cash on Delivery' }));
                    } else if (data.paymentMethods.eWallet) {
                        setForm(f => ({ ...f, paymentMethod: data.paymentMethods.eWalletName || 'E-Wallet / Cash' }));
                    }
                }
            })
            .catch(console.error);
    }, []);

    if (!mounted) return null;
    if (items.length === 0) {
        return (
            <div style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('checkout.emptyCart')}</h1>
                <button className="btn-primary" onClick={() => router.push('/shop')} style={{ marginTop: '2rem', padding: '16px 32px', fontSize: '1.2rem', borderRadius: '8px' }}>{t('checkout.continueShopping')}</button>
            </div>
        );
    }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cityRate = shippingRates.find(r => r.city.toLowerCase() === form.city.toLowerCase());
    const shippingCost = cityRate ? cityRate.cost : 0;
    const total = subtotal - (subtotal * discount / 100) + shippingCost;

    const handleApplyCoupon = async () => {
        try {
            const res = await fetch(`https://axis-backend-2.onrender.com/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            if (res.ok) {
                const data = await res.json();
                setDiscount(data.percentage);
                alert(`${t('checkout.couponApplied')}: ${data.percentage}% ${t('checkout.off')}`);
            } else {
                alert(t('checkout.invalidCoupon'));
                setDiscount(0);
            }
        } catch {
            alert(t('error.generic'));
        }
    };

    const nextStep = () => {
        if (!form.customerName || !form.email || !form.phone || !form.city || !form.address) {
            alert(t('checkout.fillRequired'));
            return;
        }
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (form.paymentMethod !== 'Cash on Delivery') {
            if (!form.vodafoneCashNumber) {
                alert(t('checkout.enterWalletNumber'));
                return;
            }
        }

        setIsProcessing(true);
        if (form.paymentMethod !== 'Cash on Delivery') {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const orderData = {
            ...form,
            items: items.map(i => ({ product: i.id, name: i.name, price: i.price, quantity: i.quantity, size: i.size, image: i.image, color: i.color })),
            subtotal,
            shippingCost,
            total,
            discountApplied: subtotal * discount / 100
        };

        try {
            const res = await fetch(`https://axis-backend-2.onrender.com/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (res.ok) {
                const createdOrder = await res.json();
                clearCart();
                const methodParam = encodeURIComponent(orderData.paymentMethod);
                const amountParam = orderData.total.toFixed(0);
                const walletParam = encodeURIComponent(paymentSettings.eWalletNumber || '01000000000');
                router.push(`/checkout/success?id=${createdOrder._id}&amount=${amountParam}&method=${methodParam}&walletNumber=${walletParam}`);
            } else {
                alert(t('checkout.orderFailed'));
                setIsProcessing(false);
            }
        } catch {
            alert(t('checkout.networkError'));
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ padding: '8rem 2rem 4rem', maxWidth: 1400, margin: '0 auto', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>

            {/* Form Section */}
            <div style={{ flex: '1 1 600px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '-1px' }}>{t('checkout.title')}</h1>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-color)', opacity: step === 1 ? 1 : 0.4 }}>{t('checkout.step1')}</span>
                    <span style={{ fontWeight: 800, opacity: 0.3 }}>{'>'}</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent-color)', opacity: step === 2 ? 1 : 0.4 }}>{t('checkout.step2')}</span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {step === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.fullName')} {t('checkout.required')}</label>
                                <input required className="input" type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.email')} {t('checkout.required')}</label>
                                <input required className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.phone')} {t('checkout.required')}</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0', backgroundColor: 'var(--secondary-color)', overflow: 'hidden' }}>
                                    <span style={{ fontWeight: 800, padding: '16px 1rem', borderRight: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--accent-color)', opacity: 0.8 }}>+20</span>
                                    <input required type="tel" className="input" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', width: '100%', padding: '16px' }} value={form.phone.replace(/^\+?20\s*/, '')} onChange={e => setForm({ ...form, phone: '+20 ' + e.target.value.replace(/^\+?20\s*/, '') })} placeholder="10 123 456 78" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.governorate')} {t('checkout.required')}</label>
                                <select required className="select" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                                    <option value="" disabled>{t('checkout.selectArea')}</option>
                                    {shippingRates.map((rate, idx) => (
                                        <option key={idx} value={rate.city}>{rate.city} - {rate.cost} ج.م</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.fullAddress')} {t('checkout.required')}</label>
                                <input required className="input" type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Street Name, Building 4, Apt 12" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.notes')}</label>
                                <textarea className="input" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('checkout.notesPlaceholder')}></textarea>
                            </div>

                            <button type="button" onClick={nextStep} className="btn-primary" style={{ padding: '20px', fontSize: '1.2rem', marginTop: '1rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
                                {t('checkout.continueToPayment')}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '12px' }}>
                                <label style={{ display: 'block', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '1.2rem', color: 'var(--accent-color)' }}>
                                    {t('checkout.paymentMethod')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    className="select"
                                    style={{ padding: '18px', fontSize: '1.3rem', fontWeight: 700, borderRadius: '8px', border: '2px solid var(--accent-color)', width: '100%', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    value={form.paymentMethod}
                                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                                >
                                    {paymentSettings.cashOnDelivery !== false && <option value="Cash on Delivery">{t('checkout.cashOnDelivery')}</option>}
                                    {paymentSettings.eWallet !== false && <option value={paymentSettings.eWalletName || 'E-Wallet / Cash'}>{paymentSettings.eWalletName || 'E-Wallet / Cash'}</option>}
                                </select>
                            </div>
                            {form.paymentMethod !== 'Cash on Delivery' && paymentSettings.eWallet !== false && (
                                <div style={{ marginTop: '1.5rem', padding: 'clamp(1.5rem, 4vw, 2.5rem)', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', direction: 'rtl' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.2rem' }}>
                                        <span style={{ fontSize: '1.8rem' }}>💳</span>
                                        <h4 style={{ color: '#0f172a', margin: 0, fontWeight: 900, fontSize: 'clamp(1.2rem, 4vw, 1.4rem)' }}>تعليمات الدفع بالمحفظة الإلكترونية</h4>
                                    </div>

                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                                            <div style={{ backgroundColor: '#0f172a', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }}>١</div>
                                            <p style={{ fontSize: '1.1rem', color: '#334155', margin: 0, fontWeight: 700, lineHeight: 1.6 }}>
                                                قم بتحويل إجمالي الطلب <strong style={{ color: '#ef4444', fontSize: '1.2rem', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '8px', display: 'inline-block' }}>{total.toFixed(0)} ج.م</strong> إلى الرقم التالي:
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginRight: 'clamp(0rem, 3vw, 3rem)' }}>
                                            <span style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: '#0f172a', letterSpacing: '2px', direction: 'ltr' }}>{paymentSettings.eWalletNumber || '01000000000'}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(paymentSettings.eWalletNumber || '01000000000');
                                                    const btn = e.currentTarget;
                                                    const originalText = btn.innerHTML;
                                                    btn.innerHTML = '<span style="display:flex;align-items:center;gap:6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> تم النسخ بنجاح</span>';
                                                    btn.style.backgroundColor = '#10b981';
                                                    setTimeout(() => {
                                                        btn.innerHTML = originalText;
                                                        btn.style.backgroundColor = '#0f172a';
                                                    }, 2000);
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s', width: 'max-content' }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                نسخ الرقم
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2.5rem' }}>
                                        <div style={{ backgroundColor: '#25D366', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}>٢</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '1.1rem', color: '#334155', margin: '0 0 1rem 0', fontWeight: 700, lineHeight: 1.6 }}>أرسل صورة إيصال التحويل عبر واتساب لتأكيد الدفع سريعاً.</p>
                                            <a href={`https://wa.me/${(paymentSettings.eWalletNumber || '').startsWith('0') ? '2' + paymentSettings.eWalletNumber : paymentSettings.eWalletNumber}?text=${encodeURIComponent(`مرحباً أكسيس، قمت بتحويل مبلغ ${total.toFixed(0)} ج.م عبر المحفظة. طلب رقم: لم يتم الإصدار بعد ، وهذا إيصال التحويل الخاص بي:`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: 800, fontSize: '1.1rem', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 16px rgba(37,211,102,0.25)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                                إرسال الإيصال عبر واتساب
                                            </a>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                                        <div style={{ backgroundColor: '#ef4444', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>٣</div>
                                        <div style={{ flex: 1, width: '100%' }}>
                                            <p style={{ fontSize: '1.1rem', color: '#991b1b', margin: '0 0 1rem 0', fontWeight: 800 }}>أدخل رقم المحفظة الذي قمت بالتحويل <strong style={{ textDecoration: 'underline' }}>منه</strong>:</p>
                                            <input required className="input" type="tel" placeholder="مثال: 01012345678" value={form.vodafoneCashNumber} onChange={e => setForm({ ...form, vodafoneCashNumber: e.target.value })} style={{ direction: 'ltr', textAlign: 'left', border: '2px solid #fca5a5', backgroundColor: '#fff', padding: '16px', fontSize: '1.2rem', borderRadius: '8px', width: '100%', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#ef4444'} onBlur={e => e.currentTarget.style.borderColor = '#fca5a5'} />
                                            <p style={{ fontSize: '0.9rem', color: '#b91c1c', margin: '1rem 0 0 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                بمجرد التأكد، سيتم معالجة شحنتك فوراً.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={prevStep} className="btn-secondary" style={{ padding: '20px', fontSize: '1.1rem', borderRadius: '8px' }}>
                                    {t('checkout.back')}
                                </button>
                                <button type="submit" disabled={isProcessing} className="btn-primary" style={{ padding: '20px', fontSize: '1.2rem', borderRadius: '8px', opacity: isProcessing ? 0.7 : 1 }}>
                                    {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Summary Section */}
            <div style={{ flex: '1 1 400px', backgroundColor: 'var(--secondary-color)', padding: 'clamp(1.5rem, 5vw, 3rem)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', borderBottom: '2px solid var(--accent-color)', paddingBottom: '1rem', color: 'var(--accent-color)' }}>{t('checkout.orderSummary')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    {items.map(item => (
                        <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '150px' }}>
                                <img src={item.image || 'https://via.placeholder.com/60x80?text=x'} alt={item.name} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ overflow: 'hidden' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{item.name}</h4>
                                    <p style={{ color: 'var(--accent-color)', opacity: 0.7, fontSize: '0.85rem', fontWeight: 500 }}>
                                        {t('cart.size')}: {item.size} {item.color && `| Color: ${item.color}`} | {t('checkout.qty')}: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>{(item.price * item.quantity).toFixed(0)} ج.م</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                    <input className="input" placeholder={t('checkout.couponCode')} value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ textTransform: 'uppercase' }} />
                    <button className="btn-secondary" onClick={handleApplyCoupon} style={{ padding: '0 2rem', borderRadius: '8px' }}>{t('checkout.apply')}</button>
                </div>

                <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--accent-color)', opacity: 0.7, fontWeight: 600 }}>{t('checkout.subtotal')}</span>
                        <span style={{ fontWeight: 700 }}>{subtotal.toFixed(0)} ج.م</span>
                    </div>
                    {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                            <span style={{ fontWeight: 600 }}>{t('checkout.discount')} ({discount}%)</span>
                            <span style={{ fontWeight: 700 }}>-{(subtotal * discount / 100).toFixed(0)} ج.م</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--accent-color)', opacity: 0.7, fontWeight: 600 }}>{t('checkout.shippingCost')}</span>
                        <span style={{ fontWeight: 700 }}>{shippingCost.toFixed(0)} ج.م</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '2px solid var(--accent-color)', paddingTop: '1.5rem', fontSize: '1.8rem', fontWeight: 800 }}>
                        <span>{t('checkout.total')}</span>
                        <span>{total.toFixed(0)} ج.م</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
