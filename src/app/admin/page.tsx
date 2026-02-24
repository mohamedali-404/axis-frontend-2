'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
    const [token, setToken] = useState('');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

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

    useEffect(() => {
        if (token) {
            fetchData();
            // Live update for pending orders every 30 seconds
            const interval = setInterval(() => {
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/pending/count`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => setPendingOrdersCount(res.data.count))
                    .catch(console.error);
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [token, activeTab]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Always fetch pending count
            const { data: countData } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/pending/count`, config);
            setPendingOrdersCount(countData.count);

            if (activeTab === 'products') {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
                setProducts(data);
            } else if (activeTab === 'orders') {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`, config);
                setOrders(data);
            } else if (activeTab === 'coupons') {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, config);
                setCoupons(data);
            } else if (activeTab === 'settings') {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                setSettings(data);
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
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, loginForm);
            setToken(data.token);
            localStorage.setItem('axis_token', data.token);
        } catch {
            alert('Login failed');
        }
    };


    const handleChangePassword = async (e: any) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, passwordForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error occurred while changing password');
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
                    const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
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
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${editingProductId}`, pData, { headers: { Authorization: `Bearer ${token}` } });
                alert('Product Updated Successfully');
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, pData, { headers: { Authorization: `Bearer ${token}` } });
                alert('Product Added Successfully');
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
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error deleting'); }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error updating order'); }
    };

    const deleteOrder = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (e: any) {
            console.error('Delete error:', e);
            alert(`Error deleting order: ${e.response?.data?.message || e.message}`);
        }
    };

    const createCoupon = async (e: any) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
                ...couponForm, percentage: Number(couponForm.percentage)
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            alert('Coupon created');
        } catch { alert('Error creating coupon'); }
    };

    const deleteCoupon = async (id: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch { alert('Error deleting coupon'); }
    };

    const updateSettings = async (e: any) => {
        e.preventDefault();
        try {
            let updatePayload = { ...settings };
            if (updatePayload._id) delete updatePayload._id; // safe pattern
            if (updatePayload.__v !== undefined) delete updatePayload.__v; // safe pattern

            if (logoObj) {
                const formData = new FormData();
                formData.append('image', logoObj);
                const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                updatePayload.brandLogo = uploadRes.data.url;
            }
            if (bannerObj) {
                const formData = new FormData();
                formData.append('image', bannerObj);
                const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
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
                    const uploadRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    newCollectionCards[i].image = uploadRes.data.url;
                }
            }
            updatePayload.collectionCards = newCollectionCards;

            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings`, updatePayload, { headers: { Authorization: `Bearer ${token}` } });
            setSettings(res.data);
            setCollectionImageObjs([null, null, null]);
            alert('Settings updated successfully!');
        } catch (e: any) {
            console.error('Error updating settings:', e.response?.data || e.message || e);
            alert(`Error updating settings: ${e.response?.data?.message || 'Unknown network error'}`);
        }
    };

    if (!token) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <form onSubmit={handleLogin} style={{ padding: '3rem', backgroundColor: 'var(--secondary-color)', border: '1px solid var(--border-color)', width: '100%', maxWidth: 420, borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.5px' }}>Admin Axis</h2>
                    <p style={{ textAlign: 'center', marginBottom: '2.5rem', opacity: 0.6, fontWeight: 500 }}>Enter your credentials to manage the store</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Username</label>
                            <input required className="input" placeholder="admin" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input required className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '8px' }}>Sign In</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: 1400, margin: '2rem auto 0', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {/* Sidebar */}
            <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '2rem', minWidth: 250 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem' }}>Dashboard</h2>
                {['products', 'orders', 'coupons', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', textAlign: 'left', backgroundColor: activeTab === tab ? 'var(--accent-color)' : 'transparent', color: activeTab === tab ? 'var(--accent-foreground)' : 'currentColor', border: 'none', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', borderRadius: '8px', transition: 'all 0.2s', ... (activeTab !== tab && { opacity: 0.7 }) }}>
                        <span>{tab}</span>
                        {tab === 'orders' && pendingOrdersCount > 0 && (
                            <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 800, minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                ))}
                <button onClick={() => { setToken(''); localStorage.removeItem('axis_token'); }} style={{ padding: '1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#ef4444', marginTop: '2rem', transition: 'all 0.2s', opacity: 0.8 }}>
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: '1 1 600px', minHeight: '60vh', overflowX: 'hidden' }}>

                {activeTab === 'products' && (
                    <div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Products Management</h3>
                        <div style={{ marginBottom: '3rem', padding: '2.5rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{editingProductId ? 'Edit Product' : 'Add New Product'}</h4>
                            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Product Name</label>
                                    <input required className="input" placeholder="e.g. Graphic T-Shirt" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stock Quantity</label>
                                    <input required className="input" type="number" placeholder="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Price ($)</label>
                                    <input required className="input" type="number" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Discount Price ($)</label>
                                    <input className="input" type="number" placeholder="Optional" value={productForm.discountPrice} onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>English Description</label>
                                    <textarea required className="input" placeholder="Detailed product description in English..." rows={4} value={productForm.descriptionEn} onChange={e => setProductForm({ ...productForm, descriptionEn: e.target.value })}></textarea>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Arabic Description</label>
                                    <textarea required className="input" placeholder="وصف المنتج بالعربية..." rows={4} value={productForm.descriptionAr} onChange={e => setProductForm({ ...productForm, descriptionAr: e.target.value })} dir="rtl"></textarea>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Product Images</label>
                                    <input type="file" multiple className="input" onChange={e => setProductForm({ ...productForm, imageObjs: Array.from(e.target.files || []) })} style={{ padding: '8px' }} />
                                    {editingProductId && <p style={{ fontSize: '0.85rem', color: '#ff9800', marginTop: '0.5rem', fontWeight: 600 }}>Leave images empty to keep the existing ones.</p>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Available Sizes</label>
                                    <input required className="input" placeholder="e.g. S, M, L, XL, 42, 44" value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} />
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>Separate sizes with commas</p>
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem', borderRadius: '6px' }}>{editingProductId ? 'Save Changes' : 'Add Product'}</button>
                                    {editingProductId && (
                                        <button type="button" onClick={() => { setEditingProductId(null); setProductForm({ name: '', price: '', discountPrice: '', stock: '', descriptionEn: '', descriptionAr: '', sizes: 'S, M, L, XL', imageObjs: [] as File[] }); }} className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem', borderRadius: '6px', backgroundColor: 'transparent', border: '2px solid var(--border-color)', color: 'var(--accent-color)' }}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div style={{ backgroundColor: 'var(--secondary-color)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Name</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Price</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Stock</th>
                                        <th style={{ padding: '1rem 0', fontWeight: 700 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row">
                                            <td style={{ padding: '1rem 0' }}>{p.name}</td>
                                            <td style={{ padding: '1rem 0', fontWeight: 600 }}>${p.price}</td>
                                            <td style={{ padding: '1rem 0' }}>
                                                <span style={{ padding: '4px 12px', backgroundColor: p.stock > 0 ? '#e0f2fe' : '#fee2e2', color: p.stock > 0 ? '#0369a1' : '#991b1b', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0', display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleEditBtn(p)} style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Edit</button>
                                                <button onClick={() => deleteProduct(p._id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Orders Management</h3>
                        {orders.length === 0 ? <p style={{ fontWeight: 600, opacity: 0.6 }}>No orders found.</p> : orders.map(order => (
                            <div key={order._id} style={{ border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: 'var(--secondary-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.3px', margin: 0 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h4>
                                        <p style={{ margin: '0.5rem 0 0', fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)', opacity: 0.7 }}>Placed at {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#10b981' }}>${order.total?.toFixed(2)}</span>
                                        <button onClick={() => deleteOrder(order._id)} className="hover-scale" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '1.5rem', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
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
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Subtotal: <span style={{ opacity: 0.8 }}>${order.subtotal?.toFixed(2)}</span></p>
                                        {order.discountApplied > 0 && <p style={{ margin: '0.3rem 0', fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>Discount: -${order.discountApplied?.toFixed(2)}</p>}
                                        <p style={{ margin: '0.3rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Shipping: <span style={{ opacity: 0.8 }}>${order.shippingCost?.toFixed(2)}</span></p>
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
                                            <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
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
                    <div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Coupons Management</h3>
                        <div style={{ marginBottom: '3rem', padding: '2.5rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Create New Coupon</h4>
                            <form onSubmit={createCoupon} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Coupon Code</label>
                                    <input required className="input" placeholder="e.g. SUMMER20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Discount %</label>
                                    <input required className="input" type="number" placeholder="20" value={couponForm.percentage} onChange={e => setCouponForm({ ...couponForm, percentage: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Expiration Date</label>
                                    <input required className="input" type="date" value={couponForm.expirationDate} onChange={e => setCouponForm({ ...couponForm, expirationDate: e.target.value })} />
                                </div>
                                <button className="btn-primary" type="submit" style={{ padding: '12px 24px', borderRadius: '6px' }}>Create Coupon</button>
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
                    <div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Customization & Shipping</h3>
                        <div style={{ marginBottom: '3rem', padding: '2.5rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <form onSubmit={updateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 800 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
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
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Global Theme Setup</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
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
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Collections Banner</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Section Title</label>
                                        <input className="input" value={settings.collectionSectionTitle || ''} onChange={e => setSettings({ ...settings, collectionSectionTitle: e.target.value })} placeholder="e.g. Shop by Category" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Social Section Title</label>
                                        <input className="input" value={settings.socialSectionTitle || ''} onChange={e => setSettings({ ...settings, socialSectionTitle: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Social Section Text</label>
                                        <input className="input" value={settings.socialSectionText || ''} onChange={e => setSettings({ ...settings, socialSectionText: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Social Media Links</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
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
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>About Us Page</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>About Us Text</label>
                                        <textarea className="input" rows={4} placeholder="We are AXIS..." value={settings.aboutText || ''} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} style={{ padding: '12px', resize: 'vertical' }} />
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Contact Page & Footer</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
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
                                    <h4 style={{ fontWeight: 800, marginTop: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Payment Methods</h4>
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
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', paddingLeft: '2.5rem' }}>
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
                                    <h4 style={{ fontWeight: 800, marginTop: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Shipping Rates</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {settings.shippingRates?.map((rate: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgb(var(--background-start-rgb))', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ flex: 2 }}>
                                                    <label style={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>Area / Governorate</label>
                                                    <input required className="input" placeholder="e.g. Cairo" value={rate.city} onChange={e => {
                                                        const newRates = [...settings.shippingRates];
                                                        newRates[idx].city = e.target.value;
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.3rem' }}>Cost ($)</label>
                                                    <input required type="number" className="input" placeholder="50" value={rate.cost} onChange={e => {
                                                        const newRates = [...settings.shippingRates];
                                                        newRates[idx].cost = Number(e.target.value);
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} />
                                                </div>
                                                <div style={{ paddingTop: '1.4rem' }}>
                                                    <button type="button" onClick={() => {
                                                        const newRates = settings.shippingRates.filter((_: any, i: number) => i !== idx);
                                                        setSettings({ ...settings, shippingRates: newRates });
                                                    }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => {
                                            const newRates = [...(settings.shippingRates || []), { city: '', cost: 0 }];
                                            setSettings({ ...settings, shippingRates: newRates });
                                        }} style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: 'var(--accent-foreground)', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Add Shipping Area</button>
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '6px' }}>Save All Settings</button>
                            </form>
                        </div>

                        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Account Security</h3>
                        <div style={{ marginBottom: '3rem', padding: '2.5rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 600 }}>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input required type={showCurrentPassword ? 'text' : 'password'} className="input" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                        <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>New Secure Password</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input required type={showNewPassword ? 'text' : 'password'} minLength={12} className="input" placeholder="Min 12 characters" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={{ width: '100%', paddingRight: '2.5rem' }} />
                                        <div style={{ position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }} onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Use a mix of uppercase, lowercase, numbers, and symbols.</p>
                                </div>
                                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '6px' }}>Update Password</button>
                            </form>
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    );
}
