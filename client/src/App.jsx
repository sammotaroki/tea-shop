import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Loading from './components/UI/Loading';

// Customer Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Login from './pages/customer/Login';
import Orders from './pages/customer/Orders';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';
import Profile from './pages/customer/Profile';
import OrderConfirmation from './pages/customer/OrderConfirmation';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminShipping from './pages/admin/AdminShipping';
import AdminSettings from './pages/admin/AdminSettings';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#3E2723', color: '#F5F0E8' } }} />
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<><Navbar /><div className="flex-grow"><Home /></div><Footer /></>} />
            <Route path="/shop" element={<><Navbar /><div className="flex-grow"><Shop /></div><Footer /></>} />
            <Route path="/product/:id" element={<><Navbar /><div className="flex-grow"><ProductDetail /></div><Footer /></>} />
            <Route path="/cart" element={<><Navbar /><div className="flex-grow"><Cart /></div><Footer /></>} />
            <Route path="/checkout" element={<><Navbar /><div className="flex-grow"><Checkout /></div><Footer /></>} />
            <Route path="/login" element={<><Navbar /><div className="flex-grow"><Login /></div><Footer /></>} />
            <Route path="/orders" element={<><Navbar /><div className="flex-grow"><Orders /></div><Footer /></>} />
            <Route path="/about" element={<><Navbar /><div className="flex-grow"><About /></div><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><div className="flex-grow"><Contact /></div><Footer /></>} />
            <Route path="/profile" element={<><Navbar /><div className="flex-grow"><Profile /></div><Footer /></>} />
            <Route path="/order/:id" element={<><Navbar /><div className="flex-grow"><OrderConfirmation /></div><Footer /></>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="shipping" element={<AdminShipping />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
