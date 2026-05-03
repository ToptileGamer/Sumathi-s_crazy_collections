import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import useBlinkingTitle from "./pages/useBlinkingTitle";
import Auth from "./pages/Auth";



// Supabase providers
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";



function App() {
  useBlinkingTitle();
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Navbar />
            <main className="min-h-screen bg-white text-gray-800">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/login" element={<Auth />} />
              </Routes>
            </main>
            <Footer />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;