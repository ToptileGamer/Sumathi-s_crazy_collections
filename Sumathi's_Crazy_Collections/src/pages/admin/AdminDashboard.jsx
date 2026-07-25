import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardStats, getAllOrders, getAllProducts, updateOrderStatus } from "../../services/adminService";
import { getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage } from "../../services/productService";
import { getAllReturns, updateReturnStatus } from "../../services/returnService";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const ORDER_STATUSES  = ["pending","payment_initiated","paid","processing","shipped","delivered","cancelled","refunded"];
const STATUS_COLOR    = { pending:"#f59e0b", payment_initiated:"#3b82f6", paid:"#10b981", processing:"#6366f1", shipped:"#0ea5e9", delivered:"#22c55e", cancelled:"#ef4444", refunded:"#8b5cf6" };
const RETURN_STATUSES = ["requested","approved","rejected","completed"];
const RETURN_COLOR    = { requested:"#f59e0b", approved:"#10b981", rejected:"#ef4444", completed:"#6366f1" };

const TABS = [
  { id:"overview", icon:"▦", label:"Overview"  },
  { id:"orders",   icon:"◫", label:"Orders"    },
  { id:"products", icon:"◈", label:"Products"  },
  { id:"returns",  icon:"↩", label:"Returns"   },
];

// ════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [tab,     setTab]     = useState("overview");
  const [stats,   setStats]   = useState(null);
  const [sideOpen,setSideOpen]= useState(false);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) navigate("/");
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const switchTab = (id) => { setTab(id); setSideOpen(false); };

  if (authLoading) return <div style={{ padding:"6rem 2rem", textAlign:"center", color:"#888" }}>Loading...</div>;

  return (
    <>
      <style>{`
        /* ═══ Base Layout ═══ */
        .adm-layout { display:flex; min-height:100vh; background:#f4f6fb; padding-top:68px; }

        /* ── Sidebar ── */
        .adm-sidebar {
          width:240px; background:#0f172a; color:#fff;
          display:flex; flex-direction:column;
          position:fixed; top:68px; left:0; bottom:0;
          overflow-y:auto; z-index:200; padding:1.5rem 1rem;
          transition:transform 0.28s ease;
        }

        /* ── Main ── */
        .adm-main { flex:1; margin-left:240px; padding:2rem 2.5rem; min-height:calc(100vh - 68px); }

        /* ── Mobile topbar ── */
        .adm-topbar { display:none; }
        .adm-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:199; }

        /* ── Table Wrapper ── */
        .tbl-wrap { background:#fff; border-radius:16px; overflow-x:auto; box-shadow:0 1px 4px rgba(0,0,0,0.06); -webkit-overflow-scrolling:touch; }
        .tbl-wrap table { width:100%; border-collapse:collapse; font-size:0.85rem; min-width:700px; }
        .tbl-wrap th { padding:0.9rem 1rem; text-align:left; font-weight:600; color:#64748b; border-bottom:1px solid #f1f5f9; white-space:nowrap; background:#f8fafc; }
        .tbl-wrap td { padding:0.85rem 1rem; border-bottom:1px solid #f8fafc; color:#334155; vertical-align:middle; }
        .tbl-wrap tr:last-child td { border-bottom:none; }
        .tbl-wrap tr:hover td { background:#fafbff; }

        /* ── Stats Grid ── */
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:1.25rem; margin-top:1.5rem; }

        /* ── Form Grids ── */
        .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; }

        /* ════════════════════════════════
           RESPONSIVE - Tablet (≤768px)
        ════════════════════════════════ */
        @media (max-width: 768px) {
          .adm-layout { padding-top: 0; }
          
          .adm-sidebar {
            transform:translateX(-100%);
            top:0;
            padding-top:5rem;
            width: 280px;
          }
          .adm-sidebar.open { transform:translateX(0); }
          .adm-overlay.open { display:block; }
          
          .adm-main {
            margin-left:0;
            padding:1.25rem;
            min-height: 100vh;
          }
          
          .adm-topbar {
            display:flex;
            align-items:center;
            justify-content:space-between;
            background:#0f172a;
            color:#fff;
            padding:0.75rem 1rem;
            position:sticky;
            top:0;
            z-index:100;
          }
          .adm-topbar-title { font-weight:700; font-size:0.95rem; }
          .adm-hamburger {
            background:none; border:none; color:#fff; cursor:pointer;
            display:flex; flex-direction:column; gap:5px; padding:4px;
          }
          .adm-hamburger span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; }
          
          .stats-grid { grid-template-columns:1fr 1fr; gap:0.75rem; }
          .form-grid-2 { grid-template-columns:1fr; }
          .form-grid-3 { grid-template-columns:1fr 1fr; }
          .tbl-wrap table { min-width:600px; }
        }

        /* ════════════════════════════════
           RESPONSIVE - Large Phone (≤600px)
        ════════════════════════════════ */
        @media (max-width: 600px) {
          .adm-main { padding: 1rem; }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.65rem;
            margin-top: 1rem;
          }
          
          .form-grid-3 { grid-template-columns: 1fr; }
          
          .tbl-wrap table { min-width: 500px; font-size: 0.78rem; }
          .tbl-wrap th { padding: 0.65rem 0.75rem; font-size: 0.75rem; }
          .tbl-wrap td { padding: 0.65rem 0.75rem; font-size: 0.78rem; }
          
          .adm-topbar { padding: 0.6rem 0.85rem; }
          .adm-topbar-title { font-size: 0.85rem; }
          .adm-hamburger span { width: 20px; height: 1.8px; }
          
          .adm-sidebar { width: 260px; padding-top: 4.5rem; }
        }

        /* ════════════════════════════════
           RESPONSIVE - Phone (≤480px)
        ════════════════════════════════ */
        @media (max-width: 480px) {
          .adm-main { padding: 0.75rem; }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
          
          .tbl-wrap { border-radius: 12px; }
          .tbl-wrap table { min-width: 420px; font-size: 0.72rem; }
          .tbl-wrap th { padding: 0.5rem 0.6rem; font-size: 0.7rem; }
          .tbl-wrap td { padding: 0.5rem 0.6rem; font-size: 0.72rem; }
          
          .adm-topbar { padding: 0.5rem 0.75rem; }
          .adm-topbar-title { font-size: 0.8rem; }
          .adm-hamburger span { width: 18px; height: 1.6px; gap: 4px; }
          
          .adm-sidebar { width: 240px; padding: 1rem 0.75rem; padding-top: 4rem; }
        }

        /* ════════════════════════════════
           RESPONSIVE - Small Phone (≤360px)
        ════════════════════════════════ */
        @media (max-width: 360px) {
          .adm-main { padding: 0.5rem; }
          
          .tbl-wrap table { min-width: 320px; font-size: 0.68rem; }
          .tbl-wrap th { padding: 0.4rem 0.45rem; font-size: 0.65rem; }
          .tbl-wrap td { padding: 0.4rem 0.45rem; font-size: 0.68rem; }
          
          .adm-topbar { padding: 0.4rem 0.6rem; }
          .adm-topbar-title { font-size: 0.75rem; }
          
          .stats-grid { gap: 0.5rem; }
        }
      `}</style>

      <div className="adm-layout">

        {/* Mobile overlay */}
        <div className={`adm-overlay ${sideOpen ? "open" : ""}`} onClick={() => setSideOpen(false)} />

        {/* Sidebar */}
        <aside className={`adm-sidebar ${sideOpen ? "open" : ""}`}>
          <div style={{ marginBottom:"2rem", padding:"0 0.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.3rem" }}>
              <span style={{ fontSize:"1.2rem" }}>✦</span>
              <span style={{ fontWeight:700, fontSize:"1rem" }}>Admin Panel</span>
            </div>
            <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b", letterSpacing:"0.05em" }}>SUMATHI'S COLLECTIONS</p>
          </div>

          <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:"0.25rem" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)}
                style={{
                  display:"flex", alignItems:"center", gap:"0.75rem",
                  padding:"0.75rem 0.9rem", borderRadius:10,
                  border:"none", cursor:"pointer", textAlign:"left",
                  fontSize:"0.9rem", fontWeight:500,
                  background: tab === t.id ? "#e91e8c" : "transparent",
                  color:      tab === t.id ? "#fff"    : "#94a3b8",
                  transition:"all 0.18s",
                }}>
                <span style={{ fontSize:"1.1rem" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"1rem 0" }} />
          <div style={{ padding:"0.75rem", background:"rgba(255,255,255,0.05)", borderRadius:10, marginBottom:"0.75rem" }}>
            <p style={{ margin:0, fontSize:"0.78rem", color:"#fff", fontWeight:600 }}>{profile?.full_name ?? "Admin"}</p>
            <p style={{ margin:0, fontSize:"0.7rem", color:"#64748b" }}>{user?.email}</p>
          </div>
          <button onClick={() => navigate("/")}
            style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.6rem 0.9rem", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:"0.85rem" }}>
            ← Back to Store
          </button>
        </aside>

        {/* Mobile topbar */}
        <div className="adm-topbar">
          <button className="adm-hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <span className="adm-topbar-title">{TABS.find(t => t.id === tab)?.label ?? "Admin"}</span>
          <span style={{ fontSize:"1.4rem" }}>✦</span>
        </div>

        {/* Main content */}
        <main className="adm-main">
          {tab === "overview" && <OverviewTab stats={stats} />}
          {tab === "orders"   && <OrdersTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "returns"  && <ReturnsTab />}
        </main>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ stats }) => {
  const cards = [
    { label:"Total Revenue",   value: stats ? fmt(stats.totalRevenue) : "—", icon:"₹", color:"#e91e8c", bg:"#fff0f8" },
    { label:"Total Orders",    value: stats?.totalOrders    ?? "—",           icon:"◫", color:"#6366f1", bg:"#f0f0ff" },
    { label:"Total Products",  value: stats?.totalProducts  ?? "—",           icon:"◈", color:"#10b981", bg:"#f0fdf4" },
    { label:"Total Customers", value: stats?.totalCustomers ?? "—",           icon:"◎", color:"#f59e0b", bg:"#fffbeb" },
  ];
  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ margin:0, fontSize:"1.4rem", fontWeight:700, color:"#0f172a" }}>Overview</h1>
        <p style={{ margin:"0.25rem 0 0", color:"#94a3b8", fontSize:"0.85rem" }}>Welcome back! Here's what's happening.</p>
      </div>
      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:16, padding:"1.25rem", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${c.color}`, display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:46, height:46, borderRadius:12, background:c.bg, color:c.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", fontWeight:700, flexShrink:0 }}>{c.icon}</div>
            <div>
              <p style={{ margin:0, fontSize:"0.72rem", color:"#94a3b8", fontWeight:500 }}>{c.label}</p>
              <p style={{ margin:"0.1rem 0 0", fontSize:"1.4rem", fontWeight:800, color:"#0f172a" }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// ORDERS TAB
// ════════════════════════════════════════════════════════════
const OrdersTab = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllOrders({ status: filter || null })
      .then(({ orders: data }) => setOrders(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch(e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"1.4rem", fontWeight:700, color:"#0f172a" }}>Orders</h1>
          <p style={{ margin:"0.25rem 0 0", color:"#94a3b8", fontSize:"0.85rem" }}>{orders.length} found</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding:"0.55rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:"0.85rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none" }}>
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>
      </div>

      {loading ? <p style={{ color:"#94a3b8", padding:"2rem", textAlign:"center" }}>Loading orders...</p>
      : orders.length === 0 ? <div style={{ textAlign:"center", padding:"3rem", background:"#fff", borderRadius:16, color:"#94a3b8" }}>No orders found.</div>
      : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                {["Order #","Customer","Address","Items","Total","Pay","Status","Date","Update"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily:"monospace", fontWeight:700, color:"#0f172a", fontSize:"0.78rem" }}>{o.order_number}</span></td>
                  <td>{o.user?.full_name ?? "—"}</td>
                  <td style={{ fontSize:"0.78rem", minWidth:140 }}>
                    {o.address ? (
                      <div>
                        <p style={{ margin:0, fontWeight:600, color:"#334155" }}>{o.address.full_name}</p>
                        <p style={{ margin:0, color:"#64748b" }}>{o.address.phone}</p>
                        <p style={{ margin:0, color:"#94a3b8" }}>{o.address.line1}, {o.address.city}</p>
                        <p style={{ margin:0, color:"#94a3b8" }}>{o.address.state} – {o.address.pincode}</p>
                      </div>
                    ) : "—"}
                  </td>
                  <td>
                    <ul style={{ listStyle:"none", padding:0, margin:0 }}>
                      {(o.items ?? []).map(i => (
                        <li key={i.id} style={{ fontSize:"0.78rem", color:"#64748b" }}>{i.product_name} ×{i.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontWeight:700, whiteSpace:"nowrap" }}>{fmt(o.total_amount)}</td>
                  <td>
                    <span style={{ padding:"0.2rem 0.55rem", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:o.payment_method === "cod" ? "#fff7ed" : "#f0f0ff", color:o.payment_method === "cod" ? "#c2410c" : "#6366f1", whiteSpace:"nowrap" }}>
                      {o.payment_method === "cod" ? "💵 COD" : "💳 Online"}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding:"0.22rem 0.65rem", borderRadius:20, background:STATUS_COLOR[o.status], color:"#fff", fontSize:"0.72rem", fontWeight:700, textTransform:"capitalize", whiteSpace:"nowrap" }}>
                      {o.status.replace(/_/g," ")}
                    </span>
                  </td>
                  <td style={{ color:"#94a3b8", fontSize:"0.78rem", whiteSpace:"nowrap" }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <select value={o.status} disabled={updating === o.id}
                      onChange={e => handleStatus(o.id, e.target.value)}
                      style={{ padding:"0.35rem 0.5rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.75rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none", minWidth:110 }}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ════════════════════════════════════════════════════════════
const EMPTY = { name:"", slug:"", description:"", price:"", original_price:"", stock:"", category_id:"", is_featured:false, tags:"" };

const ProductsTab = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editProd,   setEditProd]   = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [imgFile,    setImgFile]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    Promise.all([
      getAllProducts().then(({ products: p }) => setProducts(p ?? [])),
      getCategories().then(setCategories),
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditProd(null); setForm(EMPTY); setImgFile(null); setError(""); setShowForm(true); };
  const openEdit   = (p)  => {
    setEditProd(p);
    setForm({ name:p.name, slug:p.slug, description:p.description ?? "", price:p.price, original_price:p.original_price ?? "", stock:p.stock, category_id:p.category_id ?? "", is_featured:p.is_featured, tags:(p.tags ?? []).join(", ") });
    setImgFile(null); setError(""); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = {
        name:           form.name,
        slug:           form.slug || form.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),
        description:    form.description,
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock:          Number(form.stock),
        category_id:    form.category_id || null,
        is_featured:    form.is_featured,
        tags:           form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        is_active:      true,
      };
      let saved;
      if (editProd) {
        saved = await updateProduct(editProd.id, payload);
        setProducts(prev => prev.map(p => p.id === saved.id ? { ...p, ...saved } : p));
      } else {
        saved = await createProduct(payload);
        setProducts(prev => [saved, ...prev]);
      }
      if (imgFile && saved?.id) await uploadProductImage(saved.id, imgFile, true);
      setShowForm(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleHide = async (id) => {
    if (!window.confirm("Hide this product?")) return;
    try { await deleteProduct(id); setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active:false } : p)); }
    catch(e) { console.error(e); }
  };

  const primaryImg = (p) => p.images?.find(i => i.is_primary)?.url ?? p.images?.[0]?.url;
  const inp = { padding:"0.65rem 0.9rem", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:"0.9rem", fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box" };
  const lbl = { display:"flex", flexDirection:"column", gap:"0.35rem", fontSize:"0.83rem", fontWeight:600, color:"#475569" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"1.4rem", fontWeight:700, color:"#0f172a" }}>Products</h1>
          <p style={{ margin:"0.25rem 0 0", color:"#94a3b8", fontSize:"0.85rem" }}>{products.length} total</p>
        </div>
        <button onClick={openCreate} style={{ padding:"0.65rem 1.25rem", background:"#e91e8c", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:"0.875rem", cursor:"pointer" }}>+ New Product</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }} onClick={() => setShowForm(false)}>
          <div style={{ background:"#fff", borderRadius:20, padding:"1.5rem", width:"100%", maxWidth:660, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin:"0 0 1.25rem", fontSize:"1.15rem", color:"#0f172a" }}>{editProd ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
              <div className="form-grid-2">
                <label style={lbl}>Name *<input required style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></label>
                <label style={lbl}>Slug<input style={inp} value={form.slug} placeholder="auto-generated" onChange={e => setForm(f => ({ ...f, slug:e.target.value }))} /></label>
              </div>
              <label style={lbl}>Description<textarea rows={3} style={{ ...inp, resize:"vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} /></label>
              <div className="form-grid-3">
                <label style={lbl}>Price (₹) *<input type="number" required min={0} style={inp} value={form.price} onChange={e => setForm(f => ({ ...f, price:e.target.value }))} /></label>
                <label style={lbl}>Original Price<input type="number" min={0} style={inp} value={form.original_price} placeholder="strikethrough" onChange={e => setForm(f => ({ ...f, original_price:e.target.value }))} /></label>
                <label style={lbl}>Stock *<input type="number" required min={0} style={inp} value={form.stock} onChange={e => setForm(f => ({ ...f, stock:e.target.value }))} /></label>
              </div>
              <div className="form-grid-2">
                <label style={lbl}>Category
                  <select style={inp} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id:e.target.value }))}>
                    <option value="">-- Select --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label style={lbl}>Tags (comma separated)<input style={inp} value={form.tags} placeholder="cute, gift, gold" onChange={e => setForm(f => ({ ...f, tags:e.target.value }))} /></label>
              </div>
              <label style={{ ...lbl, flexDirection:"row", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontWeight:500 }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured:e.target.checked }))} />
                Mark as featured product
              </label>
              <label style={lbl}>Product Image
                <input type="file" accept="image/*" style={inp} onChange={e => setImgFile(e.target.files[0])} />
                {imgFile && <span style={{ color:"#10b981", fontSize:"0.8rem" }}>✓ {imgFile.name}</span>}
              </label>
              {error && <p style={{ color:"#ef4444", fontSize:"0.84rem", margin:0, padding:"0.6rem", background:"#fef2f2", borderRadius:8 }}>{error}</p>}
              <div style={{ display:"flex", gap:"0.75rem" }}>
                <button type="submit" disabled={saving} style={{ flex:1, padding:"0.75rem", background:"#e91e8c", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", opacity:saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editProd ? "Save Changes" : "Create Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding:"0.75rem 1.25rem", background:"none", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", color:"#555" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ color:"#94a3b8", padding:"2rem", textAlign:"center" }}>Loading products...</p> : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                {["Image","Name","Category","Price","Stock","Featured","Status","Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ opacity:p.is_active ? 1 : 0.45 }}>
                  <td>
                    {primaryImg(p)
                      ? <img src={primaryImg(p)} alt={p.name} style={{ width:44, height:44, objectFit:"cover", borderRadius:10 }} />
                      : <div style={{ width:44, height:44, background:"#f1f5f9", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", color:"#94a3b8" }}>No img</div>}
                  </td>
                  <td>
                    <p style={{ margin:0, fontWeight:600, color:"#0f172a", fontSize:"0.875rem" }}>{p.name}</p>
                    <p style={{ margin:0, fontSize:"0.7rem", color:"#94a3b8", fontFamily:"monospace" }}>{p.slug}</p>
                  </td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td style={{ fontWeight:700 }}>{fmt(p.price)}</td>
                  <td><span style={{ color:p.stock < 5 ? "#ef4444" : "#334155", fontWeight:p.stock < 5 ? 700 : 400 }}>{p.stock}</span></td>
                  <td style={{ textAlign:"center" }}>{p.is_featured ? "⭐" : "—"}</td>
                  <td><span style={{ padding:"0.2rem 0.6rem", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:p.is_active ? "#f0fdf4" : "#f8fafc", color:p.is_active ? "#16a34a" : "#94a3b8" }}>{p.is_active ? "Active" : "Hidden"}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:"0.4rem" }}>
                      <button onClick={() => openEdit(p)} style={{ padding:"0.3rem 0.65rem", borderRadius:7, border:"1.5px solid #6366f1", color:"#6366f1", background:"none", cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>Edit</button>
                      {p.is_active && <button onClick={() => handleHide(p.id)} style={{ padding:"0.3rem 0.65rem", borderRadius:7, border:"1.5px solid #ef4444", color:"#ef4444", background:"none", cursor:"pointer", fontSize:"0.78rem", fontWeight:600 }}>Hide</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// RETURNS TAB
// ════════════════════════════════════════════════════════════
const ReturnsTab = () => {
  const [returns,  setReturns]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAllReturns().then(setReturns).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await updateReturnStatus(id, status);
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch(e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ margin:0, fontSize:"1.4rem", fontWeight:700, color:"#0f172a" }}>Return Requests</h1>
        <p style={{ margin:"0.25rem 0 0", color:"#94a3b8", fontSize:"0.85rem" }}>{returns.length} total</p>
      </div>
      {loading ? <p style={{ color:"#94a3b8", padding:"2rem", textAlign:"center" }}>Loading...</p>
      : returns.length === 0
        ? <div style={{ textAlign:"center", padding:"3rem", background:"#fff", borderRadius:16, color:"#94a3b8" }}>No return requests yet.</div>
        : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  {["Order #","Customer","Reason","Status","Date","Action"].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily:"monospace", fontWeight:700, color:"#0f172a", fontSize:"0.78rem" }}>{r.order?.order_number ?? "—"}</td>
                    <td>{r.user?.full_name ?? "—"}</td>
                    <td style={{ maxWidth:180, fontSize:"0.82rem", color:"#64748b" }}>{r.reason}</td>
                    <td><span style={{ padding:"0.22rem 0.65rem", borderRadius:20, background:RETURN_COLOR[r.status], color:"#fff", fontSize:"0.72rem", fontWeight:700 }}>{r.status}</span></td>
                    <td style={{ color:"#94a3b8", fontSize:"0.78rem", whiteSpace:"nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <select value={r.status} disabled={updating === r.id}
                        onChange={e => handleUpdate(r.id, e.target.value)}
                        style={{ padding:"0.35rem 0.5rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.75rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none" }}>
                        {RETURN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;