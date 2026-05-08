import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-cream-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-3xl">🍵</span>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-primary-500 group-hover:text-gold-400 transition-colors">
                Chai Heritage
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-cream-500 uppercase hidden md:block">Premium Tea Collection</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-espresso-500 hover:text-primary-500 transition-colors font-medium">Home</Link>
            <Link to="/shop" className="text-espresso-500 hover:text-primary-500 transition-colors font-medium">Shop</Link>
            <Link to="/about" className="text-espresso-500 hover:text-primary-500 transition-colors font-medium">About</Link>
            <Link to="/contact" className="text-espresso-500 hover:text-primary-500 transition-colors font-medium">Contact</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Toggle search" aria-expanded={searchOpen} className="p-2 text-espresso-500 hover:text-primary-500 transition-colors">
              <HiOutlineSearch className="w-5 h-5" aria-hidden="true" />
            </button>

            <Link to="/cart" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className="relative p-2 text-espresso-500 hover:text-primary-500 transition-colors">
              <HiOutlineShoppingBag className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-gold-400 text-espresso-500 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu" aria-expanded={userMenuOpen} className="flex items-center space-x-2 p-2 text-espresso-500 hover:text-primary-500 transition-colors">
                  <HiOutlineUser className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-card-hover border border-cream-300 py-2 z-50">
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-espresso-500 hover:bg-cream-100 hover:text-primary-500">Admin Dashboard</Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-espresso-500 hover:bg-cream-100 hover:text-primary-500">My Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-espresso-500 hover:bg-cream-100 hover:text-primary-500">My Orders</Link>
                      <hr className="my-1 border-cream-300" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary btn-sm">Sign In</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <Link to="/cart" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className="relative p-2">
              <HiOutlineShoppingBag className="w-5 h-5 text-espresso-500" aria-hidden="true" />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-gold-400 text-espresso-500 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu" aria-expanded={menuOpen} className="p-2 text-espresso-500">
              {menuOpen ? <HiOutlineX className="w-6 h-6" aria-hidden="true" /> : <HiOutlineMenu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-3 animate-slide-down">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teas, blends, origins..."
                className="input-field rounded-r-none"
                autoFocus
              />
              <button type="submit" className="btn-primary rounded-l-none px-6">Search</button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-cream-300 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">Shop</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">Contact</Link>
            <hr className="border-cream-300" />
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-primary-500 font-medium">Admin Dashboard</Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">My Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-espresso-500 font-medium">My Orders</Link>
                <button onClick={handleLogout} className="block py-2 text-red-500 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary block text-center">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
