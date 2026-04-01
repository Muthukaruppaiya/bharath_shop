import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Star, Truck, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useShopAuth } from '../context/ShopAuthContext';
import API_URL from '../config/api';

const getImage = (p) => {
  if (p.images?.length > 0) return p.images[0];
  if (p.imageUrl) return p.imageUrl;
  return null;
};

const imgSrc = (img) => img?.startsWith('http') ? img : `${API_URL}${img}`;

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ height: '220px', borderRadius: 0 }} />
    <div className="skeleton-card-body">
      <div className="skeleton skeleton-text short" />
      <div className="skeleton skeleton-text full" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        <div className="skeleton" style={{ width: '70px', height: '20px' }} />
        <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, idx }) => {
  const { addToCart } = useCart();
  const img = getImage(product);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.06 }}
      className="glass-card"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
        <div style={{ height: '220px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {img
            ? <img src={imgSrc(img)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
            : <ShoppingBag size={40} opacity={0.2} />
          }
        </div>
      </Link>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category?.name}</span>
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
          <h3 style={{ margin: '0.2rem 0 0.4rem', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>{product.name}</h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '0.5rem' }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={10} fill={i <= 4 ? '#F59E0B' : 'none'} color={i <= 4 ? '#F59E0B' : '#CBD5E1'} />)}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '2px' }}>(4.0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{product.saleRate?.toLocaleString()}</span>
          <button
            onClick={() => addToCart(product, 1, product.size || '')}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--primary)', color: 'white', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s'
            }}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customer } = useShopAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/shop`);
        const unique = Array.from(new Map(res.data.map(p => [p.name, p])).values());
        setProducts(unique);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Gender-based filtering
  const userGender = customer?.gender || 'Other';

  // Products matching user gender (Male/Female) + Unisex products
  const genderFiltered = products.filter(p => {
    if (!p.gender || p.gender === 'Unisex') return true;
    if (userGender === 'Other') return true; // Show all for Other
    return p.gender === userGender;
  });

  // If no gender-specific results, fall back to all products
  const baseProducts = genderFiltered.length >= 4 ? genderFiltered : products;

  const suggested = [...baseProducts].sort(() => 0.5 - Math.random()).slice(0, 4);
  const recommended = [...baseProducts].sort((a, b) => b.stock - a.stock).slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section style={{
        padding: '4rem 0 3rem',
        background: 'linear-gradient(135deg, rgba(217,119,6,0.06), rgba(139,92,246,0.04))',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }} className="hero-grid">
            <div>
              <span className="badge" style={{ background: 'var(--primary-light)', color: '#92400E', marginBottom: '1rem' }}>New Collection 2026</span>
              <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
                The Art of <br /><span className="gradient-text">Fine Textiles</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6, maxWidth: '400px' }}>
                Premium Indian textiles — handpicked fabrics from traditional looms to your doorstep.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/collections" className="btn btn-primary">Shop Now <ArrowRight size={18} /></Link>
                <Link to="/collections" className="btn btn-outline">Browse Catalog</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {products.slice(0, 4).map((p, i) => {
                const img = getImage(p);
                return (
                  <Link key={i} to={`/product/${p._id}`} style={{
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    height: i === 0 ? '260px' : '160px', gridRow: i === 0 ? 'span 2' : 'auto',
                    background: '#F1F5F9', display: 'block', position: 'relative'
                  }}>
                    {img
                      ? <img src={imgSrc(img)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} opacity={0.2} /></div>
                    }
                  </Link>
                );
              })}
              {products.length === 0 && !loading && [1,2,3,4].map(i => (
                <div key={i} className="skeleton" style={{ height: i === 1 ? '260px' : '160px', borderRadius: 'var(--radius-lg)', gridRow: i === 1 ? 'span 2' : 'auto' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUGGESTED FOR YOU */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.5rem' }}>Suggested For You</h2>
            </div>
            <Link to="/collections" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : suggested.map((p, i) => <ProductCard key={p._id} product={p} idx={i} />)}
          </div>
        </div>
      </section>

      {/* RECOMMENDED */}
      <section style={{ padding: '3rem 0', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="#8B5CF6" />
              <h2 style={{ fontSize: '1.5rem' }}>Recommended</h2>
            </div>
            <Link to="/collections" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : recommended.map((p, i) => <ProductCard key={p._id} product={p} idx={i} />)}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { icon: Award, title: 'Premium Quality', desc: 'Hand-selected finest fabrics' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Quick & reliable shipping' },
              { icon: Star, title: 'Trusted Store', desc: '1000+ happy customers' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ padding: '1.5rem' }}>
                  <Icon size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
          h1 { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
