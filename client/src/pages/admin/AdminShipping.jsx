import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import Loading from '../../components/UI/Loading';

const AdminShipping = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', estimatedDays: '', regions: '' });

  const fetch = () => api.get('/shipping/all').then(r => { setOptions(r.data.data.options); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), regions: form.regions.split(',').map(r => r.trim()).filter(Boolean) };
    try {
      editing ? await api.put(`/shipping/${editing}`, data) : await api.post('/shipping', data);
      toast.success(editing ? 'Updated' : 'Created');
      setForm({ name: '', description: '', price: '', estimatedDays: '', regions: '' }); setEditing(null); setShowForm(false); fetch();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/shipping/${id}`); toast.success('Deleted'); fetch(); } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Loading />;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-espresso-500">Shipping Options</h1>
        <button onClick={() => { setForm({ name: '', description: '', price: '', estimatedDays: '', regions: '' }); setEditing(null); setShowForm(!showForm); }} className="btn-primary btn-sm flex items-center space-x-2"><HiOutlinePlus className="w-4 h-4" /><span>Add</span></button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Price (KES)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Est. Days</label><input value={form.estimatedDays} onChange={e => setForm({...form, estimatedDays: e.target.value})} required className="input-field" placeholder="5-7 business days" /></div>
            <div><label className="label">Regions (comma separated)</label><input value={form.regions} onChange={e => setForm({...form, regions: e.target.value})} className="input-field" placeholder="Kenya, Uganda" /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex space-x-3 mt-4"><button type="submit" className="btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-outline btn-sm">Cancel</button></div>
        </form>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(o => (
          <div key={o._id} className="bg-white rounded-xl shadow-card p-5">
            <div className="flex justify-between mb-2"><h3 className="font-serif font-bold text-espresso-500">{o.name}</h3>
              <div className="flex space-x-1">
                <button onClick={() => { setForm({ name: o.name, description: o.description || '', price: o.price, estimatedDays: o.estimatedDays, regions: o.regions?.join(', ') || '' }); setEditing(o._id); setShowForm(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(o._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-cream-500 mb-2">{o.description}</p>
            <div className="flex justify-between text-sm"><span className="font-bold text-primary-500">{formatPrice(o.price)}</span><span className="text-cream-500">{o.estimatedDays}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminShipping;
