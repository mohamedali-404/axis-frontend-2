import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--background-start-rgb)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--accent-color)' }} />
                <p style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-color)', fontSize: '0.9rem' }}>
                    Loading...
                </p>
                <style>{`
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
