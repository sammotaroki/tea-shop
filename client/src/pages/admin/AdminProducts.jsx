import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import Loading from '../../components/UI/Loading';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '', weight: '', origin: '', brewingInstructions: '', featured: false });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchProducts = () => api.get('/products?limit=50').then(r => { setProducts(r.data.data.products); setLoading(false); });

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then(r => setCategories(r.data.data.categories));
  }, []);

  const resetForm = () => { setForm({ name: '', description: '', price: '', category: '', stock: '', weight: '', origin: '', brewingInstructions: '', featured: false }); setEditing(null); setShowForm(false); setImageFiles([]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      imageFiles.forEach(f => formData.append('images', f));
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await api.put(`/products/${editing}`, formData, config);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, config);
        toast.success('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category?._id || '', stock: p.stock, weight: p.weight || '', origin: p.origin || '', brewingInstructions: p.brewingInstructions || '', featured: p.featured });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-espresso-500">Products ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary btn-sm flex items-center space-x-2"><HiOutlinePlus className="w-4 h-4" /><span>Add Product</span></button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 mb-6 animate-slide-down">
          <h3 className="font-serif text-lg font-bold mb-4">{editing ? 'Edit Product' : 'New Product'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="label">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Price (KES)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="input-field"><option value="">Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
            <div><label className="label">Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Weight</label><input value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="input-field" placeholder="250g" /></div>
            <div><label className="label">Origin</label><input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="input-field" /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="label">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} className="input-field" /></div>
            <div className="sm:col-span-2"><label className="label">Brewing Instructions</label><input value={form.brewingInstructions} onChange={e => setForm({...form, brewingInstructions: e.target.value})} className="input-field" /></div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="label">Product Images (max 5, jpeg/png/webp)</label>
              <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={e => setImageFiles(Array.from(e.target.files))} className="input-field py-2 cursor-pointer" />
              {editing && <p className="text-xs text-cream-500 mt-1">Leave empty to keep existing images. Selecting new files will replace them.</p>}
              {imageFiles.length > 0 && <p className="text-xs text-primary-500 mt-1">{imageFiles.length} file(s) selected</p>}
            </div>
            <div className="flex items-center space-x-2 pt-6"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4" /><label className="text-sm font-medium">Featured</label></div>
          </div>
          <div className="flex space-x-3 mt-4"><button type="submit" className="btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button><button type="button" onClick={resetForm} className="btn-outline btn-sm">Cancel</button></div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-cream-200 bg-cream-50"><th className="text-left py-3 px-4">Product</th><th className="text-left py-3 px-4">Category</th><th className="text-right py-3 px-4">Price</th><th className="text-right py-3 px-4">Stock</th><th className="text-center py-3 px-4">Featured</th><th className="text-right py-3 px-4">Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-b border-cream-100 hover:bg-cream-50">
                <td className="py-3 px-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 rounded bg-cream-100 flex items-center justify-center text-lg">🍵</div><div><p className="font-semibold">{p.name}</p><p className="text-xs text-cream-500">{p.weight}</p></div></div></td>
                <td className="py-3 px-4">{p.category?.name}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatPrice(p.price)}</td>
                <td className="py-3 px-4 text-right"><span className={p.stock <= 5 ? 'text-red-500 font-bold' : ''}>{p.stock}</span></td>
                <td className="py-3 px-4 text-center">{p.featured ? '⭐' : '—'}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded mr-1"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><HiOutlineTrash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminProducts;
