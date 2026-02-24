'use client';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
    const { toggleCart, items } = useCartStore();
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();

    useEffect(() => { setMounted(true); }, []);

    if (!mounted || pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div
            onClick={toggleCart}
            style={{
                position: 'fixed',
                bottom: 'clamp(1rem, 4vw, 2rem)',
                right: 'clamp(1rem, 4vw, 2rem)',
                backgroundColor: 'var(--accent-color)',
                color: 'var(--accent-foreground)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                zIndex: 90,
                transition: 'transform 0.2s',
            }}
            className="hover-scale"
        >
            <ShoppingBag size={28} />
            {totalItems > 0 && (
                <span style={{
                    position: 'absolute', top: -5, right: -5, backgroundColor: '#e11d48', color: '#fff',
                    fontSize: '0.8rem', fontWeight: 800, width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    {totalItems}
                </span>
            )}
        </div>
    );
}
