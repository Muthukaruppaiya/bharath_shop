import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

const getImages = (p) => {
  const imgs = [];
  if (p.images?.length > 0) imgs.push(...p.images);
  else if (p.imageUrl) imgs.push(p.imageUrl);
  return imgs;
};

const imgSrc = (img) => img?.startsWith('http') ? img : `${API_URL}${img}`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

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

  // Related products (same category, different name)
  const related = allProducts
    .filter(p => (p.category?._id === product.category?._id || p.category === product.category) && p.name !== product.name)
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: 'inherit'
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="detail-grid">
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
            {/* Thumbnails */}
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
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= 4 ? '#F59E0B' : 'none'} color={i <= 4 ? '#F59E0B' : '#CBD5E1'} />)}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>4.0 (24 reviews)</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>₹{product.saleRate?.toLocaleString()}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>per {product.unit}</p>

            {product.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>{product.description}</p>
            )}

            {/* Size Picker */}
            {sizes.length > 1 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Size</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sizes.map(s => (
                    <button key={s} onClick={() => { setSelectedSize(s); setProduct(variants.find(v => v.size === s)); setImgIdx(0); }} style={{
                      padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                      borderColor: selectedSize === s ? 'var(--primary)' : 'var(--border)',
                      background: selectedSize === s ? 'var(--primary-light)' : 'white',
                      color: selectedSize === s ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.85rem'
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Qty</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.25rem', border: '1px solid var(--border)' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.85rem' }} onClick={handleAdd}>
                <ShoppingCart size={18} />
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>You May Also Like</h2>
            <div className="product-grid">
              {related.map((p, i) => {
                const img = p.images?.[0] || p.imageUrl;
                return (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ height: '180px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img ? <img src={imgSrc(img)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={32} opacity={0.2} />}
                      </div>
                    </Link>
                    <div style={{ padding: '0.85rem' }}>
                      <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</h3>
                      </Link>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{p.saleRate?.toLocaleString()}</span>
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
          .detail-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
