import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setSearchOpen(false); }, [location.pathname]);

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


  const navItems = [
    { to: "/",         label: "Home"     },
    { to: "/products", label: "Shop"     },
    { to: "/about",    label: "About"    },
    { to: "/contact",  label: "Contact"  },
  ];

  return (
    <>
      <motion.div className="nav-announce"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <p>✦ Free Shipping on orders above ₹999 &nbsp;•&nbsp; Handcrafted with Love ✦</p>
      </motion.div>

      <motion.nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className="navbar__inner">

          <motion.div whileHover={{ scale: 1.02 }}>
            <Link to="/" className="navbar__logo" id="navbar-logo">
              <motion.span className="logo__icon"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                ✦
              </motion.span>
              <span className="logo__text">Sumathi's<span>Crazy Collections</span></span>
            </Link>
          </motion.div>

          <ul className="navbar__links">
            {navItems.map(({ to, label }) => (
              <motion.li key={to} whileHover={{ y: -1 }}>
                <Link to={to} className={`nav-link ${isActive(to) ? "nav-link--active" : ""}`}>
                  {label}
                  {isActive(to) && (
                    <motion.div className="nav-active-indicator"
                      layoutId="navIndicator"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>

          <div className="navbar__actions">

            <div className="nav-search-wrap" ref={searchRef}>
              <motion.button className="action-btn" title="Search" id="nav-search-btn"
                onClick={() => setSearchOpen(v => !v)}
                whileHover={{ scale: 1.05, background: "#f5f5f7" }}
                whileTap={{ scale: 0.95 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </motion.button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.form className="nav-search-dropdown" onSubmit={handleSearch}
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.15 }}>
                    <input type="search" placeholder="Search products..." value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} autoFocus id="nav-search-input" />
                    <motion.button type="submit" className="nav-search-submit"
                      whileHover={{ background: "#c2185b" }}>→</motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <motion.button className="action-btn" title="Wishlist" id="nav-wishlist-btn"
              onClick={() => user ? navigate("/profile") : navigate("/signup")}
              whileHover={{ scale: 1.05, color: "#e91e8c" }}
              whileTap={{ scale: 0.95 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishCount > 0 ? "#e91e8c" : "none"} stroke={wishCount > 0 ? "#e91e8c" : "currentColor"} strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishCount > 0 && <motion.span className="action-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}>{wishCount}</motion.span>}
            </motion.button>

            <motion.button className="action-btn" title="Cart" id="nav-cart-btn" onClick={() => navigate("/cart")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {count > 0 && <motion.span className="action-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}>{count}</motion.span>}
            </motion.button>

            {user ? (
              <div className="user-menu" ref={dropRef}>
                <motion.button className="user-avatar" onClick={() => setDropOpen(v => !v)} id="nav-user-btn"
                  whileHover={{ scale: 1.06, borderColor: "#e91e8c", boxShadow: "0 0 20px rgba(233,30,140,0.25)" }}
                  whileTap={{ scale: 0.95 }}>
                  <span className="avatar-ring" />
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile?.full_name ?? "User"} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </motion.button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div className="user-dropdown"
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.15, originY: 0 }}>
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
                      <motion.button className="dropdown-item dropdown-item--logout" onClick={handleLogout}
                        whileHover={{ x: 2 }}>
                        ↩ Log Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/signup" className="navbar__cta" id="nav-login-btn">Sign Up</Link>
              </motion.div>
            )}

            <motion.button className="mobile-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Menu" id="nav-mobile-toggle"
              whileTap={{ scale: 0.9 }}>
              <span className={`hamburger ${menuOpen ? "open" : ""}`}>
                <span /><span /><span />
              </span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="mobile-drawer__header">
              <span className="logo__icon">✦</span>
              <span className="logo__text" style={{ color: "#1a1a2e" }}>Sumathi's<span>Crazy Collections</span></span>
              <motion.button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close"
                whileHover={{ rotate: 90 }}>
                ✕
              </motion.button>
            </div>

            <form className="mobile-search" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); setMenuOpen(false); } }}>
              <input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>

            <div className="mobile-drawer__links">
              {navItems.map(({ to, label }, i) => (
                <motion.div key={to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={to} className={`mobile-link ${isActive(to) ? "mobile-link--active" : ""}`}>
                    <span className="mobile-link__icon">{to === "/" ? "🏠" : to === "/products" ? "🛍" : to === "/about" ? "ℹ️" : "✉️"}</span> {label}
                  </Link>
                </motion.div>
              ))}
              <div className="mobile-divider" />
              {user ? (
                <>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Link to="/profile" className="mobile-link"><span className="mobile-link__icon mobile-link__icon--profile">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span> My Profile</Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <Link to="/profile" className="mobile-link"><span className="mobile-link__icon">📦</span> My Orders</Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Link to="/profile" className="mobile-link"><span className="mobile-link__icon">♡</span> Wishlist</Link>
                  </motion.div>
                  {profile?.role === "admin" && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <Link to="/admin" className="mobile-link"><span className="mobile-link__icon">🛠</span> Admin</Link>
                    </motion.div>
                  )}
                  <div className="mobile-divider" />
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <button className="mobile-logout" onClick={handleLogout}>Log Out</button>
                  </motion.div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Link to="/signup" className="mobile-cta">Sign Up / Log In</Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mobile-bottom-nav"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        {[
          { to: "/", label: "Home", icon: "🏠" },
          { to: "/products", label: "Shop", icon: "🛍" },
          { to: "/cart", label: "Cart", icon: "🛒", badge: count },
          { to: user ? "/profile" : "/signup", label: "Profile", icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          ) },
        ].map(({ to, label, icon, badge }) => (
          <Link key={to} to={to} className={`bottom-nav-item ${isActive(to) ? "active" : ""}`}>
            <span className="bottom-nav-icon" style={{ position: "relative" }}>
              <span className="bottom-nav-svg">{icon}</span>
              {badge > 0 && (
                <motion.span className="bottom-nav-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}>
                  {badge}
                </motion.span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </motion.div>

      <style>{`
        .nav-announce { background: var(--dark); text-align: center; padding: 0.5rem 1rem; }
        .nav-announce p { margin: 0; font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.7); letter-spacing: 0.04em; }
        .navbar { position: sticky; top: 0; left: 0; right: 0; z-index: 999; background: rgba(255,255,255,0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.05); transition: box-shadow 0.3s; }
        .navbar--scrolled { box-shadow: 0 4px 30px rgba(0,0,0,0.06); }
        .navbar__inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; height: 64px; display: flex; align-items: center; gap: 2.5rem; }
        .navbar__logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; flex-shrink: 0; }
        .logo__icon { font-size: 1.1rem; color: #e91e8c; }
        .logo__text { display: flex; flex-direction: column; line-height: 1.15; font-size: 0.92rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.01em; }
        .logo__text span { font-size: 0.65rem; font-weight: 500; color: #e91e8c; letter-spacing: 0.05em; text-transform: uppercase; }
        .navbar__links { display: flex; list-style: none; margin: 0; padding: 0; gap: 0.15rem; flex: 1; }
        .nav-link { display: flex; align-items: center; gap: 0.3rem; padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 500; color: #555; text-decoration: none; border-radius: 8px; transition: color 0.2s, background 0.2s; position: relative; }
        .nav-link:hover { color: #1a1a2e; background: #f7f7f8; }
        .nav-link--active { color: #e91e8c !important; background: rgba(233,30,140,0.06) !important; font-weight: 600; }
        .nav-active-indicator { position: absolute; bottom: 0; left: 0.5rem; right: 0.5rem; height: 2px; background: #e91e8c; border-radius: 2px; }
        .navbar__actions { display: flex; align-items: center; gap: 0.25rem; margin-left: auto; }
        .action-btn { position: relative; width: 40px; height: 40px; border-radius: 10px; border: none; background: none; cursor: pointer; color: #555; display: flex; align-items: center; justify-content: center; transition: background 0.2s, color 0.2s; }
        .action-badge { position: absolute; top: 3px; right: 3px; min-width: 16px; height: 16px; background: #e91e8c; color: #fff; font-size: 9px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #fff; z-index: 1; }
        .nav-search-wrap { position: relative; }
        .nav-search-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 300px; display: flex; background: #fff; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.08); box-shadow: 0 16px 40px rgba(0,0,0,0.12); overflow: hidden; z-index: 100; }
        .nav-search-dropdown input { flex: 1; border: none; padding: 0.75rem 1rem; font-size: 0.9rem; outline: none; font-family: inherit; }
        .nav-search-submit { background: #e91e8c; color: #fff; border: none; padding: 0 1rem; font-size: 1.1rem; cursor: pointer; transition: background 0.2s; }
        .nav-search-submit:hover { background: #c2185b; }
        .user-menu { position: relative; }
        .user-avatar { position: relative; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e91e8c, #c2185b); border: 2px solid transparent; color: #fff; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color 0.2s, box-shadow 0.3s; }
        .avatar-ring { position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid rgba(233,30,140,0.25); border-top-color: rgba(255,255,255,0.5); pointer-events: none; animation: avatarSpin 6s linear infinite; }
        @keyframes avatarSpin { to { transform: rotate(360deg); } }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-avatar svg { width: 18px; height: 18px; }
        .user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 220px; background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 16px 48px rgba(0,0,0,0.12); overflow: hidden; z-index: 100; }
        .dropdown-header { padding: 0.85rem 1rem 0.7rem; }
        .dropdown-name { margin: 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e; }
        .dropdown-email { margin: 0.1rem 0 0; font-size: 0.72rem; color: #999; }
        .dropdown-divider { height: 1px; background: #f3f3f5; }
        .dropdown-item { display: block; padding: 0.6rem 1rem; font-size: 0.84rem; color: #555; text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; text-align: left; transition: background 0.15s; }
        .dropdown-item:hover { background: #f8f8fa; color: #1a1a2e; }
        .dropdown-item--admin { color: #e91e8c; font-weight: 600; }
        .dropdown-item--admin:hover { background: #fff0f8; }
        .dropdown-item--logout { color: #ef4444; }
        .navbar__cta { padding: 0.45rem 1.15rem; background: #1a1a2e; color: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; white-space: nowrap; transition: background 0.2s, transform 0.15s; }
        .navbar__cta:hover { background: #e91e8c; transform: translateY(-1px); }
        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; }
        .hamburger { display: flex; flex-direction: column; gap: 5px; }
        .hamburger span { display: block; width: 20px; height: 2px; background: #1a1a2e; border-radius: 2px; transition: all 0.3s; transform-origin: center; }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-overlay { position: fixed; inset: 0; z-index: 998; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
        .mobile-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 300px; max-width: 85vw; z-index: 1000; background: #fff; display: flex; flex-direction: column; box-shadow: -8px 0 30px rgba(0,0,0,0.1); }
        .mobile-drawer__header { display: flex; align-items: center; gap: 0.5rem; padding: 1.25rem 1.25rem 0.75rem; border-bottom: 1px solid #f3f3f5; }
        .mobile-close { margin-left: auto; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .mobile-close:hover { background: #f5f5f7; color: #333; }
        .mobile-search { padding: 0.75rem 1.25rem; }
        .mobile-search input { width: 100%; padding: 0.65rem 1rem; border: 1.5px solid #e8e8ec; border-radius: 10px; font-size: 0.9rem; font-family: inherit; transition: border-color 0.2s; }
        .mobile-search input:focus { border-color: #e91e8c; outline: none; }
        .mobile-drawer__links { flex: 1; overflow-y: auto; padding: 0.5rem 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.15rem; }
        .mobile-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; font-size: 0.95rem; font-weight: 500; color: #444; text-decoration: none; border-radius: 10px; transition: background 0.15s, color 0.15s; }
        .mobile-link:hover { background: #f7f7f8; color: #1a1a2e; }
        .mobile-link--active { color: #e91e8c; background: rgba(233,30,140,0.05); font-weight: 600; }
        .mobile-link__icon { font-size: 1.1rem; width: 24px; text-align: center; }
        .mobile-divider { height: 1px; background: #f3f3f5; margin: 0.5rem 0; }
        .mobile-logout { display: block; width: 100%; padding: 0.75rem; background: none; border: none; text-align: left; font-size: 0.95rem; font-weight: 500; color: #ef4444; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
        .mobile-logout:hover { background: #fef2f2; }
        .mobile-cta { display: block; padding: 0.8rem; background: #1a1a2e; color: #fff; border-radius: 10px; text-align: center; font-weight: 600; text-decoration: none; margin-top: 0.5rem; transition: background 0.2s; }
        .mobile-cta:hover { background: #e91e8c; }
        .mobile-bottom-nav { display: none; }
        @media (max-width: 1024px) {
          .navbar__links { display: none; }
          .mobile-toggle { display: flex; }
          .navbar__cta { display: none; }
          .navbar__inner { gap: 1rem; }
        }
        @media (max-width: 600px) {
          .navbar__inner { padding: 0 1rem; height: 56px; }
          .nav-announce { padding: 0.4rem 0.75rem; }
          .nav-announce p { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          #nav-cart-btn, #nav-user-btn, #nav-wishlist-btn, #nav-search-btn { display: none; }
          .mobile-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); border-top: 1px solid rgba(0,0,0,0.08); z-index: 999; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -4px 20px rgba(0,0,0,0.05); justify-content: space-around; align-items: center; }
          .bottom-nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #888; text-decoration: none; font-size: 0.65rem; font-weight: 500; width: 100%; height: 60px; gap: 0.15rem; transition: color 0.2s; }
          .bottom-nav-item.active { color: #e91e8c; }
          .bottom-nav-icon { font-size: 1.25rem; position: relative; display: flex; align-items: center; justify-content: center; }
          .bottom-nav-svg { display: flex; align-items: center; justify-content: center; }
          .mobile-link__icon--profile { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; }
          .bottom-nav-item.active .bottom-nav-svg svg { color: #e91e8c; }
          .bottom-nav-badge { position: absolute; top: -4px; right: -10px; background: #e91e8c; color: #fff; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
