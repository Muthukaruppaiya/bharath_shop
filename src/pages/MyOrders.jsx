import { useState, useEffect } from 'react';
import { useShopAuth } from '../context/ShopAuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import API_URL from '../config/api';

const StatusStepper = ({ status }) => {
  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const currentStep = statuses.indexOf(status);
  
  if (status === 'Cancelled') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '1rem', 
        background: '#FEF2F2', 
        color: '#991B1B', 
        borderRadius: 'var(--radius-md)',
        marginTop: '1.5rem',
        fontWeight: 600,
        fontSize: '0.85rem'
      }}>
        <XCircle size={18} /> This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="stepper-container">
      <div className="stepper-line" />
      <div 
        className="stepper-line-active" 
        style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }} 
      />
      {statuses.map((s, idx) => (
        <div key={s} className={`step ${idx <= currentStep ? 'step-completed' : idx === currentStep + 1 ? 'step-active' : ''}`}>
          <div className="step-circle">
            {idx < currentStep ? <CheckCircle size={14} /> : idx + 1}
          </div>
          <span className="step-label">{s}</span>
        </div>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customer } = useShopAuth();

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
    <div className="container animate-fade-in" style={{ padding: '1.5rem 1rem 3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>My <span className="gradient-text">Orders</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your order delivery status</p>
      </header>

      {orders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          background: '#FFFFFF', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--primary-light)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <ShoppingBag size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>Your shopping bag is waiting to be filled with our exclusive textile collection.</p>
          <Link to="/collections" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={order._id}
              className="glass-card" 
              style={{ padding: '0', overflow: 'hidden' }}
            >
              {/* Card Header */}
              <div style={{ 
                background: '#F8FAFC', 
                padding: '1rem 1.25rem', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order</span>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.85rem' }}>#{order.orderCode}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Total</p>
                  <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>₹{order.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Card Content */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '1.5rem',
                }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.5px' }}>
                      <Package size={16} color="var(--primary)" /> Order Items
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            background: 'var(--bg-main)', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid var(--border)'
                          }}>
                            <Package size={20} color="#94A3B8" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '0.1rem' }}>{item.name}</p>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>Size: <strong style={{ color: 'var(--secondary)' }}>{item.size || 'N/A'}</strong></span>
                              <span>Qty: <strong style={{ color: 'var(--secondary)' }}>{item.quantity}</strong></span>
                            </div>
                          </div>
                          <p style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.95rem' }}>₹{item.total.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Order Tracking */}
                    <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.5px' }}>
                        <Truck size={16} color="var(--primary)" /> Tracking Status
                      </h3>
                      <StatusStepper status={order.status} />
                    </div>
                  </div>

                  {/* Sidebar / Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ 
                      padding: '1.5rem', 
                      background: '#F8FAFC', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)'
                    }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Delivery Address</p>
                      <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--secondary)', fontSize: '1rem' }}>{order.customerName}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>{order.customerAddress}</p>
                      <p style={{ fontWeight: 600, marginTop: '0.75rem', fontSize: '0.85rem' }}>Phone: {order.customerPhone}</p>
                    </div>

                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'var(--primary-light)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid rgba(217,119,6,0.1)',
                      color: '#92400E'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Clock size={16} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Estimated Delivery</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Usually delivered within 2-4 business days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid stacking helper */}
      <style>{`
        @media (max-width: 768px) {
          .stepper-container { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
