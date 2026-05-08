import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Loading from '../../components/UI/Loading';

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', state: '', country: 'Kenya', postalCode: '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || 'Kenya',
          postalCode: user.address?.postalCode || '',
        },
      });
    }
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  const setAddress = (field, value) =>
    setForm(f => ({ ...f, address: { ...f.address, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-espresso-500 mb-8">My Profile</h1>

        <div className="card p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center font-serif text-2xl font-bold text-primary-500">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-serif font-bold text-xl text-espresso-500">{user.name}</p>
              <p className="text-cream-500 text-sm">{user.email}</p>
              <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-gold-100 text-gold-600' : 'bg-primary-100 text-primary-500'}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-xl font-bold text-espresso-500 mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+254700000000" className="input-field" />
              </div>
            </div>

            <p className="font-medium text-espresso-500 pt-2 border-t border-cream-200">Shipping Address</p>

            <div>
              <label className="label">Street Address</label>
              <input value={form.address.street} onChange={e => setAddress('street', e.target.value)} className="input-field" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input value={form.address.city} onChange={e => setAddress('city', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">County / State</label>
                <input value={form.address.state} onChange={e => setAddress('state', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Country</label>
                <input value={form.address.country} onChange={e => setAddress('country', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input value={form.address.postalCode} onChange={e => setAddress('postalCode', e.target.value)} className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
