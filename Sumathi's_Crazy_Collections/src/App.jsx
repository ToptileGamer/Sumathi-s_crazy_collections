import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider }     from "./hooks/useAuth";
import { CartProvider }     from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";
import { useAuth }          from "./hooks/useAuth";
import { Analytics }        from "@vercel/analytics/react";

import Navbar           from "./components/Navbar";
import Footer           from "./components/Footer";
import useBlinkingTitle from "./pages/useBlinkingTitle";

import Home              from "./pages/Home";
import Products          from "./pages/Products";
import ProductDetails    from "./pages/ProductDetails";
import Cart              from "./pages/Cart";
import Checkout          from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile           from "./pages/Profile";
import Auth              from "./pages/Auth";
import About             from "./pages/About";
import Contact           from "./pages/Contact";
import FAQ               from "./pages/FAQ";
import Shipping          from "./pages/Shipping";
import Returns           from "./pages/Returns";
import Privacy           from "./pages/Privacy";
import Terms             from "./pages/Terms";
import NotFound          from "./pages/NotFound";
import AdminDashboard    from "./pages/admin/AdminDashboard";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function AppInner() {
  useBlinkingTitle();
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <div className="navbar__spacer" />}
      <main className="min-h-screen bg-white text-gray-800">
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/products"           element={<Products />} />
          <Route path="/product/:slug"      element={<ProductDetails />} />
          <Route path="/about"              element={<About />} />
          <Route path="/contact"            element={<Contact />} />
          <Route path="/faq"                element={<FAQ />} />
          <Route path="/shipping"           element={<Shipping />} />
          <Route path="/returns"            element={<Returns />} />
          <Route path="/privacy"            element={<Privacy />} />
          <Route path="/terms"              element={<Terms />} />
          <Route path="/login"              element={<Auth />} />
          <Route path="/signup"             element={<Auth />} />
          <Route path="/cart"               element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout"           element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*"                   element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <Analytics />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppInner />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}