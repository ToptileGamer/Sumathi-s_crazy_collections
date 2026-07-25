import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";
import { useAuth } from "./hooks/useAuth";
import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import useBlinkingTitle from "./pages/useBlinkingTitle";

import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedPage({ children, className }) {
  return (
    <motion.div className={className || "page-wrapper"} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}><div className="spinner" /><span>Loading your account...</span></div>;
  if (!user) return <Navigate to="/signup" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#888", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}><div className="spinner" /><span>Loading...</span></div>;
  if (!user) return <Navigate to="/signup" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function CookieBanner() {
  const [show, setShow] = useState(() => localStorage.getItem("cookie_consent") !== "accepted");
  const accept = () => { localStorage.setItem("cookie_consent", "accepted"); setShow(false); };
  const decline = () => { localStorage.setItem("cookie_consent", "declined"); setShow(false); };
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 2rem)", maxWidth: 560, background: "rgba(10, 10, 26, 0.95)", backdropFilter: "blur(20px)", color: "#fff", borderRadius: 16, padding: "1.25rem 1.5rem", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", zIndex: 9999, display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.06)" }}>
      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }} style={{ fontSize: "1.75rem", flexShrink: 0 }}>{String.fromCodePoint(0x1F36A)}</motion.span>
      <div style={{ flex: 1, minWidth: 180 }}>
        <p style={{ margin: "0 0 0.2rem", fontWeight: 700, fontSize: "0.9rem" }}>We use cookies</p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>We use cookies to improve your experience. By using our site you agree to our <a href="/privacy" style={{ color: "#e91e8c", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>.</p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={decline} style={{ padding: "0.5rem 1.1rem", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Decline</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={accept} style={{ padding: "0.5rem 1.25rem", border: "none", borderRadius: 8, background: "linear-gradient(135deg, #e91e8c, #a855f7)", color: "#fff", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}>Accept</motion.button>
      </div>
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ padding: "6rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
      <div className="spinner" />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: "#888", fontSize: "0.9rem", fontWeight: 500 }}>Loading...</motion.p>
    </div>
  );
}

function AppInner() {
  useBlinkingTitle();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollProgress />
      {!isAdmin && <Navbar />}
      <main className="min-h-screen" style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
              <Route path="/products" element={<AnimatedPage><Products /></AnimatedPage>} />
              <Route path="/product/:slug" element={<AnimatedPage><ProductDetails /></AnimatedPage>} />
              <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
              <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
              <Route path="/faq" element={<AnimatedPage><FAQ /></AnimatedPage>} />
              <Route path="/shipping" element={<AnimatedPage><Shipping /></AnimatedPage>} />
              <Route path="/returns" element={<AnimatedPage><Returns /></AnimatedPage>} />
              <Route path="/privacy" element={<AnimatedPage><Privacy /></AnimatedPage>} />
              <Route path="/terms" element={<AnimatedPage><Terms /></AnimatedPage>} />
              <Route path="/login" element={<AnimatedPage><Auth /></AnimatedPage>} />
              <Route path="/signup" element={<AnimatedPage><Auth /></AnimatedPage>} />
              <Route path="/cart" element={<AnimatedPage><ProtectedRoute><Cart /></ProtectedRoute></AnimatedPage>} />
              <Route path="/checkout" element={<AnimatedPage><ProtectedRoute><Checkout /></ProtectedRoute></AnimatedPage>} />
              <Route path="/order-confirmation" element={<AnimatedPage><ProtectedRoute><OrderConfirmation /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProtectedRoute><Profile /></ProtectedRoute></AnimatedPage>} />
              <Route path="/admin" element={<AnimatedPage><AdminRoute><AdminDashboard /></AdminRoute></AnimatedPage>} />
              <Route path="/delete-account" element={<AnimatedPage><DeleteAccount /></AnimatedPage>} />
              <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
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
