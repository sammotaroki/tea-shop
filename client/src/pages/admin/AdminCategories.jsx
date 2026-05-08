import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTag } from 'react-icons/hi';
import Loading from '../../components/UI/Loading';

const emptyForm = { name: '', description: '', isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories/all');
      setCategories(data.data?.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive, existingImage: cat.image || '' });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products linked to it will be unaffected.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('isActive', form.isActive);
      if (imageFile) formData.append('image', imageFile);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editId) {
        await api.put(`/categories/${editId}`, formData, config);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', formData, config);
        toast.success('Category created!');
      }
      setForm(emptyForm);
      setEditId(null);
      setImageFile(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFile(null);
    setShowForm(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800 font-serif">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories total</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            New Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-4 font-serif">
            {editId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Green Tea, Black Tea, Herbal..."
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this tea category..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={e => setImageFile(e.target.files[0] || null)}
                className="input-field py-2 cursor-pointer"
              />
              {editId && form.existingImage && !imageFile && (
                <p className="text-xs text-cream-500 mt-1">Current image kept. Select a file to replace it.</p>
              )}
              {imageFile && <p className="text-xs text-primary-500 mt-1">{imageFile.name} selected</p>}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible to customers)
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editId ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-tea p-16 text-center">
          <HiOutlineTag className="w-12 h-12 text-primary-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No categories yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create your first tea category to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl shadow-tea border border-primary-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <HiOutlineTag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800">{cat.name}</h3>
                    {cat.slug && (
                      <span className="text-xs text-gray-400">/{cat.slug}</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    cat.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {cat.description && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
