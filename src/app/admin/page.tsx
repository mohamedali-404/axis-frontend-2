'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Bell } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getSocket } from '@/lib/socket';

export default function AdminDashboard() {
    const { t, lang, setLang } = useLanguage();
    const [token, setToken] = useState('');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [securityForm, setSecurityForm] = useState({ currentUsername: '', currentPassword: '', newUsername: '', newPassword: '' });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    // Products
    const [products, setProducts] = useState<any[]>([]);
    const [productForm, setProductForm] = useState({ name: '', price: '', discountPrice: '', stock: '', descriptionEn: '', descriptionAr: '', sizes: 'S, M, L, XL', imageObjs: [] as File[] });
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    // Orders
    const [orders, setOrders] = useState<any[]>([]);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    // Coupons
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponForm, setCouponForm] = useState({ code: '', percentage: '', expirationDate: '' });

    // Settings
    const [settings, setSettings] = useState<any>(null);
    const [logoObj, setLogoObj] = useState<any>(null);
    const [bannerObj, setBannerObj] = useState<any>(null);
    const [collectionImageObjs, setCollectionImageObjs] = useState<any[]>([null, null, null]);

    useEffect(() => {
        const savedToken = localStorage.getItem('axis_token');
        if (savedToken) setToken(savedToken);
    }, []);

    // Fetch data when tab or token changes
    useEffect(() => {
        if (!token) return;
        fetchData();
    }, [token, activeTab]);

    // Socket.IO: register listeners ONCE per token - prevents listener accumulation
    useEffect(() => {
        if (!token) return;

        const socket = getSocket();

        const onNewOrder = (newOrder: any) => {
            setOrders(prev => [newOrder, ...prev]);
            setPendingOrdersCount(prev => prev + 1);
        };

        const onOrderUpdated = (updatedOrder: any) => {
            setOrders(prev => {
                const updated = prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                setPendingOrdersCount(updated.filter(o => o.status === 'Pending').length);
                return updated;
            });
        };

        const onOrderDeleted = ({ id }: { id: string }) => {
            setOrders(prev => {
                const filtered = prev.filter(o => o._id !== id);
                setPendingOrdersCount(filtered.filter(o => o.status === 'Pending').length);
                return filtered;
            });
        };

        const onSettingsUpdated = (newSettings: any) => {
            setSettings(newSettings);
        };

        const onProductCreated = (product: any) => {
            setProducts(prev => [product, ...prev]);
        };

        const onProductUpdated = (product: any) => {
            setProducts(prev => prev.map(p => p._id === product._id ? product : p));
        };

        const onProductDeleted = ({ id }: { id: string }) => {
            setProducts(prev => prev.filter(p => p._id !== id));
        };

        socket.on('new_order', onNewOrder);
        socket.on('order_updated', onOrderUpdated);
        socket.on('order_deleted', onOrderDeleted);
        socket.on('settings_updated', onSettingsUpdated);
        socket.on('product_created', onProductCreated);
        socket.on('product_updated', onProductUpdated);
        socket.on('product_deleted', onProductDeleted);

        return () => {
            socket.off('new_order', onNewOrder);
            socket.off('order_updated', onOrderUpdated);
            socket.off('order_deleted', onOrderDeleted);
            socket.off('settings_updated', onSettingsUpdated);
            socket.off('product_created', onProductCreated);
            socket.off('product_updated', onProductUpdated);
            socket.off('product_deleted', onProductDeleted);
        };
    }, [token]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data: countData } = await axios.get(`https://axis-backend-2.onrender.com/api/orders/pending/count`, config);
            setPendingOrdersCount(countData.count);

            if (activeTab === 'products') {
                const { data } = await axios.get(`https://axis-backend-2.onrender.com/api/products/admin/all`, config);
                setProducts(data);
            } else if (activeTab === 'orders') {
                const { data } = await axios.get(`https://axis-backend-2.onrender.com/api/orders`, config);
                setOrders(data);
            } else if (activeTab === 'coupons') {
                const { data } = await axios.get(`https://axis-backend-2.onrender.com/api/coupons`, config);
                setCoupons(data);
            } else if (activeTab === 'settings') {
                const { data } = await axios.get(`https://axis-backend-2.onrender.com/api/settings`);
                // Ensure announcementText exists in state (may be missing from older DB documents)
                setSettings({ announcementText: '', ...data });
            }
        } catch (err) {
            console.error(err);
            if ((err as any).response?.status === 401) {
                setToken('');
                localStorage.removeItem('axis_token');
            }
        }
    };

    const handleLogin = async (e: any) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`https://axis-backend-2.onrender.com/api/auth/login`, loginForm);
            setToken(data.token);
            localStorage.setItem('axis_token', data.token);
        } catch {
            alert(t('admin.loginFailed'));
        }
    };


    const handleSecurityUpdate = async (e: any) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://axis-backend-2.onrender.com/api/auth/change-password`, securityForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setSecurityForm({ currentUsername: '', currentPassword: '', newUsername: '', newPassword: '' });
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error occurred while updating security credentials');
            if (e.response?.status === 401) {
                setToken('');
                localStorage.removeItem('axis_token');
            }
        }
    };

    const handleSaveProduct = async (e: any) => {
        e.preventDefault();
        try {
            let imageUrls: string[] = [];
            if (productForm.imageObjs && productForm.imageObjs.length > 0) {
                for (const file of productForm.imageObjs) {
                    const formData = new FormData();
                    formData.append('image', file);
                    const uploadRes = await axios.post(`https://axis-backend-2.onrender.com/api/upload`, formData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    imageUrls.push(uploadRes.data.url);
                }
            }

            const pData: any = {
                name: productForm.name,
                price: Number(productForm.price),
                discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
                stock: Number(productForm.stock),
                descriptionEn: productForm.descriptionEn,
                descriptionAr: productForm.descriptionAr,
                sizes: productForm.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
            };

            if (imageUrls.length > 0) pData.images = imageUrls;

            if (editingProductId) {
                await axios.put(`https://axis-backend-2.onrender.com/api/products/${editingProductId}`, pData, { headers: { Authorization: `Bearer ${token}` } });
                alert(t('admin.productUpdated'));
            } else {
                await axios.post(`https://axis-backend-2.onrender.com/api/products`, pData, { headers: { Authorization: `Bearer ${token}` } });
                alert(t('admin.productAdded'));
            }

            fetchData();
            setEditingProductId(null);
            setProductForm({ name: '', price: '', discountPrice: '', stock: '', descriptionEn: '', descriptionAr: '', sizes: 'S, M, L, XL', imageObjs: [] as File[] });
        } catch (e: any) {
            console.error('Error saving product:', e.response?.data || e.message || e);
            alert(`Error saving product: ${e.response?.data?.message || 'Unknown network error'}`);
        }
    };

    const handleEditBtn = (p: any) => {
        setEditingProductId(p._id);
        setProductForm({
            name: p.name || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            stock: p.stock || '',
            descriptionEn: p.descriptionEn || '',
            descriptionAr: p.descriptionAr || '',
            sizes: p.sizes ? p.sizes.join(', ') : 'S, M, L, XL',
            imageObjs: [] as File[]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteProduct = async (id: string) => {
        try {
            await axios.delete(`https://axis-backend-2.onrender.com/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error deleting'); }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            await axios.put(`https://axis-backend-2.onrender.com/api/orders/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error updating order'); }
    };

    const deleteOrder = async (id: string) => {
        if (!window.confirm(t('admin.confirmDelete'))) return;
        try {
            await axios.delete(`https://axis-backend-2.onrender.com/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (e: any) {
            console.error('Delete error:', e);
            alert(`Error deleting order: ${e.response?.data?.message || e.message}`);
        }
    };

    const createCoupon = async (e: any) => {
        e.preventDefault();
        try {
            await axios.post(`https://axis-backend-2.onrender.com/api/coupons`, {
                ...couponForm, percentage: Number(couponForm.percentage)
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            alert(t('admin.couponCreated'));
        } catch { alert(t('error.generic')); }
    };

    const deleteCoupon = async (id: string) => {
        try {
            await axios.delete(`https://axis-backend-2.onrender.com/api/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error deleting coupon'); }
    };

    const updateSettings = async (e: any) => {
        e.preventDefault();
        try {
            let updatePayload = { ...settings };
            if (updatePayload._id) delete updatePayload._id;
            if (updatePayload.__v !== undefined) delete updatePayload.__v;

            if (logoObj) {
                const formData = new FormData();
                formData.append('image', logoObj);
                const uploadRes = await axios.post(`https://axis-backend-2.onrender.com/api/upload`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                updatePayload.brandLogo = uploadRes.data.url;
            }
            if (bannerObj) {
                const formData = new FormData();
                formData.append('image', bannerObj);
                const uploadRes = await axios.post(`https://axis-backend-2.onrender.com/api/upload`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                updatePayload.heroBanner = uploadRes.data.url;
            }

            const newCollectionCards = [...(updatePayload.collectionCards || [])];
            for (let i = 0; i < 3; i++) {
                if (!newCollectionCards[i]) newCollectionCards[i] = { title: '', link: '/shop', image: '' };
                if (collectionImageObjs[i]) {
                    const formData = new FormData();
                    formData.append('image', collectionImageObjs[i]);
                    const uploadRes = await axios.post(`https://axis-backend-2.onrender.com/api/upload`, formData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    newCollectionCards[i].image = uploadRes.data.url;
                }
            }
            updatePayload.collectionCards = newCollectionCards;

            const res = await axios.put(`https://axis-backend-2.onrender.com/api/settings`, updatePayload, { headers: { Authorization: `Bearer ${token}` } });
            setSettings(res.data);
            setCollectionImageObjs([null, null, null]);
            alert(t('admin.settingsUpdated'));
        } catch (e: any) {
            console.error('Error updating settings:', e.response?.data || e.message || e);
            alert(`Error updating settings: ${e.response?.data?.message || 'Unknown network error'}`);
        }
    };

    if (!token) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <form onSubmit={handleLogin} style={{ padding: '3rem', backgroundColor: 'var(--secondary-color)', border: '1px solid var(--border-color)', width: '100%', maxWidth: 420, borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>

                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.5px' }}>{t('admin.title')}</h2>
                    <p style={{ textAlign: 'center', marginBottom: '2.5rem', opacity: 0.6, fontWeight: 500 }}>{t('admin.subtitle')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>{t('admin.username')}</label>
                            <input required className="input" placeholder="admin" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>{t('admin.password')}</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input required className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '8px' }}>{t('admin.signIn')}</button>
                </form>
            </div>
        );
    }

    const TABS = [
        { id: 'products', icon: '📦' },
        { id: 'orders', icon: '🛒' },
        { id: 'coupons', icon: '🎟️' },
        { id: 'settings', icon: '⚙️' },
    ];

    const SidebarContent = () => (
        <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '3px' }}>AXIS</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
            </div>
            <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                {TABS.map(({ id, icon }) => (
                    <button key={id} onClick={() => handleTabChange(id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', textAlign: 'left', backgroundColor: activeTab === id ? 'var(--accent-color)' : 'transparent', color: activeTab === id ? 'var(--accent-foreground)' : 'currentColor', border: 'none', cursor: 'pointer', fontWeight: 700, borderRadius: '10px', transition: 'all 0.2s', opacity: activeTab !== id ? 0.65 : 1, fontSize: '0.95rem', gap: '0.75rem', width: '100%' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                            <span>{t(`admin.${id}`)}</span>
                        </span>
                        {id === 'orders' && pendingOrdersCount > 0 && (
                            <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 800, minWidth: '22px', textAlign: 'center' }}>
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={() => { setToken(''); localStorage.removeItem('axis_token'); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem', width: '100%', textAlign: 'left', background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#ef4444', borderRadius: '10px', transition: 'all 0.2s', fontSize: '0.95rem' }}>
                    <span>🚪</span> {t('admin.logout')}
                </button>
            </div>
        </>
    );

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            <div className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
                <SidebarContent />
            </aside>

            {/* Mobile topbar */}
            <header className="admin-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: 'var(--secondary-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 40 }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        className="admin-hamburger"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', borderRadius: '8px' }}
                        aria-label="Open menu"
                    >
                        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--accent-color)', borderRadius: 2, transition: 'all 0.3s', transform: sidebarOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
                        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--accent-color)', borderRadius: 2, transition: 'all 0.3s', opacity: sidebarOpen ? 0 : 1 }} />
                        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--accent-color)', borderRadius: 2, transition: 'all 0.3s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', fontStyle: 'italic', letterSpacing: '3px', color: 'var(--accent-color)' }}>AXIS</div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {pendingOrdersCount > 0 && (
                        <div onClick={() => handleTabChange('orders')} style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <Bell size={22} color="var(--accent-color)" />
                            <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#e63946', color: '#fff', fontSize: '10px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 800 }}>
                                {pendingOrdersCount}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="admin-main">

                {/* Overview Stats — always visible */}
                <div className="admin-stats-grid animate-fadeIn">
                    <div className="admin-stat-card">
                        <span className="stat-icon">📦</span>
                        <span className="stat-value">{products.length || 0}</span>
                        <span className="stat-label">{t('admin.products')}</span>
                    </div>
                    <div className="admin-stat-card">
                        <span className="stat-icon">🛒</span>
                        <span className="stat-value">{orders.length || 0}</span>
                        <span className="stat-label">{t('admin.orders')}</span>
                    </div>
                    <div className="admin-stat-card" style={{ borderColor: pendingOrdersCount > 0 ? '#ef4444' : undefined }}>
                        <span className="stat-icon">🕒</span>
                        <span className="stat-value" style={{ color: pendingOrdersCount > 0 ? '#ef4444' : undefined }}>{pendingOrdersCount}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="admin-stat-card">
                        <span className="stat-icon">🎟️</span>
                        <span className="stat-value">{coupons.length || 0}</span>
                        <span className="stat-label">{t('admin.coupons')}</span>
                    </div>
                </div>

                {activeTab === 'products' && (
                    <div className="animate-fadeIn">
                        <h3 className="admin-section-title">📦 {t('admin.productsManagement')}</h3>
                        <div className="admin-section-card">
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{editingProductId ? t('admin.editProduct') : t('admin.addNewProduct')}</h4>
                            <form onSubmit={handleSaveProduct} className="admin-form-grid">
                                <div className="field-group">
                                    <label className="field-label">{t('admin.productName')}</label>
                                    <input required className="input" placeholder="e.g. Graphic T-Shirt" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">{t('admin.stock')}</label>
                                    <input required className="input" type="number" placeholder="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">{t('admin.price')}</label>
                                    <input required className="input" type="number" step="0.01" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">{t('admin.discountPrice')} <span style={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'none' }}>({t('admin.optional')})</span></label>
                                    <input className="input" type="number" step="0.01" placeholder="0.00" value={productForm.discountPrice} onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })} />
                                </div>
                                <div className="field-group full-width">
                                    <label className="field-label">{t('admin.descEn')}</label>
                                    <textarea required className="input" placeholder="Detailed product description in English..." rows={4} value={productForm.descriptionEn} onChange={e => setProductForm({ ...productForm, descriptionEn: e.target.value })}></textarea>
                                </div>
                                <div className="field-group full-width">
                                    <label className="field-label">{t('admin.descAr')}</label>
                                    <textarea required className="input" placeholder="وصف المنتج بالعربية..." rows={4} value={productForm.descriptionAr} onChange={e => setProductForm({ ...productForm, descriptionAr: e.target.value })} dir="rtl"></textarea>
                                </div>
                                <div className="field-group full-width">
                                    <label className="field-label">{t('admin.productImages')}</label>
                                    <input type="file" multiple accept="image/*" className="input" onChange={e => setProductForm({ ...productForm, imageObjs: Array.from(e.target.files || []) })} style={{ padding: '10px' }} />
                                    {editingProductId && <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '0.4rem', fontWeight: 600 }}>⚠️ {t('admin.keepExistingImages')}</p>}
                                </div>
                                <div className="field-group full-width">
                                    <label className="field-label">{t('admin.availableSizes')}</label>
                                    <input required className="input" placeholder="e.g. S, M, L, XL" value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} />
                                    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>{t('admin.sizesHint')}</p>
                                </div>
                                <div className="full-width" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: '1 1 200px' }}>{editingProductId ? t('admin.saveChanges') : t('admin.addProduct')}</button>
                                    {editingProductId && (
                                        <button type="button" onClick={() => { setEditingProductId(null); setProductForm({ name: '', price: '', discountPrice: '', stock: '', descriptionEn: '', descriptionAr: '', sizes: 'S, M, L, XL', imageObjs: [] as File[] }); }} className="btn-secondary" style={{ flex: '1 1 200px' }}>{t('admin.cancel')}</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Desktop table */}
                        <div style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            <table className="products-table" style={{ textAlign: 'left' }}>
                                <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '2px solid var(--border-color)' }}>{t('admin.name')}</th>
                                        <th style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '2px solid var(--border-color)' }}>{t('admin.price')}</th>
                                        <th style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '2px solid var(--border-color)' }}>{t('admin.stockLabel')}</th>
                                        <th style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '2px solid var(--border-color)' }}>{t('admin.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} className="table-row">
                                            <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{p.name}</td>
                                            <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>{p.price} ج.م</td>
                                            <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                                                <span className={p.stock > 0 ? 'badge badge-info' : 'badge badge-danger'}>
                                                    {p.stock > 0 ? `${p.stock} ${t('admin.inStock')}` : t('admin.outOfStock')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button onClick={() => handleEditBtn(p)} className="btn-edit">{t('admin.edit')}</button>
                                                    <button onClick={() => deleteProduct(p._id)} className="btn-danger">{t('admin.delete')}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile cards */}
                            <div className="products-cards" style={{ padding: '1rem' }}>
                                {products.map(p => (
                                    <div key={p._id} className="product-card-mobile">
                                        <img src={p.images?.[0] || 'https://via.placeholder.com/60'} alt={p.name} style={{ width: 56, height: 68, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.price} ج.م</span>
                                                <span className={p.stock > 0 ? 'badge badge-info' : 'badge badge-danger'} style={{ fontSize: '0.72rem' }}>
                                                    {p.stock > 0 ? `${p.stock} ${t('admin.inStock')}` : t('admin.outOfStock')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                                            <button onClick={() => handleEditBtn(p)} className="btn-edit" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{t('admin.edit')}</button>
                                            <button onClick={() => deleteProduct(p._id)} className="btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{t('admin.delete')}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fadeIn">
                        <h3 className="admin-section-title">🛒 {t('admin.ordersManagement')}</h3>
                        {orders.length === 0 ? (
                            <div className="admin-section-card" style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t('admin.noOrders')}</p>
                            </div>
                        ) : orders.map(order => (
                            <div key={order._id} style={{ border: '1px solid var(--border-color)', padding: 'clamp(1rem, 4vw, 2rem)', marginBottom: '1.5rem', borderRadius: '16px', backgroundColor: 'var(--secondary-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.3px', margin: 0 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h4>
                                        <p style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)', opacity: 0.7 }}>Placed at {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#10b981' }}>{order.total?.toFixed(0)} ج.م</span>
                                        <button onClick={() => deleteOrder(order._id)} className="hover-scale" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="order-detail-grid" style={{ marginBottom: '1.5rem', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '1.25rem', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
                                    <div>
                                        <h5 style={{ fontWeight: 800, marginBottom: '0.8rem', color: 'var(--accent-color)' }}>Customer Profile</h5>
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem' }}>Name: <span style={{ opacity: 0.8 }}>{order.customerName}</span></p>
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem' }}>Email: <span style={{ opacity: 0.8 }}>{order.email}</span></p>
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem' }}>Phone: <span style={{ opacity: 0.8 }}>{order.phone}</span></p>
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem' }}>Address: <span style={{ opacity: 0.8 }}>{order.address}, {order.city}</span></p>
                                        {order.notes && <p style={{ margin: '0.5rem 0', fontWeight: 600, fontStyle: 'italic', color: '#ff9800' }}>Note: {order.notes}</p>}
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, marginBottom: '0.8rem', color: 'var(--accent-color)' }}>Payment Context</h5>
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Method: <span style={{ padding: '4px 12px', backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{order.paymentMethod}</span>
                                        </p>
                                        {order.paymentMethod !== 'Cash on Delivery' && order.vodafoneCashNumber && (
                                            <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '1rem', color: '#4338ca' }}>
                                                Transfer No: <span style={{ opacity: 0.9 }}>{order.vodafoneCashNumber}</span>
                                            </p>
                                        )}
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Subtotal: <span style={{ opacity: 0.8 }}>{order.subtotal?.toFixed(0)} ج.م</span></p>
                                        {order.discountApplied > 0 && <p style={{ margin: '0.3rem 0', fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>Discount: -{order.discountApplied?.toFixed(0)} ج.م</p>}
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Shipping: <span style={{ opacity: 0.8 }}>{order.shippingCost?.toFixed(0)} ج.م</span></p>
                                    </div>
                                </div>

                                <h5 style={{ fontWeight: 800, marginBottom: '1.2rem', color: 'var(--accent-color)' }}>Ordered Items</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: 60, height: 70, objectFit: 'cover', borderRadius: '6px', backgroundColor: '#eee' }} />
                                                <div>
                                                    <p style={{ fontWeight: 800, margin: '0 0 0.3rem', fontSize: '1.1rem' }}>{item.name}</p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--accent-color)', opacity: 0.8, margin: 0, fontWeight: 600 }}>Size: <span style={{ border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{item.size}</span> | Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{(item.price * item.quantity).toFixed(0)} ج.م</p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '2px dashed var(--border-color)', paddingTop: '2rem' }}>
                                    <p style={{ margin: 0, fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Fulfillment Status:</p>
                                    <select value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)} className="select" style={{ width: 200, padding: '12px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', ...({ backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#e0f2fe' : '#fef3c7' } as any) }}>
                                        <option value="Pending">🕒 Pending</option>
                                        <option value="Shipped">🚚 Shipped</option>
                                        <option value="Delivered">✅ Delivered</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'coupons' && (
                    <div className="animate-fadeIn">
                        <h3 className="admin-section-title">🎟️ {t('admin.couponsManagement')}</h3>
                        <div className="admin-section-card">
                            <h4 className="admin-section-subtitle">{t('admin.createCoupon')}</h4>
                            <form onSubmit={createCoupon} className="coupon-form-grid">
                                <div className="field-group">
                                    <label className="field-label">{t('admin.couponCode')}</label>
                                    <input required className="input" placeholder="e.g. SUMMER20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">{t('admin.discountPercent')}</label>
                                    <input required className="input" type="number" min="1" max="100" placeholder="20" value={couponForm.percentage} onChange={e => setCouponForm({ ...couponForm, percentage: e.target.value })} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">{t('admin.expirationDate')}</label>
                                    <input required className="input" type="date" value={couponForm.expirationDate} onChange={e => setCouponForm({ ...couponForm, expirationDate: e.target.value })} />
                                </div>
                                <button className="btn-primary" type="submit">{t('admin.createCouponBtn')}</button>
                            </form>
                        </div>

                        <div style={{ backgroundColor: 'var(--secondary-color)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Code</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Discount</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Expires On</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(c => (
                                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: 800, letterSpacing: '1px', color: 'var(--accent-color)' }}>{c.code}</td>
                                            <td style={{ padding: '1rem 0', fontWeight: 600 }}>{c.percentage}% OFF</td>
                                            <td style={{ padding: '1rem 0', fontWeight: 500 }}>{new Date(c.expirationDate).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 0' }}>
                                                <button onClick={() => deleteCoupon(c._id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Revoke</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && settings && (
                    <div className="animate-fadeIn">
                        <h3 className="admin-section-title">⚙️ {t('admin.customization')}</h3>
                        <div className="admin-section-card">
                            <form onSubmit={updateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="settings-grid-2">
                                    <div>
                                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '1rem' }}>Brand Logo</label>
                                        <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                                            {settings.brandLogo ? <img src={settings.brandLogo} alt="Logo" style={{ height: 60, objectFit: 'contain', margin: '0 auto 1rem' }} /> : <div style={{ height: 60, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>NO LOGO</div>}
                                            <input type="file" className="input" onChange={e => setLogoObj(e.target.files?.[0])} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '1rem' }}>Hero Banner Background</label>
                                        <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                                            {settings.heroBanner ? <img src={settings.heroBanner} alt="Banner" style={{ height: 60, width: '100%', objectFit: 'cover', margin: '0 auto 1rem', borderRadius: '4px' }} /> : <div style={{ height: 60, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>NO BANNER</div>}
                                            <input type="file" className="input" onChange={e => setBannerObj(e.target.files?.[0])} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-grid-2">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hero Headline</label>
                                        <input className="input" value={settings.heroHeadline} onChange={e => setSettings({ ...settings, heroHeadline: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sub Headline</label>
                                        <input className="input" value={settings.subHeadline} onChange={e => setSettings({ ...settings, subHeadline: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">📢 Announcement Bar / شريط الإعلان</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Announcement Text (Scrolling Ticker)</label>
                                        <input className="input" placeholder="e.g. Free shipping on orders over $50 ✦ New arrivals every week" value={settings.announcementText || ''} onChange={e => setSettings({ ...settings, announcementText: e.target.value })} />
                                        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>This text will scroll across the top bar of your website. Use ✦ to separate messages.</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.globalTheme')}</h4>
                                    <div className="settings-grid-3">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Accent Color (Buttons, Texts)</label>
                                            <input type="color" className="input" style={{ padding: '4px', height: '40px' }} value={settings.themeSettings?.accentColor || '#000000'} onChange={e => setSettings({ ...settings, themeSettings: { ...settings.themeSettings, accentColor: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Main Background Color</label>
                                            <input type="color" className="input" style={{ padding: '4px', height: '40px' }} value={settings.themeSettings?.backgroundColor || '#ffffff'} onChange={e => setSettings({ ...settings, themeSettings: { ...settings.themeSettings, backgroundColor: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Secondary Element Color</label>
                                            <input type="color" className="input" style={{ padding: '4px', height: '40px' }} value={settings.themeSettings?.secondaryColor || '#f7f7f7'} onChange={e => setSettings({ ...settings, themeSettings: { ...settings.themeSettings, secondaryColor: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.collectionsBanner')}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Section Title</label>
                                        <input className="input" value={settings.collectionSectionTitle || ''} onChange={e => setSettings({ ...settings, collectionSectionTitle: e.target.value })} placeholder="e.g. Shop by Category" />
                                    </div>
                                    <div className="collection-cards-grid">
                                        {[0, 1, 2].map(idx => {
                                            const card = settings.collectionCards?.[idx] || { title: '', link: '/shop', image: '' };
                                            return (
                                                <div key={idx} style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {card.image ? <img src={card.image} alt={`Collection ${idx}`} style={{ height: 60, width: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>IMG {idx + 1}</div>}
                                                    <input type="file" className="input" onChange={e => {
                                                        const newObjs = [...collectionImageObjs];
                                                        newObjs[idx] = e.target.files?.[0] || null;
                                                        setCollectionImageObjs(newObjs);
                                                    }} style={{ padding: '4px', fontSize: '0.7rem' }} />
                                                    <input className="input" placeholder="Card Title" value={card.title || ''} onChange={e => {
                                                        const newCards = [...(settings.collectionCards || [{}, {}, {}])];
                                                        if (!newCards[idx]) newCards[idx] = {};
                                                        newCards[idx].title = e.target.value;
                                                        setSettings({ ...settings, collectionCards: newCards });
                                                    }} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                                    <input className="input" placeholder="Link e.g. /shop" value={card.link || ''} onChange={e => {
                                                        const newCards = [...(settings.collectionCards || [{}, {}, {}])];
                                                        if (!newCards[idx]) newCards[idx] = {};
                                                        newCards[idx].link = e.target.value;
                                                        setSettings({ ...settings, collectionCards: newCards });
                                                    }} style={{ padding: '8px', fontSize: '0.8rem' }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="settings-grid-2">
                                    <div className="field-group">
                                        <label className="field-label">{t('admin.socialSection')}</label>
                                        <input className="input" value={settings.socialSectionTitle || ''} onChange={e => setSettings({ ...settings, socialSectionTitle: e.target.value })} />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">{t('admin.socialText')}</label>
                                        <input className="input" value={settings.socialSectionText || ''} onChange={e => setSettings({ ...settings, socialSectionText: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.socialMedia')}</h4>
                                    <div className="settings-grid-3">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Facebook URL</label>
                                            <input className="input" placeholder="https://facebook.com/..." value={settings.socialLinks?.facebook || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instagram URL</label>
                                            <input className="input" placeholder="https://instagram.com/..." value={settings.socialLinks?.instagram || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>TikTok URL</label>
                                            <input className="input" placeholder="https://tiktok.com/@..." value={settings.socialLinks?.tiktok || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, tiktok: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.aboutPage')}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>About Us Text</label>
                                        <textarea className="input" rows={4} placeholder="We are AXIS..." value={settings.aboutText || ''} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} style={{ padding: '12px', resize: 'vertical' }} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.contactFooter')}</h4>
                                    <div className="settings-grid-3">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contact Email</label>
                                            <input className="input" placeholder="support@..." value={settings.contactInfo?.email || ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contact Phone</label>
                                            <input className="input" placeholder="+20 100..." value={settings.contactInfo?.phone || ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Store Address</label>
                                            <input className="input" placeholder="Cairo, Egypt" value={settings.contactInfo?.address || ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.paymentMethods')}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <input type="checkbox" id="cod" checked={settings.paymentMethods?.cashOnDelivery !== false} onChange={e => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, cashOnDelivery: e.target.checked } })} style={{ width: '20px', height: '20px' }} />
                                            <label htmlFor="cod" style={{ fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Enable Cash on Delivery (COD)</label>
                                        </div>
                                        <div style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                <input type="checkbox" id="ewallet" checked={settings.paymentMethods?.eWallet !== false} onChange={e => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, eWallet: e.target.checked } })} style={{ width: '20px', height: '20px' }} />
                                                <label htmlFor="ewallet" style={{ fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Enable E-Wallet / Mobile Cash Transfer</label>
                                            </div>
                                            {(settings.paymentMethods?.eWallet !== false) && (
                                                <div className="settings-grid-2" style={{ paddingInlineStart: '2rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>E-Wallet Display Name</label>
                                                        <input className="input" placeholder="e.g., Vodafone Cash" value={settings.paymentMethods?.eWalletName || 'E-Wallet / Cash'} onChange={e => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, eWalletName: e.target.value } })} />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>E-Wallet Number</label>
                                                        <input className="input" placeholder="e.g., 01000000000" value={settings.paymentMethods?.eWalletNumber || '01000000000'} onChange={e => setSettings({ ...settings, paymentMethods: { ...settings.paymentMethods, eWalletNumber: e.target.value } })} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="admin-section-subtitle">{t('admin.shippingRates')}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {settings.shippingRates?.map((rate: any, idx: number) => (
                                            <div key={idx} className="shipping-rate-row">
                                                <div className="field-group">
                                                    <label className="field-label">{t('admin.area')}</label>
                                                    <input required className="input" placeholder="e.g. Cairo" value={rate.city} onChange={e => {
                                                        const newRates = [...settings.shippingRates];
                                                        newRates[idx].city = e.target.value;
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} />
                                                </div>
                                                <div className="field-group">
                                                    <label className="field-label">{t('admin.cost')}</label>
                                                    <input required type="number" className="input" placeholder="50" value={rate.cost} onChange={e => {
                                                        const newRates = [...settings.shippingRates];
                                                        newRates[idx].cost = Number(e.target.value);
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} />
                                                </div>
                                                <div className="remove-btn" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                    <button type="button" onClick={() => {
                                                        const newRates = settings.shippingRates.filter((_: any, i: number) => i !== idx);
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} className="btn-danger" style={{ width: '100%' }}>{t('admin.remove')}</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => {
                                            const newRates = [...(settings.shippingRates || []), { city: '', cost: 0 }];
                                            setSettings({ ...settings, shippingRates: newRates });
                                        }} style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Add Shipping Area</button>
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ padding: '18px', fontSize: '1.1rem', borderRadius: '10px' }}>💾 {t('admin.saveSettings')}</button>
                            </form>
                        </div>

                        <h3 className="admin-section-title" style={{ marginTop: '1rem' }}>🔐 {t('admin.accountSecurity')} (الأمان)</h3>
                        <div className="admin-section-card">
                            <form onSubmit={handleSecurityUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 600 }}>

                                <div className="settings-grid-2">
                                    <div>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Current Username / اسم المستخدم الحالي</label>
                                        <input className="input" placeholder="admin" value={securityForm.currentUsername} onChange={e => setSecurityForm({ ...securityForm, currentUsername: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>New Username / اسم المستخدم الجديد</label>
                                        <input className="input" placeholder="Leave blank to keep current" value={securityForm.newUsername} onChange={e => setSecurityForm({ ...securityForm, newUsername: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Current Password / كلمة المرور الحالية</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input required type={showCurrentPassword ? 'text' : 'password'} className="input" value={securityForm.currentPassword} onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                        <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>New Secure Password / كلمة المرور الجديدة</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input type={showNewPassword ? 'text' : 'password'} className="input" placeholder="Min 12 characters (Leave blank to keep current)" value={securityForm.newPassword} onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                        <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Use a mix of uppercase, lowercase, numbers, and symbols.</p>
                                </div>

                                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '10px' }}>Update Security Info / تحديث التسجيل</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
