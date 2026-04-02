import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, User, ThumbsUp, CheckCircle, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useShopAuth } from '../context/ShopAuthContext';
import API_URL from '../config/api';

const getImages = (p) => {
  const imgs = [];
  if (p.images?.length > 0) imgs.push(...p.images);
  else if (p.imageUrl) imgs.push(p.imageUrl);
  return imgs;
};

const imgSrc = (img) => img?.startsWith('http') ? img : `${API_URL}${img}`;

const StarRating = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} fill={i <= rating ? '#F59E0B' : 'none'} color={i <= rating ? '#F59E0B' : '#CBD5E1'} />
    ))}
  </div>
);

const StarInput = ({ rating, setRating, size = 28 }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} onClick={() => setRating(i)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
        transform: i <= rating ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.15s',
      }}>
        <Star size={size} fill={i <= rating ? '#F59E0B' : 'none'} color={i <= rating ? '#F59E0B' : '#CBD5E1'} />
      </button>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { customer } = useShopAuth();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/shop`);
        setAllProducts(res.data);
        const item = res.data.find(x => x._id === id);
        if (item) {
          const related = res.data.filter(x => x.name === item.name);
          setVariants(related);
          setProduct(item);
          setSelectedSize(item.size || '');
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
    setImgIdx(0);
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id, reviewPage]);

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);
      const res = await axios.get(`${API_URL}/api/reviews/${id}?page=${reviewPage}&limit=10`);
      if (reviewPage === 1) {
        setReviews(res.data.reviews);
      } else {
        setReviews(prev => [...prev, ...res.data.reviews]);
      }
      setReviewStats(res.data.stats);
      setTotalReviewPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewTitle.trim() || !reviewComment.trim()) {
      alert('Please fill all fields and select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('shopToken');
      await axios.post(`${API_URL}/api/reviews`, {
        productId: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');
      setReviewPage(1);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      const token = localStorage.getItem('shopToken');
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="loading-page">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading product...</p>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)' }}>
      <Package size={64} opacity={0.2} style={{ marginBottom: '1rem' }} />
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>Product not found</h2>
      <Link to="/collections" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Collection</Link>
    </div>
  );

  const images = getImages(product);
  const sizes = variants.filter(v => v.size).map(v => v.size);
  const avgRating = reviewStats?.avgRating ? Number(reviewStats.avgRating.toFixed(1)) : 0;
  const totalReviews = reviewStats?.totalReviews || 0;

  const related = allProducts
    .filter(p => (p.category?._id === product.category?._id || p.category === product.category) && p.name !== product.name)
    .slice(0, 4);

  const hasReviewed = reviews.some(r => r.customer === customer?._id);

  return (
    <div className="animate-fade-in">
      <div className="container" style={{ padding: '1.5rem 0.75rem 3rem' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="detail-grid">
          {/* Image Gallery */}
          <div>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', background: '#F1F5F9', position: 'relative'
            }}>
              {images.length > 0 ? (
                <img src={imgSrc(images[imgIdx])} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={64} opacity={0.2} />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => i === 0 ? images.length - 1 : i - 1)} style={{
                    position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}><ChevronLeft size={18} /></button>
                  <button onClick={() => setImgIdx(i => i === images.length - 1 ? 0 : i + 1)} style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}><ChevronRight size={18} /></button>
                  <span style={{
                    position: 'absolute', bottom: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px',
                    borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600
                  }}>{imgIdx + 1}/{images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{
                    width: '60px', height: '60px', flexShrink: 0, borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden', cursor: 'pointer',
                    border: imgIdx === i ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: imgIdx === i ? 1 : 0.6, transition: 'all 0.2s'
                  }}>
                    <img src={imgSrc(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="badge" style={{ background: 'var(--primary-light)', color: '#92400E', marginBottom: '0.75rem' }}>{product.category?.name}</span>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <StarRating rating={Math.round(avgRating)} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>{avgRating}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
            </div>

            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>₹{product.saleRate?.toLocaleString()}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>per {product.unit}</p>

            {product.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.9rem' }}>{product.description}</p>
            )}

            {sizes.length > 1 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>Size</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sizes.map(s => (
                    <button key={s} onClick={() => { setSelectedSize(s); setProduct(variants.find(v => v.size === s)); setImgIdx(0); }} style={{
                      padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                      borderColor: selectedSize === s ? 'var(--primary)' : 'var(--border)',
                      background: selectedSize === s ? 'var(--primary-light)' : 'white',
                      color: selectedSize === s ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.8rem'
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Qty</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.2rem', border: '1px solid var(--border)' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} onClick={handleAdd}>
                <ShoppingCart size={18} />
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <section style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Customer Reviews</h2>
            {customer && !hasReviewed && (
              <button onClick={() => setShowReviewForm(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Write a Review
              </button>
            )}
          </div>

          {/* Rating Overview */}
          {totalReviews > 0 && reviewStats && (
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{avgRating}</p>
                <StarRating rating={Math.round(avgRating)} size={16} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{totalReviews} reviews</p>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviewStats[`${['', 'one', 'two', 'three', 'four', 'five'][star]}Star`] || 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '12px' }}>{star}</span>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: '4px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '24px', textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login Prompt */}
          {!customer && (
            <div style={{ padding: '1rem', background: '#FEF9C3', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} color="#854D0E" />
              <p style={{ fontSize: '0.85rem', color: '#854D0E' }}>
                <Link to="/login" style={{ color: '#854D0E', fontWeight: 700, textDecoration: 'underline' }}>Log in</Link> to write a review
              </p>
            </div>
          )}

          {/* Review Form Modal */}
          <AnimatePresence>
            {showReviewForm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowReviewForm(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
                />
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    maxHeight: '85vh', background: 'white', zIndex: 201,
                    borderRadius: '1.25rem 1.25rem 0 0', padding: '1.5rem',
                    overflowY: 'auto',
                  }}
                >
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Write a Review</h3>

                  {/* Rating */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>YOUR RATING *</p>
                    <StarInput rating={reviewRating} setRating={setReviewRating} />
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>REVIEW TITLE *</p>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      maxLength={100}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>YOUR REVIEW *</p>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="What did you like or dislike about this product?"
                      rows={4}
                      maxLength={1000}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>{reviewComment.length}/1000</p>
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewRating || !reviewTitle.trim() || !reviewComment.trim()}
                    style={{
                      width: '100%', padding: '0.85rem',
                      background: !reviewRating || !reviewTitle.trim() || !reviewComment.trim() ? '#E2E8F0' : 'var(--primary)',
                      color: !reviewRating || !reviewTitle.trim() || !reviewComment.trim() ? '#94A3B8' : 'white',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      fontWeight: 700, fontSize: '0.95rem',
                      cursor: !reviewRating || !reviewTitle.trim() || !reviewComment.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}
                  >
                    <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          {reviewLoading && reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <Star size={40} color="#CBD5E1" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.25rem' }}>No reviews yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Be the first to review this product</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review, idx) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: '1rem', background: 'white',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #F59E0B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.8rem',
                      }}>
                        {review.customerName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{review.customerName}</p>
                        {review.isVerifiedPurchase && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={11} color="#10B981" />
                            <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>Verified Purchase</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {customer && review.customer === customer._id && (
                      <button onClick={() => handleDeleteReview(review._id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                        color: '#94A3B8',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <StarRating rating={review.rating} size={13} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{review.title}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{review.comment}</p>
                </motion.div>
              ))}

              {reviewPage < totalReviewPages && (
                <button
                  onClick={() => setReviewPage(p => p + 1)}
                  style={{
                    width: '100%', padding: '0.75rem', background: '#F8FAFC',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                    color: 'var(--primary)',
                  }}
                >
                  Load More Reviews
                </button>
              )}
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>You May Also Like</h2>
            <div className="product-grid">
              {related.map((p, i) => {
                const img = p.images?.[0] || p.imageUrl;
                return (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ height: '160px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img ? <img src={imgSrc(img)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={32} opacity={0.2} />}
                      </div>
                    </Link>
                    <div style={{ padding: '0.75rem' }}>
                      <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                      </Link>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>₹{p.saleRate?.toLocaleString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
