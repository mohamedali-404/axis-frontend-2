'use client';
import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CartDrawer() {
    const { isOpen, toggleCart, items, updateQuantity, removeItem } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const { t, isRTL } = useLanguage();

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <>
            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(4px)' }} onClick={toggleCart} />
            )}
            <div style={{
                position: 'fixed', top: 0, [isRTL ? 'left' : 'right']: 0, bottom: 0, width: '100%', maxWidth: 450,
                backgroundColor: 'rgb(var(--background-start-rgb))', color: 'var(--accent-color)', zIndex: 100,
                transform: isOpen ? 'translateX(0)' : (isRTL ? 'translateX(-100%)' : 'translateX(100%)'),
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column',
                boxShadow: isRTL ? '8px 0 30px rgba(0,0,0,0.1)' : '-8px 0 30px rgba(0,0,0,0.1)',
                direction: isRTL ? 'rtl' : 'ltr',
            }}>
                <div style={{ padding: 'clamp(1.5rem, 4vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>{t('cart.title')}</h2>
                    <X size={28} cursor="pointer" onClick={toggleCart} className="hover-opacity" style={{ flexShrink: 0 }} />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ color: 'var(--accent-color)', opacity: 0.6, fontSize: '1.1rem', fontWeight: 500 }}>
                                {t('cart.empty')}
                            </div>
                            <Link href="/shop" onClick={toggleCart} style={{ textDecoration: 'none' }}>
                                <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {t('cart.continueShopping')}
                                </button>
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: 90, height: 110, backgroundColor: 'var(--secondary-color)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={item.image || 'https://via.placeholder.com/90x110?text=No+Image'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 700, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{item.name}</h3>
                                        <Trash2 size={20} color="#ef4444" cursor="pointer" onClick={() => removeItem(item.id, item.size)} style={{ opacity: 0.8, flexShrink: 0 }} className="hover-opacity" />
                                    </div>
                                    <p style={{ color: 'var(--accent-color)', opacity: 0.6, marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('cart.size')}: {item.size}</p>
                                    <p style={{ fontWeight: 800, marginTop: '0.5rem', fontSize: '1.1rem' }}>${item.price.toFixed(2)}</p>

                                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', border: '2px solid var(--border-color)', width: 'fit-content', borderRadius: '8px', overflow: 'hidden' }}>
                                        <button style={{ padding: '0.4rem 0.6rem', background: 'var(--secondary-color)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="hover-opacity"><Minus size={16} /></button>
                                        <span style={{ padding: '0 1rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button style={{ padding: '0.4rem 0.6rem', background: 'var(--secondary-color)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="hover-opacity"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div style={{ padding: '2rem', borderTop: '2px dashed var(--border-color)', backgroundColor: 'var(--secondary-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 800 }}>
                            <span>{t('cart.subtotal')}</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <Link href="/checkout" onClick={toggleCart} style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                            <button className="btn-primary" style={{ width: '100%', height: '60px', fontSize: '1.1rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {t('cart.checkout')}
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
