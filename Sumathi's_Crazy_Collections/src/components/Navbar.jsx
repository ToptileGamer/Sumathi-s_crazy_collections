import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">Sumathi's Crazy Collections</Link>
        <ul className={`nav-links ${showMenu ? "show" : ""}`}>
          {["Home", "Products", "About", "Contact", "Profile"].map((item) => (
            <li key={item}>
              <Link
                to={`/${item === "Home" ? "" : item.toLowerCase()}`}
                onClick={() => setShowMenu(false)}
              >
                {item}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/cart" onClick={() => setShowMenu(false)} className="cart-link">
              Cart <span className="cart-badge">{itemCount}</span>
            </Link>
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
