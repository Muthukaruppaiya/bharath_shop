import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <div className="shop-app">
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </div>

      <footer className="shop-footer">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#F8FAFC', marginBottom: '0.75rem', fontSize: '1rem' }}>Bharath Textiles</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Premium Indian textiles delivered to your doorstep.</p>
            </div>
            <div>
              <h4 style={{ color: '#F8FAFC', marginBottom: '0.75rem', fontSize: '1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <Link to="/">Home</Link>
                <Link to="/collections">Collections</Link>
                <Link to="/cart">Cart</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#F8FAFC', marginBottom: '0.75rem', fontSize: '1rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <Link to="/my-orders">Track Order</Link>
                <span style={{ fontSize: '0.85rem' }}>Free delivery on all orders</span>
                <span style={{ fontSize: '0.85rem' }}>7 days easy return</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#F8FAFC', marginBottom: '0.75rem', fontSize: '1rem' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <span>info@bharathtextiles.com</span>
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #334155', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem' }}>
            © 2026 Bharath Textiles. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
