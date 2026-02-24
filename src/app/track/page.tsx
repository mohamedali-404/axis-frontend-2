'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams?.get('id') || '');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orderId && phone) {
            handleTrack();
        }
    }, []);

    const handleTrack = async (e?: any) => {
        if (e) e.preventDefault();
        if (!orderId || !phone) {
            setError('Please enter both Order ID and Phone Number.');
            return;
        }
        setError('');
        setOrder(null);
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders/track`, {
                orderId, phone
            });
            setOrder(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to track order. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status: string) => {
        if (status === 'Pending') return 1;
        if (status === 'Shipped') return 2;
        if (status === 'Delivered') return 3;
        return 1;
    };

    return (
        <div style={{ maxWidth: 700, width: '100%', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center', color: 'var(--accent-color)' }}>Track Your Order</h1>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: 0.7, fontWeight: 500 }}>Enter your Order ID and Phone Number to check the status of your delivery.</p>

            {orderId && !order && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800 }}>Please save your Order ID!</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>You will need this ID to track your order later. Enter your phone number below to view it now.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Order ID</label>
                    <input required className="input" placeholder="e.g. 64abc123..." value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0', backgroundColor: 'var(--secondary-color)', overflow: 'hidden' }}>
                        <span style={{ fontWeight: 800, padding: '16px 1rem', borderRight: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--accent-color)', opacity: 0.8 }}>+20</span>
                        <input required type="tel" className="input" placeholder="10 123 456 78" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', width: '100%', padding: '16px' }} value={phone.replace(/^\+?20\s*/, '')} onChange={e => setPhone('+20 ' + e.target.value.replace(/^\+?20\s*/, ''))} />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '8px', opacity: loading ? 0.7 : 1, marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Searching...' : 'Track Order'}
                </button>
                {error && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 600, marginTop: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</p>}
            </form>

            {order && (
                <div style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '3rem', borderTop: '2px dashed var(--border-color)', paddingTop: '3rem' }}>

                    {/* Status Timeline */}
                    <div style={{ marginBottom: '3rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '4px', backgroundColor: 'var(--border-color)', zIndex: 1 }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--accent-color)', width: getStatusStep(order.status) === 1 ? '0%' : getStatusStep(order.status) === 2 ? '50%' : '100%', transition: 'width 0.5s ease-in-out' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                            {[
                                { step: 1, label: 'Pending', icon: '📦' },
                                { step: 2, label: 'Shipped', icon: '🚚' },
                                { step: 3, label: 'Delivered', icon: '✅' }
                            ].map((s) => {
                                const isActive = getStatusStep(order.status) >= s.step;
                                return (
                                    <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                            backgroundColor: isActive ? 'var(--accent-color)' : 'rgb(var(--background-start-rgb))',
                                            color: isActive ? 'var(--accent-foreground)' : 'var(--accent-color)',
                                            border: `2px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                            transition: 'all 0.3s ease',
                                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                        }}>
                                            {s.icon}
                                        </div>
                                        <span style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.85rem', color: isActive ? 'inherit' : 'var(--border-color)' }}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '2.5rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        {order.status === 'Pending' && (
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--accent-color)', opacity: 0.9 }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
                                Your order is currently in the <strong style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</strong> stage. We are preparing it for you.
                            </p>
                        )}
                        {order.status === 'Shipped' && (
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, color: '#0ea5e9', opacity: 0.9 }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🚚</span>
                                Your order has been <strong style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipped</strong> and is on its way to you!
                            </p>
                        )}
                        {order.status === 'Delivered' && (
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, color: '#10b981', opacity: 0.9 }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
                                Congratulations! Your order has been <strong style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivered</strong>.<br />Thank you for shopping with us, and we hope to see you again soon.
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Order Details</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Customer</span> <span>{order.customerName}</span></p>
                        <p style={{ margin: 0, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Address</span> <span>{order.city}</span></p>
                        <p style={{ margin: 0, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Payment</span> <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800 }}>{order.paymentMethod}</span></p>
                        <p style={{ margin: 0, fontWeight: 800, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                            <span>Total Amount</span> <span style={{ color: '#10b981', fontSize: '1.1rem' }}>${order.total.toFixed(2)}</span>
                        </p>
                    </div>

                    <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>Items</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
                                <img src={item.image} alt={item.name} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 0.3rem', fontWeight: 800, fontSize: '1.1rem' }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, fontWeight: 600 }}>Size: <span style={{ border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>{item.size}</span> | Qty: {item.quantity}</p>
                                </div>
                                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrackOrder() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 2rem 4rem', backgroundColor: 'var(--secondary-color)' }}>
            <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center', fontWeight: 'bold' }}>Loading tracking data...</div>}>
                <TrackOrderContent />
            </Suspense>
        </div>
    );
}
