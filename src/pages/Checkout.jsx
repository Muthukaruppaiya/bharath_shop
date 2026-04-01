import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, MessageSquare, ShoppingBag, CheckCircle, CreditCard, Lock, ArrowRight, ShieldCheck, Truck, Home, Building, Flag, Mail, LogIn, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useShopAuth } from '../context/ShopAuthContext';
import API_URL from '../config/api';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer, loading: authLoading } = useShopAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    doorNo: '',
    buildingName: '',
    streetArea: '',
    landmark: '',
    city: '',
    pincode: '',
    state: 'Tamil Nadu',
    notes: '',
    paymentMethod: 'COD'
  });
  
  const [errors, setErrors] = useState({});

  // Auto-fill address if customer has it saved
  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        city: customer.city || '',
        pincode: customer.pincode || '',
        // Note: addressLine in DB might be concatenated, we'll let user re-enter granularly or just set city/pin
      }));
      setStep(2);
    }
  }, [customer]);

  useEffect(() => {
    if (!authLoading && cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate, authLoading]);

  const validateStep2 = () => {
    const e = {};
    if (!form.pincode.match(/^6[0-4]\d{4}$/)) e.pincode = 'Valid Tamil Nadu pincode required (60xxxx - 64xxxx)';
    if (!form.doorNo.trim()) e.doorNo = 'Door/Flat No. is required';
    if (!form.streetArea.trim()) e.streetArea = 'Street/Area Name is required';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = (currentStep) => {
    setErrors({});
    if (currentStep === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return navigate('/login');
    if (!validateStep2()) return;
    
    setLoading(true);
    try {
      // 1. Concatenate for Order Record
      const fullAddress = `${form.doorNo}${form.buildingName ? ', ' + form.buildingName : ''}, ${form.streetArea}${form.landmark ? ', Near ' + form.landmark : ''}, ${form.city}, TN - ${form.pincode}`;

      // 2. Save/Update Customer profile with latest address
      await axios.post(`${API_URL}/api/online-customers`, {
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        pincode: form.pincode,
        address: fullAddress, // simplified string for now
        city: form.city
      });

      // 3. Map Items
      const orderItems = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.product.saleRate,
        total: item.product.saleRate * item.quantity,
        size: item.size || ''
      }));

      // 4. Submit Order
      const res = await axios.post(`${API_URL}/api/online-orders`, {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: fullAddress,
        notes: form.notes,
        items: orderItems,
        subtotal: cartTotal,
        total: cartTotal
      });

      clearCart();
      navigate('/order-success', { state: { order: res.data } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon, label, field, placeholder, type = 'text', maxLength = undefined) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>{icon}</span>
          <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); }}
          style={{ 
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 3rem', 
            background: '#FFFFFF', 
            border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        />
      </div>
      {errors[field] && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 500 }}>{errors[field]}</p>}
    </div>
  );

  if (cart.length === 0 || authLoading) return null;

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 0', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <ShieldCheck size={32} color="var(--primary)" />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Secure Checkout</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fast & Reliable Delivery within Tamil Nadu</p>
          </div>
        </header>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', 
            gap: '2.5rem', 
            alignItems: 'start' 
          }} 
          className="checkout-grid"
        >
          
          {/* Left Column: Checkout Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* STEP 1: IDENTITY (LOGIN GATE) */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: !customer ? '2px solid var(--primary)' : '1px solid var(--border)', transition: '0.3s' }}>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: !customer ? 'rgba(217, 119, 6, 0.05)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: customer ? 'var(--success)' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {customer ? <CheckCircle size={18} /> : '1'}
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Login & Security</h2>
                </div>
              </div>
              
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {customer ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{customer.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{customer.email} | {customer.phone}</p>
                      </div>
                      <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        <ShieldCheck size={16} /> Verified
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Login to track your orders and save address details.</p>
                      <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', width: '100%' }}>
                        Log In to Continue <LogIn size={18} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: SHIPPING (GRANULAR ADDRESS) */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 2 ? '2px solid var(--primary)' : '1px solid var(--border)', transition: '0.3s', opacity: !customer ? 0.5 : 1, pointerEvents: !customer ? 'none' : 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: step === 2 ? 'rgba(217, 119, 6, 0.05)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > 2 ? 'var(--success)' : (step === 2 ? 'var(--primary)' : '#FFFFFF'), color: step < 2 ? 'var(--text-muted)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: step < 2 ? '1px solid var(--border)' : 'none' }}>
                    {step > 2 ? <CheckCircle size={18} /> : '2'}
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Delivery Address</h2>
                </div>
              </div>

              <AnimatePresence>
                {step === 2 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      
                      <div className="alert" style={{ background: 'var(--primary-light)', color: '#92400E', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontSize: '0.85rem' }}>
                        <Truck size={18} style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--primary)' }} />
                        Providing exact details like <strong>Door No.</strong> and <strong>Landmarks</strong> ensures your fabric arrives perfectly on time.
                      </div>

                      {/* TN Pincode Check First */}
                      {renderInput(<MapPin size={18} />, 'Pincode (Restricted to Tamil Nadu)', 'pincode', 'e.g. 600001 (6 digits)', 'text', 6)}

                      {form.pincode.match(/^6[0-4]\d{4}$/) ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                                {renderInput(<Home size={18} />, 'Door/Flat', 'doorNo', '4B')}
                                {renderInput(<Building size={18} />, 'Building/Apt Name (Optional)', 'buildingName', 'Elite Enclave')}
                            </div>
                            {renderInput(<MapPin size={18} />, 'Street / Area Name', 'streetArea', 'Anna Nagar West')}
                            {renderInput(<Flag size={18} />, 'Landmark (Helpful for Courier)', 'landmark', 'Near Metro Pillar 12')}
                          </div>
                          
                          {renderInput(<MapPin size={18} />, 'City', 'city', 'Chennai')}
                          <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>State</label>
                            <input type="text" value="Tamil Nadu" disabled style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.95rem' }} />
                          </div>

                          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-primary" onClick={() => nextStep(2)} style={{ width: '100%', padding: '1rem' }}>
                                Use This Address <ArrowRight size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ) : form.pincode.length === 6 && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                          Currently delivering only within Tamil Nadu. Pincodes must start with 60-64.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: PAYMENT */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: step === 3 ? '2px solid var(--success)' : '1px solid var(--border)', transition: '0.3s', opacity: step < 3 ? 0.5 : 1, pointerEvents: step < 3 ? 'none' : 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: step === 3 ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 3 ? 'var(--success)' : '#FFFFFF', color: step === 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: step < 3 ? '1px solid var(--border)' : 'none' }}>
                  3
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Review & Payment</h2>
              </div>
              
              <AnimatePresence>
                {step === 3 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div 
                          onClick={() => setForm(p => ({...p, paymentMethod: 'COD'}))}
                          style={{ padding: '1.25rem', border: form.paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: form.paymentMethod === 'COD' ? 'var(--primary-light)' : 'transparent' }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {form.paymentMethod === 'COD' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>Cash on Delivery (COD)</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Pay at your doorstep securely</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        {renderInput(<MessageSquare size={18} />, 'Add Notes to this order', 'notes', 'e.g. Please leave with security')}
                      </div>

                      <button onClick={handleSubmit} className="btn" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', background: 'var(--success)', color: 'white', fontWeight: 800, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }} disabled={loading}>
                        {loading ? 'Processing...' : (
                          <>
                            <Lock size={18} /> Confirm Order - ₹{cartTotal.toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="glass-card" 
            style={{ 
              padding: '2rem', 
              position: 'sticky', 
              top: '100px', 
              height: 'fit-content'
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <ShoppingBag size={18} color="var(--primary)" /> Order Review
            </h2>
            
            <div style={{ marginBottom: '2rem', maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
              {cart.map(item => (
                <div key={`${item.product._id}-${item.size}`} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={20} opacity={0.3} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{item.product.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.size ? `Size: ${item.size} | ` : ''}Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{(item.product.saleRate * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Standard Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', color: 'var(--primary)' }}>
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .checkout-grid > div:last-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;

