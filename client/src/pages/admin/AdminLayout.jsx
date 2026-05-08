import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineChartBar, HiOutlineCube, HiOutlineClipboardList, HiOutlineTag, HiOutlineTruck, HiOutlineArrowLeft, HiOutlineCog } from 'react-icons/hi';
import Loading from '../../components/UI/Loading';

const links = [
  { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: HiOutlineCube, label: 'Products' },
  { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Orders' },
  { to: '/admin/categories', icon: HiOutlineTag, label: 'Categories' },
  { to: '/admin/shipping', icon: HiOutlineTruck, label: 'Shipping' },
  { to: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
];

const AdminLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-primary-500 text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/20">
          <h2 className="font-serif text-xl font-bold">🍵 Admin Panel</h2>
          <p className="text-xs text-cream-200 mt-1">Chai Heritage Management</p>
        </div>
        <nav className="flex-1 py-4">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-gold-400 border-r-4 border-gold-400' : 'text-cream-200 hover:bg-white/10 hover:text-white'}`}>
              <l.icon className="w-5 h-5" /><span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <NavLink to="/" className="flex items-center space-x-2 text-cream-200 hover:text-white text-sm"><HiOutlineArrowLeft className="w-4 h-4" /><span>Back to Store</span></NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="lg:hidden bg-primary-500 text-white p-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">🍵 Admin</h2>
          <div className="flex space-x-2">{links.map(l => <NavLink key={l.to} to={l.to} end={l.end} className={({isActive}) => `p-2 rounded ${isActive ? 'bg-white/20' : ''}`}><l.icon className="w-5 h-5" /></NavLink>)}</div>
        </div>
        <div className="p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
};
export default AdminLayout;
