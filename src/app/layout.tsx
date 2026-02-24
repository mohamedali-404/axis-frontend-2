import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import FloatingCart from '@/components/FloatingCart';
import HideOnAdmin from '@/components/HideOnAdmin';

async function getSettings() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export const metadata = {
    title: 'AXIS | Modern Sportswear',
    description: 'Minimal design. Maximum performance. Premium gym and sportswear.',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettings();

    // Helper to convert hex to rgb string for the variables
    function hexToRgb(hex: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    }

    // Helper to determine if color is dark
    function isDarkColor(hex: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return false;
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        return luma < 128;
    }

    const bgColor = settings?.themeSettings?.backgroundColor || '#ffffff';
    const isDarkBg = isDarkColor(bgColor);

    const themeColors = settings?.themeSettings ? {
        '--accent-color': settings.themeSettings.accentColor || '#000000',
        '--accent-foreground': settings.themeSettings.backgroundColor || '#ffffff',
        '--background-start-rgb': hexToRgb(bgColor),
        '--background-end-rgb': hexToRgb(bgColor),
        '--foreground-rgb': isDarkBg ? '255, 255, 255' : '0, 0, 0',
        '--secondary-color': settings.themeSettings.secondaryColor || '#f7f7f7',
    } as React.CSSProperties : {} as React.CSSProperties;

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content={settings?.themeSettings?.accentColor || '#000000'} />
            </head>
            <body style={themeColors} suppressHydrationWarning>
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 200px)' }}>{children}</main>
                <HideOnAdmin>
                    <Footer />
                </HideOnAdmin>
                <FloatingCart />
                <CartDrawer />
            </body>
        </html>
    );
}
