import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider }     from "./hooks/useAuth";
import { CartProvider }     from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";
import { useAuth }          from "./hooks/useAuth";
import { Analytics }        from "@vercel/analytics/react";
import { useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { useEffect } from "react";

import Navbar           from "./components/Navbar";
import Footer           from "./components/Footer";
import useBlinkingTitle from "./pages/useBlinkingTitle";

import { lazy, Suspense } from "react";

const Home              = lazy(() => import("./pages/Home"));
const Products          = lazy(() => import("./pages/Products"));
const ProductDetails    = lazy(() => import("./pages/ProductDetails"));
const Cart              = lazy(() => import("./pages/Cart"));
const Checkout          = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Profile           = lazy(() => import("./pages/Profile"));
const Auth              = lazy(() => import("./pages/Auth"));
const About             = lazy(() => import("./pages/About"));
const Contact           = lazy(() => import("./pages/Contact"));
const FAQ               = lazy(() => import("./pages/FAQ"));
const Shipping          = lazy(() => import("./pages/Shipping"));
const Returns           = lazy(() => import("./pages/Returns"));
const Privacy           = lazy(() => import("./pages/Privacy"));
const Terms             = lazy(() => import("./pages/Terms"));
const NotFound          = lazy(() => import("./pages/NotFound"));
const AdminDashboard    = lazy(() => import("./pages/admin/AdminDashboard"));
const DeleteAccount     = lazy(() => import("./pages/DeleteAccount"));


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!user)   return <Navigate to="/signup" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!user)   return <Navigate to="/signup" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function CookieBanner() {
  const [show, setShow] = useState(() => {
    return localStorage.getItem("cookie_consent") !== "accepted";
  });

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position:   "fixed",
      bottom:     "1.25rem",
      left:       "50%",
      transform:  "translateX(-50%)",
      width:      "calc(100% - 2rem)",
      maxWidth:   560,
      background: "#1a1a2e",
      color:      "#fff",
      borderRadius: 16,
      padding:    "1.25rem 1.5rem",
      boxShadow:  "0 8px 40px rgba(0,0,0,0.25)",
      zIndex:     9999,
      display:    "flex",
      alignItems: "center",
      gap:        "1rem",
      flexWrap:   "wrap",
    }}>
      {/* Icon */}
      <span style={{ fontSize:"1.75rem", flexShrink:0 }}>🍪</span>

      {/* Text */}
      <div style={{ flex:1, minWidth:180 }}>
        <p style={{ margin:"0 0 0.2rem", fontWeight:700, fontSize:"0.9rem" }}>
          We use cookies
        </p>
        <p style={{ margin:0, fontSize:"0.78rem", color:"rgba(255,255,255,0.65)", lineHeight:1.5 }}>
          We use cookies to improve your experience. By using our site you agree to our{" "}
          <a href="/privacy" style={{ color:"#e91e8c", textDecoration:"none", fontWeight:600 }}>
            Privacy Policy
          </a>.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
        <button onClick={decline}
          style={{
            padding:      "0.5rem 1rem",
            border:       "1.5px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            background:   "transparent",
            color:        "rgba(255,255,255,0.65)",
            cursor:       "pointer",
            fontSize:     "0.82rem",
            fontWeight:   600,
            transition:   "all 0.18s",
          }}>
          Decline
        </button>
        <button onClick={accept}
          style={{
            padding:      "0.5rem 1.25rem",
            border:       "none",
            borderRadius: 8,
            background:   "#e91e8c",
            color:        "#fff",
            cursor:       "pointer",
            fontSize:     "0.82rem",
            fontWeight:   700,
            transition:   "all 0.18s",
          }}>
          Accept
        </button>
      </div>
    </div>
  );
}

function AppInner() {
  useBlinkingTitle();
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith("/admin");
  useEffect(() => {
  CapApp.addListener("appUrlOpen", async ({ url }) => {
    if (url.includes("login-callback")) {
      // Extract tokens from URL and set session
      const { data, error } = await supabase.auth.getSessionFromUrl({ url });
      if (data?.session) {
        // Session set — navigate to home
        navigate("/");
      }
    }
  });

  return () => { CapApp.removeAllListeners(); };
}, []);

  return (
    <>
      {!isAdmin && <Navbar />}

      <main className="min-h-screen bg-white text-gray-800">
        <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading...</div>}>
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
            <Route path="/delete-account"     element={<DeleteAccount />} />

            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
       <CookieBanner />
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