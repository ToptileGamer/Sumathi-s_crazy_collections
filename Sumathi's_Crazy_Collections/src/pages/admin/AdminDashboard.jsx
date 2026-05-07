import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardStats, getAllOrders, getAllProducts, updateOrderStatus } from "../../services/adminService";
import { getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage } from "../../services/productService";
import { getAllReturns, updateReturnStatus } from "../../services/returnService";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const ORDER_STATUSES = ["pending","payment_initiated","paid","processing","shipped","delivered","cancelled","refunded"];
const STATUS_COLOR = {
  pending:"#f59e0b", payment_initiated:"#3b82f6", paid:"#10b981",
  processing:"#6366f1", shipped:"#0ea5e9", delivered:"#22c55e",
  cancelled:"#ef4444", refunded:"#8b5cf6"
};
const RETURN_STATUSES = ["requested","approved","rejected","completed"];
const RETURN_COLOR = { requested:"#f59e0b", approved:"#10b981", rejected:"#ef4444", completed:"#6366f1" };

// ════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab]     = useState("overview");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) navigate("/");
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  if (authLoading) return <div style={{ padding:"6rem 2rem", textAlign:"center", color:"#888" }}>Loading...</div>;

  const TABS = [
    { id:"overview", icon:"▦", label:"Overview"  },
    { id:"orders",   icon:"◫", label:"Orders"    },
    { id:"products", icon:"◈", label:"Products"  },
    { id:"returns",  icon:"↩", label:"Returns"   },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f4f6fb", paddingTop:68 }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width:240, background:"#0f172a", color:"#fff",
        display:"flex", flexDirection:"column",
        position:"fixed", top:68, left:0, bottom:0,
        overflowY:"auto", zIndex:200, padding:"1.5rem 1rem",
      }}>
        <div style={{ marginBottom:"2rem", padding:"0 0.5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.3rem" }}>
            <span style={{ fontSize:"1.2rem" }}>✦</span>
            <span style={{ fontWeight:700, fontSize:"1rem", color:"#fff" }}>Admin Panel</span>
          </div>
          <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b", letterSpacing:"0.05em" }}>SUMATHI'S COLLECTIONS</p>
        </div>

        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display:"flex", alignItems:"center", gap:"0.75rem",
                padding:"0.7rem 0.9rem", borderRadius:10,
                border:"none", cursor:"pointer", textAlign:"left",
                fontSize:"0.875rem", fontWeight:500,
                background: tab === t.id ? "#e91e8c" : "transparent",
                color:      tab === t.id ? "#fff"    : "#94a3b8",
                transition:"all 0.18s",
              }}>
              <span style={{ fontSize:"1rem" }}>{t.icon}</span>
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
          style={{
            display:"flex", alignItems:"center", gap:"0.5rem",
            padding:"0.6rem 0.9rem", borderRadius:10,
            border:"1px solid rgba(255,255,255,0.1)",
            background:"transparent", color:"#64748b",
            cursor:"pointer", fontSize:"0.8rem", transition:"all 0.18s",
          }}>
          ← Back to Store
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, marginLeft:240, padding:"2rem 2.5rem", minHeight:"calc(100vh - 68px)", overflowY:"auto" }}>
        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "orders"   && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "returns"  && <ReturnsTab />}
      </main>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ stats }) => {
  const cards = [
    { label:"Total Revenue",   value: stats ? fmt(stats.totalRevenue) : "—", icon:"₹", color:"#e91e8c", bg:"#fff0f8" },
    { label:"Total Orders",    value: stats ? stats.totalOrders       : "—", icon:"◫", color:"#6366f1", bg:"#f0f0ff" },
    { label:"Total Products",  value: stats ? stats.totalProducts     : "—", icon:"◈", color:"#10b981", bg:"#f0fdf4" },
    { label:"Total Customers", value: stats ? stats.totalCustomers    : "—", icon:"◎", color:"#f59e0b", bg:"#fffbeb" },
  ];
  return (
    <div>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:"#0f172a" }}>Overview</h1>
        <p style={{ margin:"0.3rem 0 0", color:"#94a3b8", fontSize:"0.875rem" }}>Welcome back! Here's what's happening.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1.25rem" }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:16, padding:"1.4rem 1.5rem", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${c.color}`, display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:48, height:48, borderRadius:12, background:c.bg, color:c.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", fontWeight:700, flexShrink:0 }}>{c.icon}</div>
            <div>
              <p style={{ margin:0, fontSize:"0.75rem", color:"#94a3b8", fontWeight:500 }}>{c.label}</p>
              <p style={{ margin:"0.15rem 0 0", fontSize:"1.5rem", fontWeight:800, color:"#0f172a" }}>{c.value}</p>
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:"#0f172a" }}>Orders</h1>
          <p style={{ margin:"0.3rem 0 0", color:"#94a3b8", fontSize:"0.875rem" }}>{orders.length} orders found</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding:"0.55rem 1rem", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:"0.875rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none" }}>
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"3rem", color:"#94a3b8" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:"center", padding:"3rem", background:"#fff", borderRadius:16, color:"#94a3b8" }}>No orders found.</div>
      ) : (
        <div style={{ background:"#fff", borderRadius:16, overflow:"auto", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Order #","Customer","Delivery Address","Items","Total","Payment","Status","Date","Update"].map(h => (
                  <th key={h} style={{ padding:"0.9rem 1rem", textAlign:"left", fontWeight:600, color:"#64748b", borderBottom:"1px solid #f1f5f9", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"0.9rem 1rem" }}>
                    <span style={{ fontFamily:"monospace", fontWeight:700, color:"#0f172a", fontSize:"0.78rem" }}>{o.order_number}</span>
                  </td>
                  <td style={{ padding:"0.9rem 1rem", color:"#334155" }}>{o.user?.full_name ?? "—"}</td>
                  <td style={{ padding:"0.9rem 1rem", fontSize:"0.8rem", minWidth:160 }}>
                    {o.address ? (
                      <div>
                        <p style={{ margin:0, fontWeight:600, color:"#334155" }}>{o.address.full_name}</p>
                        <p style={{ margin:"0.1rem 0 0", color:"#64748b" }}>{o.address.phone}</p>
                        <p style={{ margin:"0.1rem 0 0", color:"#94a3b8" }}>{o.address.line1}, {o.address.city}</p>
                        <p style={{ margin:0, color:"#94a3b8" }}>{o.address.state} – {o.address.pincode}</p>
                      </div>
                    ) : <span style={{ color:"#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding:"0.9rem 1rem" }}>
                    <ul style={{ listStyle:"none", padding:0, margin:0 }}>
                      {(o.items ?? []).map(i => (
                        <li key={i.id} style={{ fontSize:"0.78rem", color:"#64748b" }}>{i.product_name} ×{i.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding:"0.9rem 1rem", fontWeight:700, color:"#0f172a", whiteSpace:"nowrap" }}>{fmt(o.total_amount)}</td>
                  <td style={{ padding:"0.9rem 1rem" }}>
                    <span style={{ padding:"0.2rem 0.6rem", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background: o.payment_method === "cod" ? "#fff7ed" : "#f0f0ff", color: o.payment_method === "cod" ? "#c2410c" : "#6366f1" }}>
                      {o.payment_method === "cod" ? "💵 COD" : "💳 Online"}
                    </span>
                  </td>
                  <td style={{ padding:"0.9rem 1rem" }}>
                    <span style={{ padding:"0.25rem 0.7rem", borderRadius:20, background:STATUS_COLOR[o.status], color:"#fff", fontSize:"0.75rem", fontWeight:700, textTransform:"capitalize", whiteSpace:"nowrap" }}>
                      {o.status.replace(/_/g," ")}
                    </span>
                  </td>
                  <td style={{ padding:"0.9rem 1rem", color:"#94a3b8", fontSize:"0.8rem", whiteSpace:"nowrap" }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding:"0.9rem 1rem" }}>
                    <select value={o.status} disabled={updating === o.id}
                      onChange={e => handleStatus(o.id, e.target.value)}
                      style={{ padding:"0.35rem 0.6rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.78rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none", minWidth:120 }}>
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:"#0f172a" }}>Products</h1>
          <p style={{ margin:"0.3rem 0 0", color:"#94a3b8", fontSize:"0.875rem" }}>{products.length} products total</p>
        </div>
        <button onClick={openCreate} style={{ padding:"0.65rem 1.4rem", background:"#e91e8c", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:"0.875rem", cursor:"pointer" }}>+ New Product</button>
      </div>

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }} onClick={() => setShowForm(false)}>
          <div style={{ background:"#fff", borderRadius:20, padding:"2rem", width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin:"0 0 1.5rem", fontSize:"1.2rem", color:"#0f172a" }}>{editProd ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <label style={lbl}>Name *<input required style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></label>
                <label style={lbl}>Slug<input style={inp} value={form.slug} placeholder="auto-generated" onChange={e => setForm(f => ({ ...f, slug:e.target.value }))} /></label>
              </div>
              <label style={lbl}>Description<textarea rows={3} style={{ ...inp, resize:"vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} /></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem" }}>
                <label style={lbl}>Price (₹) *<input type="number" required min={0} style={inp} value={form.price} onChange={e => setForm(f => ({ ...f, price:e.target.value }))} /></label>
                <label style={lbl}>Original Price (₹)<input type="number" min={0} style={inp} value={form.original_price} placeholder="strikethrough" onChange={e => setForm(f => ({ ...f, original_price:e.target.value }))} /></label>
                <label style={lbl}>Stock *<input type="number" required min={0} style={inp} value={form.stock} onChange={e => setForm(f => ({ ...f, stock:e.target.value }))} /></label>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
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
              {error && <p style={{ color:"#ef4444", fontSize:"0.84rem", margin:0, padding:"0.6rem 0.9rem", background:"#fef2f2", borderRadius:8 }}>{error}</p>}
              <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
                <button type="submit" disabled={saving} style={{ flex:1, padding:"0.75rem", background:"#e91e8c", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:"0.95rem", cursor:"pointer", opacity:saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editProd ? "Save Changes" : "Create Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding:"0.75rem 1.5rem", background:"none", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", fontSize:"0.9rem", color:"#555" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign:"center", padding:"3rem", color:"#94a3b8" }}>Loading products...</div> : (
        <div style={{ background:"#fff", borderRadius:16, overflow:"auto", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Image","Name","Category","Price","Stock","Featured","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"0.9rem 1rem", textAlign:"left", fontWeight:600, color:"#64748b", borderBottom:"1px solid #f1f5f9", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom:"1px solid #f8fafc", opacity:p.is_active ? 1 : 0.45 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"0.75rem 1rem" }}>
                    {primaryImg(p)
                      ? <img src={primaryImg(p)} alt={p.name} style={{ width:48, height:48, objectFit:"cover", borderRadius:10 }} />
                      : <div style={{ width:48, height:48, background:"#f1f5f9", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", color:"#94a3b8" }}>No img</div>}
                  </td>
                  <td style={{ padding:"0.75rem 1rem" }}>
                    <p style={{ margin:0, fontWeight:600, color:"#0f172a" }}>{p.name}</p>
                    <p style={{ margin:0, fontSize:"0.72rem", color:"#94a3b8", fontFamily:"monospace" }}>{p.slug}</p>
                  </td>
                  <td style={{ padding:"0.75rem 1rem", color:"#475569" }}>{p.category?.name ?? "—"}</td>
                  <td style={{ padding:"0.75rem 1rem", fontWeight:700, color:"#0f172a" }}>{fmt(p.price)}</td>
                  <td style={{ padding:"0.75rem 1rem" }}>
                    <span style={{ color:p.stock < 5 ? "#ef4444" : "#334155", fontWeight:p.stock < 5 ? 700 : 400 }}>{p.stock}</span>
                  </td>
                  <td style={{ padding:"0.75rem 1rem", textAlign:"center" }}>{p.is_featured ? "⭐" : "—"}</td>
                  <td style={{ padding:"0.75rem 1rem" }}>
                    <span style={{ padding:"0.2rem 0.65rem", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:p.is_active ? "#f0fdf4" : "#f8fafc", color:p.is_active ? "#16a34a" : "#94a3b8" }}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td style={{ padding:"0.75rem 1rem" }}>
                    <div style={{ display:"flex", gap:"0.5rem" }}>
                      <button onClick={() => openEdit(p)}
                        style={{ padding:"0.3rem 0.75rem", borderRadius:7, border:"1.5px solid #6366f1", color:"#6366f1", background:"none", cursor:"pointer", fontSize:"0.8rem", fontWeight:600 }}
                        onMouseEnter={e => { e.currentTarget.style.background="#6366f1"; e.currentTarget.style.color="#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#6366f1"; }}>
                        Edit
                      </button>
                      {p.is_active && (
                        <button onClick={() => handleHide(p.id)}
                          style={{ padding:"0.3rem 0.75rem", borderRadius:7, border:"1.5px solid #ef4444", color:"#ef4444", background:"none", cursor:"pointer", fontSize:"0.8rem", fontWeight:600 }}
                          onMouseEnter={e => { e.currentTarget.style.background="#ef4444"; e.currentTarget.style.color="#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#ef4444"; }}>
                          Hide
                        </button>
                      )}
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
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:"#0f172a" }}>Return Requests</h1>
        <p style={{ margin:"0.3rem 0 0", color:"#94a3b8", fontSize:"0.875rem" }}>{returns.length} total requests</p>
      </div>
      {loading ? <div style={{ textAlign:"center", padding:"3rem", color:"#94a3b8" }}>Loading...</div>
      : returns.length === 0
        ? <div style={{ textAlign:"center", padding:"3rem", background:"#fff", borderRadius:16, color:"#94a3b8" }}>No return requests yet.</div>
        : (
          <div style={{ background:"#fff", borderRadius:16, overflow:"auto", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["Order #","Customer","Reason","Status","Date","Action"].map(h => (
                    <th key={h} style={{ padding:"0.9rem 1rem", textAlign:"left", fontWeight:600, color:"#64748b", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r.id} style={{ borderBottom:"1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fafbff"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.9rem 1rem", fontFamily:"monospace", fontWeight:700, color:"#0f172a", fontSize:"0.78rem" }}>{r.order?.order_number ?? "—"}</td>
                    <td style={{ padding:"0.9rem 1rem", color:"#334155" }}>{r.user?.full_name ?? "—"}</td>
                    <td style={{ padding:"0.9rem 1rem", color:"#64748b", maxWidth:200 }}>{r.reason}</td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <span style={{ padding:"0.22rem 0.7rem", borderRadius:20, background:RETURN_COLOR[r.status], color:"#fff", fontSize:"0.75rem", fontWeight:700 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding:"0.9rem 1rem", color:"#94a3b8", fontSize:"0.8rem" }}>
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <select value={r.status} disabled={updating === r.id}
                        onChange={e => handleUpdate(r.id, e.target.value)}
                        style={{ padding:"0.35rem 0.6rem", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.78rem", background:"#fff", color:"#1a1a2e", cursor:"pointer", outline:"none" }}>
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