import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { signOut }     from "../services/authService";

const Navbar = () => {
  const navigate              = useNavigate();
  const location              = useLocation();
  const { count }             = useCart();
  const { count: wishCount }  = useWishlist();
  const { user, profile }     = useAuth();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropRef                       = useRef(null);
  const searchRef                     = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); setSearchOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const initials = (profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase())
    ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="nav-announce">
        <p>✦ Free Shipping on orders above ₹999 &nbsp;•&nbsp; Handcrafted with Love ✦</p>
      </div>

      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <Link to="/" className="navbar__logo" id="navbar-logo">
            <span className="logo__icon">✦</span>
            <span className="logo__text">Sumathi's<span>Crazy Collections</span></span>
          </Link>

          {/* ── Desktop Nav ── */}
          <ul className="navbar__links">
            {[
              { to: "/",         label: "Home"     },
              { to: "/products", label: "Shop"     },
              { to: "/about",    label: "About"    },
              { to: "/contact",  label: "Contact"  },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={`nav-link ${isActive(to) ? "nav-link--active" : ""}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Actions ── */}
          <div className="navbar__actions">

            {/* Search */}
            <div className="nav-search-wrap" ref={searchRef}>
              <button className="action-btn" title="Search" id="nav-search-btn"
                onClick={() => setSearchOpen(v => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
              {searchOpen && (
                <form className="nav-search-dropdown" onSubmit={handleSearch}>
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    id="nav-search-input"
                  />
                  <button type="submit" className="nav-search-submit">→</button>
                </form>
              )}
            </div>

            {/* Wishlist */}
            <button className="action-btn" title="Wishlist" id="nav-wishlist-btn"
              onClick={() => user ? navigate("/profile") : navigate("/signup")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishCount > 0 ? "#e91e8c" : "none"} stroke={wishCount > 0 ? "#e91e8c" : "currentColor"} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishCount > 0 && <span className="action-badge">{wishCount}</span>}
            </button>

            {/* Cart */}
            <button className="action-btn" title="Cart" id="nav-cart-btn" onClick={() => navigate("/cart")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {count > 0 && <span className="action-badge">{count}</span>}
            </button>

            {/* User */}
            {user ? (
              <div className="user-menu" ref={dropRef}>
                <button className="user-avatar" onClick={() => setDropOpen(v => !v)} id="nav-user-btn">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" />
                    : initials}
                </button>
                {dropOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{profile?.full_name ?? "My Account"}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item">👤 My Profile</Link>
                    <Link to="/profile" className="dropdown-item">📦 My Orders</Link>
                    <Link to="/profile" className="dropdown-item">♡ Wishlist</Link>
                    {profile?.role === "admin" && (
                      <Link to="/admin" className="dropdown-item dropdown-item--admin">🛠 Admin Dashboard</Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item--logout" onClick={handleLogout}>
                      ↩ Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signup" className="navbar__cta" id="nav-login-btn">Sign Up</Link>
            )}

            {/* Mobile toggle */}
            <button className="mobile-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Menu" id="nav-mobile-toggle">
              <span className={`hamburger ${menuOpen ? "open" : ""}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu (slide-in overlay) ── */}
        <div className={`mobile-overlay ${menuOpen ? "mobile-overlay--open" : ""}`} onClick={() => setMenuOpen(false)} />
        <div className={`mobile-drawer ${menuOpen ? "mobile-drawer--open" : ""}`}>
          <div className="mobile-drawer__header">
            <span className="logo__icon">✦</span>
            <span className="logo__text" style={{color:'#1a1a2e'}}>Sumathi's<span>Crazy Collections</span></span>
            <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close">✕</button>
          </div>

          {/* Mobile search */}
          <form className="mobile-search" onSubmit={(e) => { e.preventDefault(); if(searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); setMenuOpen(false); } }}>
            <input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </form>

          <div className="mobile-drawer__links">
            {[
              { to: "/",         label: "Home",    icon: "🏠" },
              { to: "/products", label: "Shop",    icon: "🛍" },
              { to: "/about",    label: "About",   icon: "ℹ️" },
              { to: "/contact",  label: "Contact", icon: "✉️" },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} className={`mobile-link ${isActive(to) ? "mobile-link--active" : ""}`}>
                <span className="mobile-link__icon">{icon}</span> {label}
              </Link>
            ))}
            <div className="mobile-divider" />
            {user ? (
              <>
                <Link to="/profile" className="mobile-link"><span className="mobile-link__icon">👤</span> My Profile</Link>
                <Link to="/profile" className="mobile-link"><span className="mobile-link__icon">📦</span> My Orders</Link>
                <Link to="/profile" className="mobile-link"><span className="mobile-link__icon">♡</span> Wishlist</Link>
                {profile?.role === "admin" && <Link to="/admin" className="mobile-link"><span className="mobile-link__icon">🛠</span> Admin</Link>}
                <div className="mobile-divider" />
                <button className="mobile-logout" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <Link to="/signup" className="mobile-cta">Sign Up / Log In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation (Sticky) ── */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-item ${isActive("/") ? "active" : ""}`}>
          <span className="bottom-nav-icon">🏠</span>
          <span>Home</span>
        </Link>
        <Link to="/products" className={`bottom-nav-item ${isActive("/products") ? "active" : ""}`}>
          <span className="bottom-nav-icon">🛍</span>
          <span>Shop</span>
        </Link>
        <Link to="/cart" className={`bottom-nav-item ${isActive("/cart") ? "active" : ""}`}>
          <div style={{position: 'relative'}}>
            <span className="bottom-nav-icon">🛒</span>
            {count > 0 && <span className="bottom-nav-badge">{count}</span>}
          </div>
          <span>Cart</span>
        </Link>
        <Link to={user ? "/profile" : "/signup"} className={`bottom-nav-item ${isActive("/profile") || isActive("/signup") || isActive("/login") ? "active" : ""}`}>
          <span className="bottom-nav-icon">👤</span>
          <span>Profile</span>
        </Link>
      </div>

      <style>{`
        /* ═══ Announcement Bar ═══ */
        .nav-announce {
          background: var(--dark, #1a1a2e);
          text-align: center;
          padding: 0.5rem 1rem;
        }
        .nav-announce p {
          margin: 0; font-size: 0.72rem; font-weight: 500;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.04em;
        }

        /* ═══ Navbar ═══ */
        .navbar {
          position: sticky;
          top: 0; left: 0; right: 0;
          z-index: 999;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: box-shadow 0.3s;
        }
        .navbar--scrolled { box-shadow: 0 4px 30px rgba(0,0,0,0.06); }
        .navbar__inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 2rem; height: 64px;
          display: flex; align-items: center; gap: 2.5rem;
        }
        .navbar__spacer { height: 96px; } /* announce (32) + nav (64) */

        /* Logo */
        .navbar__logo {
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none; flex-shrink: 0;
        }
        .logo__icon { font-size: 1.1rem; color: #e91e8c; }
        .logo__text {
          display: flex; flex-direction: column; line-height: 1.15;
          font-size: 0.92rem; font-weight: 700; color: #1a1a2e;
          letter-spacing: -0.01em;
        }
        .logo__text span {
          font-size: 0.65rem; font-weight: 500; color: #e91e8c;
          letter-spacing: 0.05em; text-transform: uppercase;
        }

        /* Nav links */
        .navbar__links {
          display: flex; list-style: none; margin: 0; padding: 0;
          gap: 0.15rem; flex: 1;
        }
        .nav-link {
          display: block; padding: 0.45rem 0.9rem;
          font-size: 0.85rem; font-weight: 500; color: #555;
          text-decoration: none; border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .nav-link:hover { color: #1a1a2e; background: #f7f7f8; }
        .nav-link--active {
          color: #e91e8c !important;
          background: rgba(233,30,140,0.06) !important;
          font-weight: 600;
        }

        /* Actions */
        .navbar__actions {
          display: flex; align-items: center; gap: 0.25rem; margin-left: auto;
        }
        .action-btn {
          position: relative; width: 40px; height: 40px;
          border-radius: 10px; border: none; background: none;
          cursor: pointer; color: #555;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .action-btn:hover { background: #f5f5f7; color: #1a1a2e; }
        .action-badge {
          position: absolute; top: 3px; right: 3px;
          min-width: 16px; height: 16px;
          background: #e91e8c; color: #fff;
          font-size: 9px; font-weight: 700;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px; border: 2px solid #fff;
        }

        /* Search dropdown */
        .nav-search-wrap { position: relative; }
        .nav-search-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 300px; display: flex;
          background: #fff; border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,0.08);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }
        .nav-search-dropdown input {
          flex: 1; border: none; padding: 0.75rem 1rem;
          font-size: 0.9rem; outline: none;
          font-family: inherit;
        }
        .nav-search-submit {
          background: #e91e8c; color: #fff;
          border: none; padding: 0 1rem;
          font-size: 1.1rem; cursor: pointer;
          transition: background 0.2s;
        }
        .nav-search-submit:hover { background: #c2185b; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* User avatar */
        .user-menu { position: relative; }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #e91e8c, #c2185b);
          border: 2px solid transparent; color: #fff;
          font-size: 0.75rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; transition: border-color 0.2s, transform 0.15s;
        }
        .user-avatar:hover { border-color: #e91e8c; transform: scale(1.06); }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Dropdown */
        .user-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 220px; background: #fff; border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          overflow: hidden; animation: slideDown 0.18s ease;
        }
        .dropdown-header { padding: 0.85rem 1rem 0.7rem; }
        .dropdown-name { margin: 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e; }
        .dropdown-email { margin: 0.1rem 0 0; font-size: 0.72rem; color: #999; }
        .dropdown-divider { height: 1px; background: #f3f3f5; }
        .dropdown-item {
          display: block; padding: 0.6rem 1rem;
          font-size: 0.84rem; color: #555;
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #f8f8fa; color: #1a1a2e; }
        .dropdown-item--admin { color: #e91e8c; font-weight: 600; }
        .dropdown-item--admin:hover { background: #fff0f8; }
        .dropdown-item--logout { color: #ef4444; }
        .dropdown-item--logout:hover { background: #fef2f2; }

        /* CTA button */
        .navbar__cta {
          padding: 0.45rem 1.15rem;
          background: #1a1a2e; color: #fff;
          border-radius: 8px; font-size: 0.82rem;
          font-weight: 600; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .navbar__cta:hover { background: #e91e8c; transform: translateY(-1px); }

        /* Mobile toggle */
        .mobile-toggle {
          display: none; background: none; border: none;
          cursor: pointer; padding: 6px; border-radius: 8px;
        }
        .mobile-toggle:hover { background: #f5f5f7; }
        .hamburger { display: flex; flex-direction: column; gap: 5px; }
        .hamburger span {
          display: block; width: 20px; height: 2px;
          background: #1a1a2e; border-radius: 2px;
          transition: all 0.3s; transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile overlay */
        .mobile-overlay {
          position: fixed; inset: 0; z-index: 998;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s;
        }
        .mobile-overlay--open { opacity: 1; pointer-events: auto; }

        /* Mobile drawer */
        .mobile-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 300px; max-width: 85vw; z-index: 1000;
          background: #fff;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
          box-shadow: -8px 0 30px rgba(0,0,0,0.1);
        }
        .mobile-drawer--open { transform: translateX(0); }
        .mobile-drawer__header {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 1.25rem 1.25rem 0.75rem;
          border-bottom: 1px solid #f3f3f5;
        }
        .mobile-close {
          margin-left: auto; background: none; border: none;
          font-size: 1.2rem; cursor: pointer; color: #999;
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .mobile-close:hover { background: #f5f5f7; color: #333; }

        .mobile-search {
          padding: 0.75rem 1.25rem;
        }
        .mobile-search input {
          width: 100%; padding: 0.65rem 1rem;
          border: 1.5px solid #e8e8ec; border-radius: 10px;
          font-size: 0.9rem; font-family: inherit;
          transition: border-color 0.2s;
        }
        .mobile-search input:focus { border-color: #e91e8c; outline: none; }

        .mobile-drawer__links {
          flex: 1; overflow-y: auto;
          padding: 0.5rem 1rem 1.5rem;
          display: flex; flex-direction: column; gap: 0.15rem;
        }
        .mobile-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 0.75rem;
          font-size: 0.95rem; font-weight: 500; color: #444;
          text-decoration: none; border-radius: 10px;
          transition: background 0.15s, color 0.15s;
        }
        .mobile-link__icon { font-size: 1.1rem; width: 24px; text-align: center; }
        .mobile-link:hover { background: #f7f7f8; color: #1a1a2e; }
        .mobile-link--active { color: #e91e8c; background: rgba(233,30,140,0.05); font-weight: 600; }
        .mobile-divider { height: 1px; background: #f3f3f5; margin: 0.5rem 0; }
        .mobile-logout {
          display: block; width: 100%;
          padding: 0.75rem 0.75rem;
          background: none; border: none;
          text-align: left; font-size: 0.95rem; font-weight: 500;
          color: #ef4444; border-radius: 10px; cursor: pointer;
          transition: background 0.15s;
        }
        .mobile-logout:hover { background: #fef2f2; }
        .mobile-cta {
          display: block; padding: 0.8rem;
          background: #1a1a2e; color: #fff;
          border-radius: 10px; text-align: center;
          font-weight: 600; text-decoration: none;
          margin-top: 0.5rem; transition: background 0.2s;
        }
        .mobile-cta:hover { background: #e91e8c; }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .navbar__links { display: none; }
          .mobile-toggle { display: flex; }
          .navbar__cta   { display: none; }
          .navbar__inner { gap: 1rem; }
        }
        @media (max-width: 600px) {
          .navbar__inner { padding: 0 1rem; height: 56px; }
          .nav-announce { padding: 0.4rem 0.75rem; }
          .nav-announce p { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          
          /* Hide desktop cart/user buttons since we have bottom nav */
          #nav-cart-btn, #nav-user-btn, #nav-wishlist-btn, #nav-search-btn { display: none; }

          /* Bottom Nav styling */
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(0,0,0,0.08);
            z-index: 999;
            height: auto;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
            justify-content: space-around;
            align-items: center;
          }
          .bottom-nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #888; text-decoration: none; font-size: 0.65rem; font-weight: 500;
            width: 100%; height: 60px; gap: 0.15rem;
            transition: color 0.2s;
            -webkit-tap-highlight-color: transparent;
          }
          .bottom-nav-item.active { color: #e91e8c; }
          .bottom-nav-icon { font-size: 1.25rem; }
          .bottom-nav-badge {
            position: absolute; top: -4px; right: -8px;
            background: #e91e8c; color: #fff; font-size: 9px; font-weight: 700;
            min-width: 16px; height: 16px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; padding: 0 3px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;