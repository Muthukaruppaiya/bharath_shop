import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
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

const Collections = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/shop`),
          axios.get(`${API_URL}/api/categories/online`)
        ]);
        const unique = Array.from(new Map(pRes.data.map(p => [p.name, p])).values());
        setProducts(unique);
        setCategories(cRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const filtered = products.filter(p => {
    const match = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const cat = selectedCat ? p.category?._id === selectedCat : true;
    return match && cat;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Our <span className="gradient-text">Collection</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Browse our curated textile collection</p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }} />
          </div>
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ width: 'auto', minWidth: '140px', fontSize: '0.9rem' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <button onClick={() => setSelectedCat('')} style={{
            padding: '0.4rem 0.9rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit',
            background: !selectedCat ? 'var(--primary)' : 'white',
            color: !selectedCat ? 'white' : 'var(--text-muted)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>All</button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setSelectedCat(c._id)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', whiteSpace: 'nowrap',
              background: selectedCat === c._id ? 'var(--primary)' : 'white',
              color: selectedCat === c._id ? 'white' : 'var(--text-muted)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>{c.name}</button>
          ))}
        </div>

        {/* Count */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {loading ? (
          <div className="product-grid">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
            <p>No products found.</p>
            <button onClick={() => { setSearch(''); setSelectedCat(''); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((p, idx) => {
              const img = getImage(p);
              const isNew = new Date() - new Date(p.createdAt) < 7 * 24 * 60 * 60 * 1000;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="glass-card"
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
                >
                  {isNew && <div className="ribbon ribbon-new">New</div>}
                  <Link to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ height: '220px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {img
                        ? <img src={imgSrc(img)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                        : <ShoppingBag size={40} opacity={0.2} />
                      }
                    </div>
                  </Link>
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category?.name}</span>
                    <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                      <h3 style={{ margin: '0.2rem 0 0.4rem', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</h3>
                    </Link>
                    {p.size && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Size: {p.size}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '0.5rem' }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} fill={i <= 4 ? '#F59E0B' : 'none'} color={i <= 4 ? '#F59E0B' : '#CBD5E1'} />)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{p.saleRate?.toLocaleString()}</span>
                      <button
                        onClick={() => { addToCart(p, 1, p.size || ''); showToast(`${p.name} added!`); }}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'var(--primary)', color: 'white', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem',
              borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', zIndex: 200,
              boxShadow: '0 6px 20px rgba(217,119,6,0.4)'
            }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collections;
