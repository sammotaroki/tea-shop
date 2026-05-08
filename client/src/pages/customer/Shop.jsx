import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/Products/ProductCard';
import Loading from '../../components/UI/Loading';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams({ page: currentPage, limit: 12 });
        if (keyword) p.set('keyword', keyword);
        if (category) p.set('category', category);
        if (sort) p.set('sort', sort);
        const { data } = await api.get(`/products?${p}`);
        setProducts(data.data.products);
        setTotalPages(data.totalPages);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [currentPage, keyword, category, sort]);

  const updateFilter = (k, v) => {
    const p = new URLSearchParams(searchParams);
    v ? p.set(k, v) : p.delete(k);
    p.set('page', '1');
    setSearchParams(p);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4"><h1 className="font-serif text-4xl font-bold">Shop Our Teas</h1><p className="text-cream-200 mt-2">Premium teas for every mood.</p></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-outline btn-sm flex items-center space-x-2"><HiOutlineAdjustments className="w-4 h-4" /><span>Filters</span></button>
            {(keyword || category) && <button onClick={() => setSearchParams({})} className="text-sm text-red-500 flex items-center space-x-1"><HiOutlineX className="w-4 h-4" /><span>Clear</span></button>}
          </div>
          <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field w-auto text-sm">
            <option value="-createdAt">Newest</option><option value="price">Price: Low-High</option><option value="-price">Price: High-Low</option><option value="-rating">Top Rated</option>
          </select>
        </div>
        {showFilters && (
          <div className="card p-6 mb-8 animate-slide-down grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="label">Category</label><select value={category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field"><option value="">All</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
            <div><label className="label">Search</label><input value={keyword} onChange={(e) => updateFilter('keyword', e.target.value)} placeholder="Search teas..." className="input-field" /></div>
          </div>
        )}
        {loading ? <Loading /> : products.length === 0 ? (
          <div className="text-center py-20"><span className="text-6xl block mb-4">🍵</span><h3 className="font-serif text-2xl font-semibold mb-2">No teas found</h3><button onClick={() => setSearchParams({})} className="btn-primary mt-4">Clear Filters</button></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
            {totalPages > 1 && <div className="flex justify-center space-x-2 mt-12">{[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => updateFilter('page', String(i+1))} className={`w-10 h-10 rounded-lg font-semibold ${currentPage===i+1?'bg-primary-500 text-white':'bg-white text-espresso-500 hover:bg-cream-200'}`}>{i+1}</button>)}</div>}
          </>
        )}
      </div>
    </div>
  );
};
export default Shop;
