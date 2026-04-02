import { useState, useEffect } from 'react';
import { useShopAuth } from '../context/ShopAuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Package } from 'lucide-react';
import API_URL from '../config/api';

const STATUS_CONFIG = {
  'Pending': { bg: '#FEF9C3', color: '#854D0E' },
  'Confirmed': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Shipped': { bg: '#F3E8FF', color: '#7C3AED' },
  'Delivered': { bg: '#D1FAE5', color: '#065F46' },
  'Cancelled': { bg: '#FEE2E2', color: '#991B1B' },
  'Return Requested': { bg: '#FFF7ED', color: '#C2410C' },
  'Returned': { bg: '#FEE2E2', color: '#991B1B' },
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('shopToken');
      const res = await axios.get(`${API_URL}/api/online-orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem 2rem', color: 'var(--text-muted)' }}>Loading your orders...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '1.25rem 0.75rem 3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My <span className="gradient-text">Orders</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </header>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Start shopping to see your orders here</p>
          <Link to="/collections" className="btn btn-primary">Browse Collections</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map((order, idx) => {
            const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/order/${order._id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'all 0.2s',
                  }}
                  className="order-card-link"
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#F8FAFC',
                    borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Order</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--secondary)' }}>#{order.orderCode}</span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: statusConf.bg,
                      color: statusConf.color,
                    }}>{order.status}</span>
                  </div>

                  {/* Order Body */}
                  <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Item Preview */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'var(--bg-main)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}>
                      <Package size={24} color="#94A3B8" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.items[0]?.name}
                        {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>₹{order.total.toLocaleString()}</p>
                    </div>

                    <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`
        .order-card-link:hover {
          box-shadow: var(--card-hover-shadow) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
