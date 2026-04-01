import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useShopAuth } from '../context/ShopAuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { customer, logout } = useShopAuth();

  return (
    <nav className="navbar glass">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #D97706, #B45309)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '0.9rem'
          }}>B</div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Bharath <span className="gradient-text">Textiles</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>Home</Link>
          <Link to="/collections" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>Collections</Link>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/cart" className="btn-icon" style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                background: 'var(--primary)', color: 'white',
                fontSize: '0.6rem', width: '16px', height: '16px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, border: '2px solid white'
              }}>{cartCount}</span>
            )}
          </Link>

          {customer ? (
            <div style={{ position: 'relative' }} className="user-dropdown">
              <button className="btn-icon" style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.6rem', background: 'rgba(0,0,0,0.03)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
              }}>
                <User size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{customer.name.split(' ')[0]}</span>
                <ChevronDown size={12} />
              </button>
              <div className="dropdown-menu" style={{
                position: 'absolute', top: '100%', right: 0, width: '160px',
                padding: '0.4rem', marginTop: '0.5rem', visibility: 'hidden', opacity: 0,
                zIndex: 100, boxShadow: 'var(--card-shadow)', borderRadius: 'var(--radius-md)'
              }}>
                <Link to="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', borderRadius: '6px' }} className="hover-bg">
                  <ShoppingBag size={14} /> My Orders
                </Link>
                <button onClick={logout} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px', fontFamily: 'inherit' }} className="hover-bg">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
              Log In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className="btn-icon mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none' }}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', borderBottom: '1px solid var(--border)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>Home</Link>
          <Link to="/collections" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>Collections</Link>
          <Link to="/cart" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
          {customer && <Link to="/my-orders" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>My Orders</Link>}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
