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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`, {
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
    };

    const prevStep = () => { setStep(1); };

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
            items: items.map(i => ({ product: i.id, name: i.name, price: i.price, quantity: i.quantity, size: i.size, image: i.image })),
            subtotal,
            shippingCost,
            total,
            discountApplied: subtotal * discount / 100
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (res.ok) {
                const createdOrder = await res.json();
                clearCart();
                router.push(`/checkout/success?id=${createdOrder._id}`);
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
                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--accent-color)' }}>{t('checkout.paymentMethod')} {t('checkout.required')}</label>
                                <select className="select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                                    {paymentSettings.cashOnDelivery !== false && <option value="Cash on Delivery">{t('checkout.cashOnDelivery')}</option>}
                                    {paymentSettings.eWallet !== false && <option value={paymentSettings.eWalletName || 'E-Wallet / Cash'}>{paymentSettings.eWalletName || 'E-Wallet / Cash'}</option>}
                                </select>
                            </div>
                            {form.paymentMethod !== 'Cash on Delivery' && paymentSettings.eWallet !== false && (
                                <div style={{ marginTop: '1rem', padding: '1.2rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px' }}>
                                    <h4 style={{ color: '#4338ca', marginBottom: '1rem', fontWeight: 800, direction: 'rtl', textAlign: 'right' }}>📲 تعليمات الدفع بالمحفظة الإلكترونية</h4>
                                    <p style={{ fontSize: '0.95rem', color: '#4338ca', marginBottom: '0.5rem', fontWeight: 700, direction: 'rtl', textAlign: 'right' }}>
                                        ١. برجاء تحويل إجمالي المبلغ <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>{total.toFixed(0)} ج.م</strong> على الرقم التالي:
                                    </p>
                                    <div style={{ backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-block', fontWeight: 800, fontSize: '1.2rem', color: '#ef4444', marginBottom: '0.8rem', border: '2px dashed #c7d2fe' }}>
                                        {paymentSettings.eWalletNumber || '01000000000'}
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#4338ca', marginBottom: '1rem', fontWeight: 600, direction: 'rtl', textAlign: 'right' }}>
                                        ثم أرسل سكرين شوت للتحويل على نفس الرقم واتس اب.
                                    </p>
                                    <p style={{ fontSize: '0.95rem', color: '#4338ca', marginBottom: '1rem', fontWeight: 700, direction: 'rtl', textAlign: 'right' }}>
                                        ٢. أدخل رقم المحفظة اللي حولت <strong>منه</strong> للتأكيد:
                                    </p>
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#4338ca', direction: 'rtl', textAlign: 'right' }}>رقم تحويلك *</label>
                                    <input required className="input" type="tel" placeholder="010XXXXXXXX" value={form.vodafoneCashNumber} onChange={e => setForm({ ...form, vodafoneCashNumber: e.target.value })} style={{ direction: 'ltr' }} />
                                    <p style={{ fontSize: '0.85rem', color: '#4338ca', marginTop: '0.5rem', fontWeight: 600, direction: 'rtl', textAlign: 'right' }}>✅ سيتم تأكيد طلبك فور التحقق من التحويل.</p>
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
                                    <p style={{ color: 'var(--accent-color)', opacity: 0.7, fontSize: '0.85rem', fontWeight: 500 }}>{t('cart.size')}: {item.size} | {t('checkout.qty')}: {item.quantity}</p>
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
