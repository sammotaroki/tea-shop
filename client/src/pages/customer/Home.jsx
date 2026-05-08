import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import ProductCard from '../../components/Products/ProductCard';
import Loading from '../../components/UI/Loading';
import toast from 'react-hot-toast';
import { HiArrowRight, HiOutlineSparkles, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineGlobe } from 'react-icons/hi';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=6'),
          api.get('/categories'),
        ]);
        setFeatured(prodRes.data.data.products);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    try {
      await api.post('/newsletter', { email: newsletterEmail });
      toast.success("You're subscribed! Check your email for your 10% discount code.");
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.message || 'Subscription failed. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <HiOutlineSparkles className="w-4 h-4 text-gold-400" />
              <span>Premium Kenyan Tea Since Heritage</span>
            </span>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              The Finest Tea
              <span className="block text-gold-400">From Kenya's Highlands</span>
            </h1>
            <p className="text-lg md:text-xl text-cream-200 mb-8 leading-relaxed max-w-2xl">
              Discover our handpicked collection of premium teas, crafted from the lush green highlands 
              of Kenya. Every sip tells a story of tradition, quality, and passion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-gold text-lg px-8 py-4 flex items-center space-x-2">
                <span>Explore Our Teas</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all text-lg">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: HiOutlineSparkles, title: 'Premium Quality', desc: 'Hand-selected finest leaves' },
              { icon: HiOutlineTruck, title: 'Fast Delivery', desc: 'Same day in Nairobi' },
              { icon: HiOutlineShieldCheck, title: 'Secure Payments', desc: 'Cards & M-Pesa accepted' },
              { icon: HiOutlineGlobe, title: 'Global Shipping', desc: 'We ship worldwide' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-gold-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-espresso-500">{feature.title}</h4>
                  <p className="text-xs text-cream-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-heading">Explore Our Collection</h2>
              <p className="section-subheading mx-auto">From bold black teas to delicate white teas — find your perfect cup.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, idx) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className="group card p-6 text-center hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🍃
                  </div>
                  <h3 className="font-serif font-semibold text-espresso-500 group-hover:text-primary-500 transition-colors text-sm">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-heading">Featured Teas</h2>
              <p className="section-subheading">Our most loved and best-selling selections.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center space-x-2 text-primary-500 font-semibold hover:text-gold-500 transition-colors">
              <span>View All</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <Loading text="Loading featured teas..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="md:hidden mt-8 text-center">
            <Link to="/shop" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark-gradient text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Join the <span className="text-gold-400">Chai Heritage</span> Family
          </h2>
          <p className="text-cream-300 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get 10% off your first order, plus exclusive access 
            to new blends and seasonal collections.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleNewsletter}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button type="submit" disabled={newsletterLoading} className="btn-gold px-8 py-4">
              {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', text: 'The Kenya Highland Gold is simply the best tea I have ever tasted. The flavor is rich and smooth — I\'m hooked!', rating: 5, location: 'Nairobi' },
              { name: 'James O.', text: 'Love the Maasai Chai Spice blend! It reminds me of the chai my grandmother used to make. Authentic and delicious.', rating: 5, location: 'Mombasa' },
              { name: 'Emily K.', text: 'The gift set was perfect for my mother\'s birthday. Beautiful packaging and the teas are absolutely divine.', rating: 5, location: 'London' },
            ].map((review, idx) => (
              <div key={idx} className="card p-8 text-center">
                <div className="flex justify-center mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-gold-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-espresso-400 italic mb-4">"{review.text}"</p>
                <p className="font-serif font-semibold text-primary-500">{review.name}</p>
                <p className="text-xs text-cream-500">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
