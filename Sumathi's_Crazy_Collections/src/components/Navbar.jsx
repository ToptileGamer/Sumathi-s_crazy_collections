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
  const dropRef                       = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const isActive = (path) => location.pathname === path;

  const initials = (profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase())
    ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <Link to="/" className="navbar__logo">
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

            {/* Wishlist */}
            <button className="action-btn" title="Wishlist"
              onClick={() => user ? navigate("/profile") : navigate("/login")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishCount > 0 ? "#e91e8c" : "none"} stroke={wishCount > 0 ? "#e91e8c" : "currentColor"} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishCount > 0 && <span className="action-badge">{wishCount}</span>}
            </button>

            {/* Cart */}
            <button className="action-btn" title="Cart" onClick={() => navigate("/cart")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {count > 0 && <span className="action-badge">{count}</span>}
            </button>

            {/* User */}
            {user ? (
              <div className="user-menu" ref={dropRef}>
                <button className="user-avatar" onClick={() => setDropOpen(v => !v)}>
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
              <Link to="/login" className="navbar__cta">Log In</Link>
            )}

            {/* Mobile toggle */}
            <button className="mobile-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <span className={`hamburger ${menuOpen ? "open" : ""}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}>
          <div className="mobile-menu__inner">
            {[
              { to: "/",         label: "Home"    },
              { to: "/products", label: "Shop"    },
              { to: "/about",    label: "About"   },
              { to: "/contact",  label: "Contact" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className={`mobile-link ${isActive(to) ? "mobile-link--active" : ""}`}>
                {label}
              </Link>
            ))}
            <div className="mobile-divider" />
            {user ? (
              <>
                <Link to="/profile" className="mobile-link">My Profile</Link>
                <Link to="/profile" className="mobile-link">My Orders</Link>
                {profile?.role === "admin" && <Link to="/admin" className="mobile-link">Admin Dashboard</Link>}
                <button className="mobile-logout" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <Link to="/login" className="mobile-cta">Log In / Sign Up</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="navbar__spacer" />

      <style>{`
        /* ════════════════════════════════════
           NAVBAR
        ════════════════════════════════════ */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 999;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: box-shadow 0.25s;
        }
        .navbar--scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .navbar__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 68px;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .navbar__spacer { height: 68px; }

        /* Logo */
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .logo__icon {
          font-size: 1.2rem;
          color: #e91e8c;
          line-height: 1;
        }
        .logo__text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.01em;
        }
        .logo__text span {
          font-size: 0.7rem;
          font-weight: 500;
          color: #e91e8c;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Nav links */
        .navbar__links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.25rem;
          flex: 1;
        }
        .nav-link {
          display: block;
          padding: 0.45rem 0.85rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .nav-link:hover { color: #1a1a2e; background: #f5f5f7; }
        .nav-link--active { color: #e91e8c !important; background: #fff0f8 !important; }

        /* Actions */
        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-left: auto;
        }
        .action-btn {
          position: relative;
          width: 40px; height: 40px;
          border-radius: 10px;
          border: none;
          background: none;
          cursor: pointer;
          color: #444;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .action-btn:hover { background: #f5f5f7; color: #1a1a2e; }
        .action-badge {
          position: absolute;
          top: 4px; right: 4px;
          min-width: 16px; height: 16px;
          background: #e91e8c;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px;
          border: 1.5px solid #fff;
        }

        /* User avatar */
        .user-menu { position: relative; }
        .user-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e91e8c, #c2185b);
          border: 2px solid transparent;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.15s;
        }
        .user-avatar:hover { border-color: #e91e8c; transform: scale(1.05); }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Dropdown */
        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dropdown-header { padding: 0.9rem 1rem 0.7rem; }
        .dropdown-name  { margin: 0; font-size: 0.875rem; font-weight: 600; color: #1a1a2e; }
        .dropdown-email { margin: 0.15rem 0 0; font-size: 0.75rem; color: #999; }
        .dropdown-divider { height: 1px; background: #f5f5f7; }
        .dropdown-item {
          display: block;
          padding: 0.65rem 1rem;
          font-size: 0.85rem;
          color: #444;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #fafafa; color: #1a1a2e; }
        .dropdown-item--admin { color: #e91e8c; font-weight: 600; }
        .dropdown-item--admin:hover { background: #fff0f8; }
        .dropdown-item--logout { color: #ef4444; }
        .dropdown-item--logout:hover { background: #fef2f2; }

        /* CTA button */
        .navbar__cta {
          padding: 0.5rem 1.25rem;
          background: #1a1a2e;
          color: #fff;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .navbar__cta:hover { background: #e91e8c; transform: translateY(-1px); }

        /* Mobile toggle */
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
        }
        .mobile-toggle:hover { background: #f5f5f7; }
        .hamburger { display: flex; flex-direction: column; gap: 5px; }
        .hamburger span {
          display: block;
          width: 22px; height: 2px;
          background: #1a1a2e;
          border-radius: 2px;
          transition: all 0.28s;
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile menu */
        .mobile-menu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease;
          background: #fff;
          border-top: 1px solid #f5f5f7;
        }
        .mobile-menu--open { max-height: 480px; }
        .mobile-menu__inner { padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .mobile-link {
          display: block;
          padding: 0.7rem 0.75rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #444;
          text-decoration: none;
          border-radius: 10px;
          transition: background 0.15s, color 0.15s;
        }
        .mobile-link:hover { background: #f5f5f7; color: #1a1a2e; }
        .mobile-link--active { color: #e91e8c; background: #fff0f8; }
        .mobile-divider { height: 1px; background: #f5f5f7; margin: 0.5rem 0; }
        .mobile-logout {
          display: block; width: 100%;
          padding: 0.7rem 0.75rem;
          background: none; border: none;
          text-align: left; font-size: 0.95rem; font-weight: 500;
          color: #ef4444; border-radius: 10px; cursor: pointer;
          transition: background 0.15s;
        }
        .mobile-logout:hover { background: #fef2f2; }
        .mobile-cta {
          display: block;
          padding: 0.8rem;
          background: #1a1a2e;
          color: #fff;
          border-radius: 10px;
          text-align: center;
          font-weight: 600;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: background 0.2s;
        }
        .mobile-cta:hover { background: #e91e8c; }

        /* Responsive */
        @media (max-width: 860px) {
          .navbar__links { display: none; }
          .mobile-toggle { display: flex; }
          .navbar__cta   { display: none; }
        }
        @media (max-width: 480px) {
          .navbar__inner { padding: 0 1rem; }
        }
      `}</style>
    </>
  );
};

export default Navbar;