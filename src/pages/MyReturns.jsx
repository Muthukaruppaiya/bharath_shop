import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  RotateCcw, Package, CheckCircle, Clock, AlertCircle,
  Truck, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import API_URL from '../config/api';

const RETURN_STEPS = [
  { key: 'Requested', label: 'Requested', desc: 'Return request submitted' },
  { key: 'Approved', label: 'Approved', desc: 'Approved by seller' },
  { key: 'Pickup Scheduled', label: 'Pickup', desc: 'Pickup scheduled' },
  { key: 'Picked Up', label: 'Picked Up', desc: 'Item picked up' },
  { key: 'Refund Processing', label: 'Refund', desc: 'Refund being processed' },
  { key: 'Refunded', label: 'Refunded', desc: 'Refund completed' },
];

const STATUS_CONFIG = {
  'Requested': { bg: '#FEF9C3', color: '#854D0E' },
  'Approved': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Rejected': { bg: '#FEE2E2', color: '#991B1B' },
  'Pickup Scheduled': { bg: '#E0E7FF', color: '#3730A3' },
  'Picked Up': { bg: '#F3E8FF', color: '#7C3AED' },
  'Refund Processing': { bg: '#FFF7ED', color: '#C2410C' },
  'Refunded': { bg: '#D1FAE5', color: '#065F46' },
};

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchReturns(); }, []);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('shopToken');
      const res = await axios.get(`${API_URL}/api/return-orders/my-returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReturns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem 2rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '1.25rem 0.75rem 3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My <span className="gradient-text">Returns</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{returns.length} return{returns.length !== 1 ? 's' : ''}</p>
      </header>

      {returns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <RotateCcw size={48} color="#DC2626" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No returns yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Your return requests will appear here</p>
          <Link to="/my-orders" className="btn btn-primary">View Orders</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {returns.map((ret, idx) => {
            const statusConf = STATUS_CONFIG[ret.status] || STATUS_CONFIG['Requested'];
            const isExpanded = expandedId === ret._id;
            const stepIdx = RETURN_STEPS.findIndex(s => s.key === ret.status);
            const isRejected = ret.status === 'Rejected';

            return (
              <motion.div
                key={ret._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                {/* Card Header - Always Visible */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ret._id)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px',
                    background: statusConf.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <RotateCcw size={20} color={statusConf.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace', color: '#DC2626' }}>#{ret.returnCode}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Order #{ret.orderCode} · {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      fontSize: '0.65rem', fontWeight: 700,
                      background: statusConf.bg, color: statusConf.color,
                    }}>{ret.status}</span>
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#DC2626', marginTop: '0.25rem' }}>₹{ret.totalRefundAmount.toLocaleString()}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ borderTop: '1px solid var(--border)', padding: '1rem', background: '#FAFAFA' }}
                  >
                    {/* Return Stepper */}
                    {!isRejected && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Return Progress</p>
                        <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                          {RETURN_STEPS.map((step, idx) => {
                            const isCompleted = idx < stepIdx;
                            const isCurrent = idx === stepIdx;
                            return (
                              <div key={step.key} style={{
                                display: 'flex', gap: '0.75rem', paddingBottom: idx < RETURN_STEPS.length - 1 ? '0.75rem' : 0,
                                position: 'relative',
                              }}>
                                {idx < RETURN_STEPS.length - 1 && (
                                  <div style={{
                                    position: 'absolute', left: '-15px', top: '14px', bottom: 0,
                                    width: '2px', background: isCompleted ? 'var(--primary)' : '#E2E8F0',
                                  }} />
                                )}
                                <div style={{
                                  position: 'absolute', left: '-22px',
                                  width: '16px', height: '16px', borderRadius: '50%',
                                  background: isCompleted ? 'var(--primary)' : isCurrent ? 'white' : 'white',
                                  border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : '#E2E8F0'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {isCompleted && <CheckCircle size={10} color="white" />}
                                </div>
                                <p style={{
                                  fontSize: '0.8rem',
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCompleted || isCurrent ? 'var(--secondary)' : '#94A3B8',
                                }}>{step.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', background: '#FEE2E2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <p>Return request was rejected by the seller.</p>
                      </div>
                    )}

                    {/* Items */}
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Items</p>
                    {ret.items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                        padding: '0.5rem', background: 'white', borderRadius: '8px',
                        marginBottom: '0.4rem', border: '1px solid var(--border)',
                      }}>
                        <Package size={16} color="#94A3B8" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>₹{item.total.toLocaleString()}</p>
                      </div>
                    ))}

                    {/* Reason */}
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#FFF7ED', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C2410C', marginBottom: '0.25rem' }}>REASON</p>
                      <p style={{ fontSize: '0.8rem', color: '#9A3412' }}>{ret.returnReason}</p>
                    </div>

                    {/* Admin Notes */}
                    {ret.adminNotes && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>SELLER NOTE</p>
                        <p style={{ fontSize: '0.8rem', color: '#15803D' }}>{ret.adminNotes}</p>
                      </div>
                    )}

                    {/* Refund */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#FEE2E2', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#991B1B' }}>Refund Amount</span>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#DC2626' }}>₹{ret.totalRefundAmount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReturns;
