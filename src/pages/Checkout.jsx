import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, MessageSquare, ShoppingBag, CheckCircle, CreditCard, Lock, ArrowRight, ShieldCheck, Truck, Home, Building, Flag, LogIn, Package, Tag, X, IndianRupee, Smartphone, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useShopAuth } from '../context/ShopAuthContext';
import API_URL from '../config/api';

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 999;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer, loading: authLoading } = useShopAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    doorNo: '', buildingName: '', streetArea: '', landmark: '',
    city: '', pincode: '', state: 'Tamil Nadu',
    notes: '', paymentMethod: 'COD'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const deliveryFee = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalTotal = cartTotal + deliveryFee - couponDiscount;

  useEffect(() => {
    if (customer) {
      setForm(prev => ({ ...prev, city: customer.city || '', pincode: customer.pincode || '' }));
      setStep(2);
    }
  }, [customer]);

  useEffect(() => {
    if (!authLoading && cart.length === 0) navigate('/cart');
  }, [cart, navigate, authLoading]);

  const validateStep2 = () => {
    const e = {};
    if (!form.pincode.match(/^6[0-4]\d{4}$/)) e.pincode = 'Valid TN pincode (60xxxx-64xxxx)';
    if (!form.doorNo.trim()) e.doorNo = 'Required';
    if (!form.streetArea.trim()) e.streetArea = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await axios.post(`${API_URL}/api/coupons/validate`, { code: couponCode, subtotal: cartTotal });
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  const handleSubmit = async () => {
    if (!customer) return navigate('/login');
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const fullAddress = `${form.doorNo}${form.buildingName ? ', ' + form.buildingName : ''}, ${form.streetArea}${form.landmark ? ', Near ' + form.landmark : ''}, ${form.city}, TN - ${form.pincode}`;
      await axios.post(`${API_URL}/api/online-customers`, { phone: customer.phone, name: customer.name, email: customer.email, pincode: form.pincode, address: fullAddress, city: form.city });
      const orderItems = cart.map(item => ({ product: item.product._id, name: item.product.name, sku: item.product.sku, quantity: item.quantity, price: item.product.saleRate, total: item.product.saleRate * item.quantity, size: item.size || '' }));
      const res = await axios.post(`${API_URL}/api/online-orders`, {
        customerName: customer.name, customerPhone: customer.phone, customerAddress: fullAddress,
        notes: form.notes, items: orderItems, subtotal: cartTotal, deliveryFee,
        couponCode: appliedCoupon?.coupon?.code || null, couponId: appliedCoupon?.coupon?._id || null,
        couponDiscount, total: finalTotal, paymentMethod: form.paymentMethod,
      });
      clearCart();
      navigate('/order-success', { state: { order: res.data } });
    } catch (err) { alert(err.response?.data?.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  const StepHeader = ({ num, title, active, done }) => (
    <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: done ? 'pointer' : 'default' }}
      onClick={() => done && setStep(num)}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--success)' : active ? 'var(--primary)' : '#FFF',
        color: done || active ? 'white' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '0.75rem',
        border: !done && !active ? '1px solid var(--border)' : 'none'
      }}>
        {done ? <CheckCircle size={14} /> : num}
      </div>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, flex: 1 }}>{title}</h2>
      {done && <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 600 }}>✓ Done</span>}
    </div>
  );

  const InputField = (icon, label, field, placeholder, maxLen) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>{icon}</span>
        <input maxLength={maxLen} placeholder={placeholder} value={form[field]}
          onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); }}
          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: `1px solid ${errors[field] ? '#EF4444' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }} />
      </div>
      {errors[field] && <p style={{ color: '#EF4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors[field]}</p>}
    </div>
  );

  const PaymentOption = ({ method, icon, title, desc, soon }) => (
    <div onClick={() => !soon && setForm(p => ({ ...p, paymentMethod: method }))}
      style={{
        padding: '0.85rem', borderRadius: 'var(--radius-md)', cursor: soon ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        border: form.paymentMethod === method ? '2px solid var(--primary)' : '1px solid var(--border)',
        background: form.paymentMethod === method ? 'var(--primary-light)' : 'transparent',
        opacity: soon ? 0.7 : 1
      }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--primary)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {form.paymentMethod === method && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
      </div>
      {icon}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{title}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{desc}</p>
      </div>
      {soon && <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.1rem 0.35rem', background: '#FEF9C3', color: '#854D0E', borderRadius: '3px' }}>SOON</span>}
    </div>
  );

  if (cart.length === 0 || authLoading) return null;

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 0', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <ShieldCheck size={24} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Checkout</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Complete your order</p>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* STEP 1: LOGIN */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 1 && !customer ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
            <StepHeader num={1} title="Login" active={step === 1 && !customer} done={!!customer} />
            {!customer && (
              <div style={{ padding: '0 1rem 1rem' }}>
                <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%', fontSize: '0.9rem' }}>
                  <LogIn size={16} /> Log In to Continue
                </Link>
              </div>
            )}
          </div>

          {/* STEP 2: ADDRESS */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 2 ? '2px solid var(--primary)' : '1px solid var(--border)', opacity: !customer ? 0.5 : 1, pointerEvents: !customer ? 'none' : 'auto' }}>
            <StepHeader num={2} title="Delivery Address" active={step === 2} done={step > 2} />
            <AnimatePresence>
              {step === 2 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '0 1rem 1rem' }}>
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    {InputField(<MapPin size={15} />, 'Pincode (Tamil Nadu)', 'pincode', '600001', 6)}
                    {form.pincode.match(/^6[0-4]\d{4}$/) ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0.75rem' }}>
                          {InputField(<Home size={15} />, 'Door/Flat', 'doorNo', '4B')}
                          {InputField(<Building size={15} />, 'Building (Optional)', 'buildingName', 'Apt')}
                        </div>
                        {InputField(<MapPin size={15} />, 'Street / Area', 'streetArea', 'Anna Nagar')}
                        {InputField(<Flag size={15} />, 'Landmark', 'landmark', 'Near Metro')}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {InputField(<MapPin size={15} />, 'City', 'city', 'Chennai')}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>State</label>
                            <input value="Tamil Nadu" disabled style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                          </div>
                        </div>
                        <button onClick={() => { if (validateStep2()) setStep(3); }} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}>
                          Continue to Order Review <ArrowRight size={16} />
                        </button>
                      </motion.div>
                    ) : form.pincode.length === 6 && (
                      <div style={{ padding: '0.65rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                        Only Tamil Nadu (60xxxx - 64xxxx)
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 3: ORDER SUMMARY */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 3 ? '2px solid var(--primary)' : '1px solid var(--border)', opacity: step < 3 ? 0.5 : 1, pointerEvents: step < 3 ? 'none' : 'auto' }}>
            <StepHeader num={3} title="Order Summary" active={step === 3} done={step > 3} />
            <AnimatePresence>
              {step === 3 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '0 1rem 1rem' }}>
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      {cart.map(item => (
                        <div key={`${item.product._id}-${item.size}`} style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.65rem', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={15} opacity={0.3} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.size ? `${item.size} · ` : ''}x{item.quantity}</p>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>₹{(item.product.saleRate * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Tag size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> COUPON
                      </label>
                      {appliedCoupon ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.6rem', background: '#D1FAE5', borderRadius: '8px', border: '1px solid #6EE7B7' }}>
                          <CheckCircle size={14} color="#065F46" />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#065F46' }}>{appliedCoupon.coupon.code}</span>
                            <span style={{ fontSize: '0.6rem', color: '#065F46', marginLeft: '0.5rem' }}>₹{couponDiscount} off</span>
                          </div>
                          <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={14} color="#991B1B" /></button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} placeholder="Enter code"
                              style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.8rem', padding: '0.5rem 0.6rem' }} />
                            <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                              style={{ padding: '0.5rem 0.8rem', background: !couponCode.trim() ? '#E2E8F0' : 'var(--primary)', color: !couponCode.trim() ? '#94A3B8' : 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: !couponCode.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                              {couponLoading ? '...' : 'Apply'}
                            </button>
                          </div>
                          {couponError && <p style={{ color: '#DC2626', fontSize: '0.65rem', marginTop: '0.2rem' }}>{couponError}</p>}
                        </>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span><Truck size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Delivery</span>
                        {deliveryFee === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : <span>₹{deliveryFee}</span>}
                      </div>
                      {deliveryFee > 0 && <p style={{ fontSize: '0.6rem', color: 'var(--primary)', marginTop: '-0.15rem' }}>Add ₹{(FREE_DELIVERY_THRESHOLD - cartTotal).toLocaleString()} more for free delivery</p>}
                      {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>
                          <span>Coupon</span><span>-₹{couponDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', color: 'var(--primary)' }}>
                        <span>Total</span><span>₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button onClick={() => setStep(4)} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}>
                      Continue to Payment <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 4: PAYMENT */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 4 ? '2px solid var(--success)' : '1px solid var(--border)', opacity: step < 4 ? 0.5 : 1, pointerEvents: step < 4 ? 'none' : 'auto' }}>
            <StepHeader num={4} title="Payment" active={step === 4} done={false} />
            <AnimatePresence>
              {step === 4 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '0 1rem 1rem' }}>
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <PaymentOption method="COD" icon={<IndianRupee size={16} color="var(--primary)" />} title="Cash on Delivery" desc="Pay when your order arrives" />
                      <PaymentOption method="UPI" icon={<Smartphone size={16} color="var(--primary)" />} title="UPI Payment" desc="GPay, PhonePe, Paytm" soon />
                      <PaymentOption method="Card" icon={<CreditCard size={16} color="var(--primary)" />} title="Credit / Debit Card" desc="Visa, Mastercard, RuPay" soon />
                      <PaymentOption method="NetBanking" icon={<Building2 size={16} color="var(--primary)" />} title="Net Banking" desc="All major banks" soon />
                    </div>

                    {form.paymentMethod !== 'COD' && (
                      <div style={{ padding: '0.6rem', background: '#FEF9C3', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#854D0E' }}>
                        This payment method coming soon. Use Cash on Delivery for now.
                      </div>
                    )}

                    {InputField(<MessageSquare size={15} />, 'Order Notes (Optional)', 'notes', 'Special instructions...')}

                    {/* Final Summary */}
                    <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PAYABLE</p>
                        <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>₹{finalTotal.toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <p>{cart.length} item{cart.length > 1 ? 's' : ''}</p>
                        <p>{form.paymentMethod === 'COD' ? 'Cash on Delivery' : form.paymentMethod}</p>
                      </div>
                    </div>

                    <button onClick={handleSubmit} className="btn" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', background: 'var(--success)', color: 'white', fontWeight: 800, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                      {loading ? 'Processing...' : <><Lock size={15} /> Place Order</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
