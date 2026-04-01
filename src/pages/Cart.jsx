import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.imageUrl) return product.imageUrl;
  return null;
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '160px 1rem 8rem', textAlign: 'center' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          background: 'var(--primary-light)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <ShoppingBag size={60} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--secondary)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 3rem' }}>Explore our premium textile collection and add items you love to your bag.</p>
        <Link to="/collections" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Browse Collection <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '80px 0 3rem' }}>
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Your <span className="gradient-text">Cart</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{cartCount} premium items selected</p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', 
          gap: '2.5rem', 
          alignItems: 'start' 
        }} className="cart-grid">
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.product._id}-${item.size}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card"
                  style={{ padding: '1.25rem', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="cart-item-content">
                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      background: '#F1F5F9', 
                      borderRadius: 'var(--radius-md)', 
                      flexShrink: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      border: '1px solid var(--border)'
                    }}>
                      {getProductImage(item.product)
                        ? <img src={getProductImage(item.product).startsWith('http') ? getProductImage(item.product) : `${API_URL}${getProductImage(item.product)}`} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ShoppingBag size={32} color="#94A3B8" opacity={0.3} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.25rem' }}>{item.product.name}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {item.product.category?.name}{item.size ? ` · Size: ${item.size}` : ''}
                          </p>
                        </div>
                        <button className="btn-icon" style={{ color: 'var(--danger)', background: 'transparent' }} onClick={() => removeFromCart(item.product._id, item.size)}>
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} className="cart-item-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '0.25rem 0.5rem' }}>
                          <button onClick={() => updateQuantity(item.product._id, item.size, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
                          <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center', color: 'var(--secondary)' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Subtotal</p>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)' }}>₹{(item.product.saleRate * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {cart.map(item => (
                <div key={`${item.product._id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.product.name} <strong style={{ color: 'var(--secondary)' }}>× {item.quantity}</strong></span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{(item.product.saleRate * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span>Standard Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed var(--border)', margin: '1.5rem 0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
              onClick={() => navigate('/checkout')}
            >Checkout Securely <ArrowRight size={18} /></button>
            
            <Link to="/collections" style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              ← Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .cart-grid > div:last-child {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .cart-item-content {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .cart-item-content > div:first-child {
            width: 100% !important;
            height: 200px !important;
          }
          .cart-item-footer {
            flex-direction: row !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
