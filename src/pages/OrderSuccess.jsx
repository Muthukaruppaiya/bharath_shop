import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="animate-fade-in" style={{ padding: '5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '2rem' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Placed! 🎉</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Thank you! Your order has been received.
          </p>
          {order?.orderCode && (
            <p style={{ marginBottom: '3rem' }}>
              Order Code: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem', letterSpacing: '1px' }}>{order.orderCode}</strong>
            </p>
          )}

          {order && (
            <div className="glass-card" style={{ textAlign: 'left', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 700 }}>Order Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <Phone size={16} />
                  <span>{order.customerPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{order.customerAddress}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.name}{item.size ? ` (${item.size})` : ''} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.total?.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '1.25rem', background: 'rgba(217,119,6,0.1)', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', border: '1px solid rgba(217,119,6,0.2)' }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              📞 Our team will contact you at <strong>{order?.customerPhone}</strong> to confirm your order soon.
              Payment can be done at the time of delivery.
            </p>
          </div>

          <Link to="/collections" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
