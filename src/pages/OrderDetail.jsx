import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShopAuth } from '../context/ShopAuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, User, RotateCcw, X, ChevronDown, AlertCircle
} from 'lucide-react';
import API_URL from '../config/api';

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock, desc: 'Your order has been placed' },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Order confirmed by seller' },
  { key: 'Shipped', label: 'Shipped', icon: Truck, desc: 'On the way to you' },
  { key: 'Delivered', label: 'Delivered', icon: Package, desc: 'Delivered successfully' },
];

const STATUS_CONFIG = {
  'Pending': { bg: '#FEF9C3', color: '#854D0E' },
  'Confirmed': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Shipped': { bg: '#F3E8FF', color: '#7C3AED' },
  'Delivered': { bg: '#D1FAE5', color: '#065F46' },
  'Cancelled': { bg: '#FEE2E2', color: '#991B1B' },
  'Return Requested': { bg: '#FFF7ED', color: '#C2410C' },
  'Returned': { bg: '#FEE2E2', color: '#991B1B' },
};

const RETURN_REASONS = [
  { id: 'damaged', label: 'Product is damaged or defective', desc: 'Item arrived broken, torn, or not working' },
  { id: 'wrong', label: 'Wrong product received', desc: 'Different item/color/size than ordered' },
  { id: 'not_as_described', label: 'Product not as described', desc: 'Looks different from website images' },
  { id: 'size', label: 'Size or fit issue', desc: 'Does not fit as expected' },
  { id: 'quality', label: 'Quality not as expected', desc: 'Material quality is below expectations' },
  { id: 'late', label: 'Late delivery', desc: 'Arrived after expected delivery date' },
  { id: 'changed', label: 'Changed my mind', desc: 'No longer need this item' },
  { id: 'other', label: 'Other reason', desc: 'Please specify in additional details' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('shopToken');
      const res = await axios.get(`${API_URL}/api/online-orders/my-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId) ? prev.filter(p => p !== productId) : [...prev, productId]
    );
  };

  const handleSubmitReturn = async () => {
    if (selectedItems.length === 0 || !selectedReason) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('shopToken');
      const items = order.items
        .filter(i => selectedItems.includes(i.product.toString()))
        .map(i => ({
          productId: i.product.toString(),
          quantity: i.quantity,
          reason: RETURN_REASONS.find(r => r.id === selectedReason)?.label || selectedReason,
        }));

      await axios.post(`${API_URL}/api/return-orders`, {
        orderId: order._id,
        items,
        returnReason: RETURN_REASONS.find(r => r.id === selectedReason)?.label + (extraDetails ? ` - ${extraDetails}` : ''),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowReturnModal(false);
      fetchOrder();
      alert('Return request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem 2rem', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>Order not found</div>;

  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
  const currentStep = ORDER_STEPS.findIndex(s => s.key === order.status);
  const canReturn = order.status === 'Delivered';
  const hasReturnRequest = order.status === 'Return Requested' || order.status === 'Returned';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <button onClick={() => navigate('/my-orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Order #{order.orderCode}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span style={{
          padding: '0.3rem 0.7rem', borderRadius: '999px',
          fontSize: '0.7rem', fontWeight: 700,
          background: statusConf.bg, color: statusConf.color,
        }}>{order.status}</span>
      </div>

      <div className="container" style={{ padding: '1rem 0.75rem 3rem', maxWidth: '700px' }}>

        {/* Cancelled / Return Banner */}
        {order.status === 'Cancelled' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#FEE2E2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#991B1B' }}>
            <XCircle size={20} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order Cancelled</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>This order has been cancelled.</p>
            </div>
          </div>
        )}

        {hasReturnRequest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#FFF7ED', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#C2410C' }}>
            <RotateCcw size={20} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.status === 'Returned' ? 'Order Returned' : 'Return Request Submitted'}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                <Link to="/my-returns" style={{ color: '#C2410C', textDecoration: 'underline' }}>View return status</Link>
              </p>
            </div>
          </div>
        )}

        {/* Tracking Stepper */}
        {order.status !== 'Cancelled' && !hasReturnRequest && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem' }}>
              Order Tracking
            </h3>
            <div style={{ position: 'relative' }}>
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} style={{ display: 'flex', gap: '1rem', paddingBottom: idx < ORDER_STEPS.length - 1 ? '1.5rem' : 0, position: 'relative' }}>
                    {/* Vertical Line */}
                    {idx < ORDER_STEPS.length - 1 && (
                      <div style={{
                        position: 'absolute', left: '15px', top: '32px', bottom: 0,
                        width: '2px',
                        background: isCompleted ? 'var(--primary)' : '#E2E8F0',
                      }} />
                    )}
                    {/* Circle */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: isCompleted ? 'var(--primary)' : isCurrent ? 'white' : 'white',
                      border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : '#E2E8F0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      {isCompleted ? (
                        <CheckCircle size={16} color="white" />
                      ) : (
                        <StepIcon size={14} color={isCurrent ? 'var(--primary)' : '#94A3B8'} />
                      )}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, paddingTop: '0.3rem' }}>
                      <p style={{
                        fontWeight: isCurrent ? 800 : 600,
                        fontSize: '0.9rem',
                        color: isCompleted || isCurrent ? 'var(--secondary)' : '#94A3B8',
                      }}>{step.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
            Items ({order.items.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                padding: '0.75rem', background: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{
                  width: '50px', height: '50px', background: 'white', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)', flexShrink: 0,
                }}>
                  <Package size={20} color="#94A3B8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.size && <span>Size: <strong style={{ color: 'var(--secondary)' }}>{item.size}</strong></span>}
                    <span>Qty: <strong style={{ color: 'var(--secondary)' }}>{item.quantity}</strong></span>
                  </div>
                </div>
                <p style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.95rem', flexShrink: 0 }}>₹{item.total.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivery Fee</span>
              <span style={{ fontWeight: 600, color: order.deliveryFee === 0 ? '#10B981' : 'inherit' }}>
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee?.toLocaleString()}`}
              </span>
            </div>
            {order.couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#065F46', fontSize: '0.9rem', fontWeight: 600 }}>
                  Coupon ({order.couponCode})
                </span>
                <span style={{ fontWeight: 700, color: '#065F46' }}>-₹{order.couponDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAYMENT</p>
              <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
            </div>
            <span style={{
              padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
              background: order.paymentStatus === 'Paid' ? '#D1FAE5' : '#FEF9C3',
              color: order.paymentStatus === 'Paid' ? '#065F46' : '#854D0E',
            }}>
              {order.paymentStatus === 'Paid' ? 'PAID' : 'PAY ON DELIVERY'}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
            Delivery Address
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <User size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{order.customerName}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Phone size={16} color="var(--primary)" />
              <span>{order.customerPhone}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{order.customerAddress}</span>
            </div>
          </div>
        </div>

        {/* Return Button */}
        {canReturn && (
          <button
            onClick={() => setShowReturnModal(true)}
            style={{
              width: '100%', padding: '1rem',
              background: 'white', color: '#DC2626',
              border: '2px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <RotateCcw size={18} /> Return This Order
          </button>
        )}

        {order.notes && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#FFFBEB', borderRadius: 'var(--radius-md)', border: '1px solid #FCD34D' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: '#92400E' }}>ORDER NOTES</p>
            <p style={{ fontSize: '0.85rem', color: '#78350F' }}>{order.notes}</p>
          </div>
        )}
      </div>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReturnModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                maxHeight: '90vh', background: 'white', zIndex: 201,
                borderRadius: '1.25rem 1.25rem 0 0',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
              }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Return Request</h2>
                <button onClick={() => setShowReturnModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {/* Step 1: Select Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Step 1: Select items to return
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items.map((item, i) => {
                      const isSelected = selectedItems.includes(item.product.toString());
                      return (
                        <div
                          key={i}
                          onClick={() => toggleItem(item.product.toString())}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem',
                            background: isSelected ? '#FEF2F2' : '#F8FAFC',
                            border: `2px solid ${isSelected ? '#FECACA' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                            border: `2px solid ${isSelected ? '#DC2626' : '#CBD5E1'}`,
                            background: isSelected ? '#DC2626' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && <CheckCircle size={14} color="white" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {item.size && `${item.size} · `}Qty: {item.quantity}
                            </p>
                          </div>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>₹{item.total.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Reason */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Step 2: Why do you want to return?
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {RETURN_REASONS.map(reason => (
                      <label
                        key={reason.id}
                        style={{
                          display: 'flex', gap: '0.75rem',
                          padding: '0.75rem',
                          background: selectedReason === reason.id ? '#EEF2FF' : '#F8FAFC',
                          border: `2px solid ${selectedReason === reason.id ? '#818CF8' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="returnReason"
                          value={reason.id}
                          checked={selectedReason === reason.id}
                          onChange={() => setSelectedReason(reason.id)}
                          style={{ accentColor: '#4F46E5', marginTop: '2px' }}
                        />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{reason.label}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{reason.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: Additional Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                    Step 3: Additional details (optional)
                  </h3>
                  <textarea
                    value={extraDetails}
                    onChange={e => setExtraDetails(e.target.value)}
                    placeholder="Describe the issue in more detail..."
                    rows={3}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', fontFamily: 'inherit',
                      fontSize: '0.85rem', resize: 'vertical',
                    }}
                  />
                </div>

                {/* Refund Info */}
                {selectedItems.length > 0 && (
                  <div style={{ padding: '1rem', background: '#FEE2E2', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#991B1B' }}>Estimated Refund</span>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#DC2626' }}>
                        ₹{order.items
                          .filter(i => selectedItems.includes(i.product.toString()))
                          .reduce((sum, i) => sum + i.total, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <button
                  onClick={handleSubmitReturn}
                  disabled={submitting || selectedItems.length === 0 || !selectedReason}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: selectedItems.length === 0 || !selectedReason ? '#E2E8F0' : '#DC2626',
                    color: selectedItems.length === 0 || !selectedReason ? '#94A3B8' : 'white',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontWeight: 700, fontSize: '0.95rem',
                    cursor: selectedItems.length === 0 || !selectedReason ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {submitting ? 'Submitting...' : `Submit Return (${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetail;
