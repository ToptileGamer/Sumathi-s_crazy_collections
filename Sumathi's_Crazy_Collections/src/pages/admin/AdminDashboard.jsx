import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth }             from "../../hooks/useAuth";

// From adminService.js
import { getDashboardStats, getAllOrders, getAllProducts, updateOrderStatus } from "../../services/adminService";

// From productService.js
import { getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage } from "../../services/productService";

import "../../styles/admin.css";


const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const ORDER_STATUSES = ["pending","payment_initiated","paid","processing","shipped","delivered","cancelled","refunded"];
const STATUS_COLOR   = { pending:"#f59e0b", payment_initiated:"#3b82f6", paid:"#10b981", processing:"#6366f1", shipped:"#0ea5e9", delivered:"#22c55e", cancelled:"#ef4444", refunded:"#8b5cf6" };

// ── Reusable stat card ────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="stat-icon" style={{ background: color + "22", color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate            = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab]       = useState("overview");
  const [stats, setStats]   = useState(null);

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) navigate("/");
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  if (authLoading) return <div className="admin-loading">Loading...</div>;

  const TABS = [
    { id: "overview", label: "📊 Overview" },
    { id: "orders",   label: "📦 Orders"   },
    { id: "products", label: "🛍 Products"  },
  ];

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>🛠 Admin</h2>
          <p>Sumathi's Collections</p>
        </div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button key={t.id}
              className={`admin-nav-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="admin-nav-btn back-btn" onClick={() => navigate("/")}>
          ← Back to Store
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "orders"   && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
      </main>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ stats }) => (
  <div>
    <h2 className="admin-page-title">Overview</h2>
    {!stats ? <p>Loading stats...</p> : (
      <div className="stats-grid">
        <StatCard label="Total Revenue"   value={formatPrice(stats.totalRevenue)}  icon="₹" color="#e91e8c" />
        <StatCard label="Total Orders"    value={stats.totalOrders}    icon="📦" color="#6366f1" />
        <StatCard label="Total Products"  value={stats.totalProducts}  icon="🛍" color="#10b981" />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" color="#f59e0b" />
      </div>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
// ORDERS TAB
// ════════════════════════════════════════════════════════════
const OrdersTab = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllOrders({ status: filterStatus || null })
      .then(({ orders: data }) => setOrders(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-page-title">Orders</h2>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-select">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
      </div>

      {loading ? <p>Loading orders...</p> : orders.length === 0 ? (
        <div className="admin-empty">No orders found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Status</th><th>Date</th><th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-num">{order.order_number}</span></td>
                  <td>{order.user?.full_name ?? "—"}</td>
                  <td>
                    <ul className="order-items-mini">
                      {(order.items ?? []).map((i) => (
                        <li key={i.id}>{i.product_name} ×{i.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLOR[order.status] }}>
                      {order.status.replace("_"," ")}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="admin-select small">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
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
const EMPTY_PRODUCT = { name:"", slug:"", description:"", price:"", original_price:"", stock:"", category_id:"", is_featured: false, tags:"" };

const ProductsTab = () => {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,        setForm]        = useState(EMPTY_PRODUCT);
  const [imageFile,   setImageFile]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    Promise.all([
      getAllProducts().then(({ products: p }) => setProducts(p ?? [])),
      getCategories().then(setCategories),
    ]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:           product.name,
      slug:           product.slug,
      description:    product.description ?? "",
      price:          product.price,
      original_price: product.original_price ?? "",
      stock:          product.stock,
      category_id:    product.category_id ?? "",
      is_featured:    product.is_featured,
      tags:           (product.tags ?? []).join(", "),
    });
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
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
        tags:           form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_active:      true,
      };

      let savedProduct;
      if (editProduct) {
        savedProduct = await updateProduct(editProduct.id, payload);
        setProducts((prev) => prev.map((p) => p.id === savedProduct.id ? { ...p, ...savedProduct } : p));
      } else {
        savedProduct = await createProduct(payload);
        setProducts((prev) => [savedProduct, ...prev]);
      }

      // Upload image if selected
      if (imageFile && savedProduct?.id) {
        await uploadProductImage(savedProduct.id, imageFile, true);
      }

      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hide this product from the store?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: false } : p));
    } catch (e) { console.error(e); }
  };

  const getPrimaryImg = (p) =>
    p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-page-title">Products</h2>
        <button className="hero-btn small" onClick={openCreate}>+ New Product</button>
      </div>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editProduct ? "Edit Product" : "New Product"}</h3>
            <form onSubmit={handleSave} className="admin-product-form">
              <div className="form-row">
                <label>Name *<input required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
                <label>Slug<input value={form.slug} placeholder="auto-generated if empty"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></label>
              </div>
              <label>Description<textarea rows={3} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
              <div className="form-row">
                <label>Price (₹) *<input type="number" required min={0} value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></label>
                <label>Original Price (₹)<input type="number" min={0} value={form.original_price}
                  placeholder="for strikethrough"
                  onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))} /></label>
                <label>Stock *<input type="number" required min={0} value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></label>
              </div>
              <div className="form-row">
                <label>Category
                  <select value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                    <option value="">-- Select --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>Tags (comma separated)<input value={form.tags} placeholder="cute, gift, gold"
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} /></label>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
                Featured product
              </label>
              <label>Product Image
                <input type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])} />
                {imageFile && <span className="file-name">{imageFile.name}</span>}
              </label>
              {error && <p className="admin-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="hero-btn" disabled={saving}>
                  {saving ? "Saving..." : editProduct ? "Save Changes" : "Create Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Products Table ── */}
      {loading ? <p>Loading products...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? "inactive-row" : ""}>
                  <td>
                    {getPrimaryImg(p)
                      ? <img src={getPrimaryImg(p)} alt={p.name} className="product-thumb" />
                      : <div className="no-img">No img</div>}
                  </td>
                  <td><strong>{p.name}</strong><br /><span className="slug-text">{p.slug}</span></td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <span className={p.stock < 5 ? "low-stock" : ""}>{p.stock}</span>
                  </td>
                  <td>{p.is_featured ? "⭐" : "—"}</td>
                  <td>
                    <span className={`status-badge ${p.is_active ? "active-badge" : "hidden-badge"}`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn"   onClick={() => openEdit(p)}>Edit</button>
                      {p.is_active && <button className="delete-btn" onClick={() => handleDelete(p.id)}>Hide</button>}
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

export default AdminDashboard;