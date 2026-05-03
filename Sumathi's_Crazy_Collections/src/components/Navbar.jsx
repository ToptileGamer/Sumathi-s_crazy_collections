import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { count }              = useCart();
  const { count: wishCount }   = useWishlist();
  const { user, profile }      = useAuth();
  const navigate               = useNavigate();

  const close = () => setShowMenu(false);

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo" onClick={close}>
          Sumathi's Crazy Collections
        </Link>

        <ul className={`nav-links ${showMenu ? "show" : ""}`}>
          {["Home", "Products", "About", "Contact"].map((item) => (
            <li key={item}>
              <Link
                to={`/${item === "Home" ? "" : item.toLowerCase()}`}
                onClick={close}
              >
                {item}
              </Link>
            </li>
          ))}

          {/* Wishlist */}
          <li>
            <Link to="/profile" onClick={close} className="cart-link"
              title="Wishlist" onClick={(e) => { close(); if (!user) { e.preventDefault(); navigate("/login"); } else navigate("/profile", { state: { tab: "wishlist" } }); }}>
              ♡ {wishCount > 0 && <span className="cart-badge">{wishCount}</span>}
            </Link>
          </li>

          {/* Cart */}
          <li>
            <Link to="/cart" onClick={close} className="cart-link">
              🛒 {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </li>

          {/* Auth */}
          <li>
            {user ? (
              <Link to="/profile" onClick={close} className="nav-profile">
                <span className="nav-avatar">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" />
                    : (profile?.full_name?.[0] ?? user.email[0]).toUpperCase()}
                </span>
              </Link>
            ) : (
              <Link to="/login" onClick={close} className="hero-btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                Log In
              </Link>
            )}
          </li>
        </ul>

        <span className="nav-toggle" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? "✖" : "☰"}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;